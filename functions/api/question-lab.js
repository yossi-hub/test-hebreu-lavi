import { audioDevEnabled } from '../../lib/audio-dev.js';
import { questionSyncEnabled, QUESTION_SYNC_TABLE, SYNC_LEASE_MS, SYNC_COOLDOWN_MS } from '../../lib/question-sync.js';
import { labQuestionSet, publicLab, QUESTION_LAB_TABLE, LAB_DURATION_MS } from '../../lib/question-lab.js';
import { draft } from './question-set.js';

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
});

export async function onRequestGet({ request, env }) {
  if (!audioDevEnabled(request, env)) return json({ ok: false }, 404);
  try {
    const row = await labQuestionSet(env);
    return row ? json(publicLab(row)) : json({ ok: false, error: 'Charge tes questions depuis Airtable pour commencer.' }, 404);
  } catch { return json({ ok: false, error: 'Espace de test indisponible. Réessaie.' }, 503); }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!audioDevEnabled(request, env)) return json({ ok: false }, 404);
  if (!questionSyncEnabled(request, env) || !env.QUIZ_DB || !env.AIRTABLE_TOKEN) {
    return json({ ok: false, error: 'La connexion Airtable et l’environnement DEV doivent être configurés.' }, 503);
  }
  const url = new URL(request.url);
  if (request.headers.get('Origin') !== url.origin) return json({ ok: false, error: 'Ouvre l’espace de test DEV.' }, 403);
  if (url.search) return json({ ok: false, error: 'Modifie tes questions dans Airtable.' }, 400);
  // Le navigateur ne peut fournir ni contenu, ni source, ni critères d’évaluation.
  if (request.body) {
    const reader = request.body.getReader();
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      if (value.byteLength) { await reader.cancel(); return json({ ok: false, error: 'Modifie tes questions dans Airtable.' }, 400); }
    }
  }
  const lockUntil = Date.now() + SYNC_LEASE_MS;
  let locked = false;
  try {
    await env.QUIZ_DB.prepare(QUESTION_SYNC_TABLE).run();
    await env.QUIZ_DB.prepare('INSERT OR IGNORE INTO quiz_dev_sync (id) VALUES (1)').run();
    const lock = await env.QUIZ_DB.prepare('UPDATE quiz_dev_sync SET lock_until = ? WHERE id = 1 AND lock_until <= ?').bind(lockUntil, Date.now()).run();
    locked = Number(lock.meta?.changes ?? lock.changes) === 1;
    if (!locked) return json({ ok: false, error: 'Un chargement est en cours ou vient de terminer. Réessaie dans quelques secondes.' }, 429);
    const result = await draft(context, false, { includeAudioDrafts: true });
    if (result.errors.length) return json({ ok: false, error: 'Corrige ces champs dans Airtable, puis recharge tes questions.', errors: result.errors }, 422);
    const snapshot = { questions: result.snapshot.devAudioQuestions, draftQuestions: result.summary.audioDrafts };
    if (!snapshot.questions.length) return json({ ok: false, error: 'Ajoute tes questions avec Phase = Audio DEV dans Airtable.' }, 422);
    const version = crypto.randomUUID(), expiresAt = Date.now() + LAB_DURATION_MS;
    await env.QUIZ_DB.prepare(QUESTION_LAB_TABLE).run();
    await env.QUIZ_DB.prepare('INSERT INTO quiz_question_lab (id, snapshot, version, expires_at) VALUES (1, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET snapshot = excluded.snapshot, version = excluded.version, expires_at = excluded.expires_at')
      .bind(JSON.stringify(snapshot), version, expiresAt).run();
    return json(publicLab({ snapshot: JSON.stringify(snapshot), version, expires_at: expiresAt }));
  } catch { return json({ ok: false, error: 'Chargement impossible. Vérifie Airtable et réessaie.' }, 502); }
  finally {
    if (locked) {
      try { await env.QUIZ_DB.prepare('UPDATE quiz_dev_sync SET lock_until = ? WHERE id = 1 AND lock_until = ?').bind(Date.now() + SYNC_COOLDOWN_MS, lockUntil).run(); } catch { /* Le bail expire automatiquement. */ }
    }
  }
}
