import { audioDevEnabled } from '../../lib/audio-dev.js';
import { questionSyncEnabled, questionSetFingerprint, QUESTION_SYNC_TABLE, SYNC_LEASE_MS, SYNC_COOLDOWN_MS } from '../../lib/question-sync.js';
import { draft, published, publishQuestionSet } from './question-set.js';

const json = (body, status = 200, headers = {}) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
});

export function onRequestGet({ request, env }) {
  if (!audioDevEnabled(request, env)) return json({ ok: false, ready: false, error: 'Actualisation réservée à DEV.' }, 404);
  const missing = [];
  if (!env.AIRTABLE_TOKEN) missing.push('La connexion Airtable');
  if (!questionSyncEnabled(request, env) || !env.QUIZ_DB) missing.push('La publication DEV');
  return json({ ok: true, ready: missing.length === 0, missing });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!audioDevEnabled(request, env)) return json({ ok: false, error: 'Actualisation réservée à DEV.' }, 404);
  if (!questionSyncEnabled(request, env) || !env.QUIZ_DB || !env.AIRTABLE_TOKEN) {
    return json({ ok: false, error: 'La connexion Airtable et la publication DEV doivent être configurées.' }, 503);
  }
  const url = new URL(request.url);
  if (request.headers.get('Origin') !== url.origin) return json({ ok: false, error: 'Ouvre la page de mise à jour DEV.' }, 403);
  // Le navigateur déclenche uniquement une relecture. Il ne peut fournir
  // ni questions, ni prompts, ni base Airtable, ni fichiers à publier.
  if (url.search) return json({ ok: false, error: 'Cette actualisation ne reçoit aucun paramètre.' }, 400);
  if (request.body) {
    const reader = request.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value.byteLength) { await reader.cancel(); return json({ ok: false, error: 'Modifie les questions directement dans Airtable.' }, 400); }
    }
  }
  const lockUntil = Date.now() + SYNC_LEASE_MS;
  let locked = false;
  try {
    await env.QUIZ_DB.prepare(QUESTION_SYNC_TABLE).run();
    await env.QUIZ_DB.prepare('INSERT OR IGNORE INTO quiz_dev_sync (id) VALUES (1)').run();
    const lock = await env.QUIZ_DB.prepare('UPDATE quiz_dev_sync SET lock_until = ? WHERE id = 1 AND lock_until <= ?').bind(lockUntil, Date.now()).run();
    locked = Number(lock.meta?.changes ?? lock.changes) === 1;
    if (!locked) return json({ ok: false, error: 'Une actualisation est en cours ou vient de terminer. Réessaie dans quelques secondes.' }, 429, { 'Retry-After': '10' });
    const result = await draft(context, true);
    if (result.errors.length) return json({ ok: false, error: 'Les questions Airtable contiennent des erreurs. La version précédente est conservée.', errors: result.errors }, 422);
    const fingerprint = await questionSetFingerprint(result.snapshot);
    const state = await env.QUIZ_DB.prepare('SELECT source_hash, version FROM quiz_dev_sync WHERE id = 1').first();
    const current = await published(env);
    if (current && state.source_hash === fingerprint && state.version === current.version) {
      return json({ ok: true, updated: false, version: current.version, publishedAt: current.published_at, summary: result.summary });
    }
    const publication = await publishQuestionSet(context, result, version => [
      env.QUIZ_DB.prepare('UPDATE quiz_dev_sync SET source_hash = ?, version = ? WHERE id = 1').bind(fingerprint, version),
    ]);
    return json({ ...publication, updated: true });
  } catch (error) {
    console.error('Unable to synchronize DEV questions from Airtable', error);
    return json({ ok: false, error: 'Actualisation impossible. Vérifie la connexion Airtable et les fichiers audio, puis réessaie.' }, 502);
  } finally {
    if (locked) {
      try { await env.QUIZ_DB.prepare('UPDATE quiz_dev_sync SET lock_until = ? WHERE id = 1 AND lock_until = ?').bind(Date.now() + SYNC_COOLDOWN_MS, lockUntil).run(); }
      catch (error) { console.error('Unable to release DEV synchronization lease', error); }
    }
  }
}
