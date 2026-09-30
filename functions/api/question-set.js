import { compileQuestionSet, fetchAirtableQuestions, parseBaseScript } from '../../lib/question-set.js';

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
});

function authorized(request, env) {
  const expected = String(env.QUIZ_ADMIN_TOKEN || '');
  const given = request.headers.get('Authorization') || '';
  const actual = given.startsWith('Bearer ') ? given.slice(7) : '';
  if (expected.length < 24 || actual.length !== expected.length) return false;
  let difference = 0;
  for (let i = 0; i < expected.length; i += 1) difference |= expected.charCodeAt(i) ^ actual.charCodeAt(i);
  return difference === 0;
}

async function draft(context, requireReady = false) {
  const asset = await context.env.ASSETS.fetch(new URL('/questions.js', context.request.url));
  if (!asset.ok) throw new Error(`Questions de référence ${asset.status}`);
  const base = parseBaseScript(await asset.text());
  const records = await fetchAirtableQuestions(context.env);
  return compileQuestionSet(base, records, { requireReady });
}

async function published(env) {
  if (!env.QUIZ_DB) return null;
  try {
    return await env.QUIZ_DB.prepare('SELECT snapshot, version, published_at FROM quiz_publications WHERE id = 1').first();
  } catch (error) {
    if (/no such table/i.test(String(error))) return null;
    throw error;
  }
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const preview = new URL(request.url).searchParams.get('preview') === '1';
  if (preview) {
    if (!authorized(request, env)) return json({ ok: false, error: 'Accès administrateur requis.' }, 401);
    try {
      const result = await draft(context);
      return json({ ok: result.errors.length === 0, preview: true, ...result }, result.errors.length ? 422 : 200);
    } catch (error) {
      console.error('Unable to load Airtable question draft', error);
      return json({ ok: false, error: 'Impossible de charger les questions Airtable.' }, 502);
    }
  }
  try {
    const row = await published(env);
    if (!row) return json({ ok: false, error: 'Aucune version publiée.' }, 404);
    return json({ ok: true, source: 'published', version: row.version, publishedAt: row.published_at, snapshot: JSON.parse(row.snapshot) });
  } catch (error) {
    console.error('Unable to load published question set', error);
    return json({ ok: false, error: 'Version publiée indisponible.' }, 503);
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!authorized(request, env)) return json({ ok: false, error: 'Accès administrateur requis.' }, 401);
  if (env.QUIZ_PUBLISH_ENABLED !== 'true' || !env.QUIZ_DB) {
    return json({ ok: false, error: 'Publication non configurée dans cet environnement.' }, 503);
  }
  try {
    const result = await draft(context, true);
    if (result.errors.length) return json({ ok: false, errors: result.errors, summary: result.summary }, 422);
    const version = crypto.randomUUID();
    const publishedAt = new Date().toISOString();
    await env.QUIZ_DB.prepare('CREATE TABLE IF NOT EXISTS quiz_publications (id INTEGER PRIMARY KEY CHECK (id = 1), snapshot TEXT NOT NULL, version TEXT NOT NULL, published_at TEXT NOT NULL)').run();
    await env.QUIZ_DB.prepare('INSERT INTO quiz_publications (id, snapshot, version, published_at) VALUES (1, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET snapshot = excluded.snapshot, version = excluded.version, published_at = excluded.published_at')
      .bind(JSON.stringify(result.snapshot), version, publishedAt).run();
    return json({ ok: true, version, publishedAt, summary: result.summary });
  } catch (error) {
    console.error('Unable to publish question set', error);
    return json({ ok: false, error: 'Publication impossible.' }, 502);
  }
}
