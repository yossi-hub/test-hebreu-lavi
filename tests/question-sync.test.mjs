import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { FIELDS, parseBaseScript } from '../lib/question-set.js';
import { onRequestGet, onRequestPost } from '../functions/api/question-sync.js';
import { onRequestGet as getQuestions, onRequestPost as adminPublish } from '../functions/api/question-set.js';

const origin = 'https://dev.test-hebreu-lavi.pages.dev';
const source = readFileSync('questions.js', 'utf8');
const base = parseBaseScript(source);
const wav = readFileSync('audio/question-demo.wav');
const request = (options = {}) => new Request(`${options.origin || origin}/api/question-sync${options.search || ''}`, {
  method: options.method || 'POST', headers: options.headers ?? { Origin: origin },
  ...(options.body ? { body: options.body } : {}),
});

function fixture() {
  const ids = new Set([...base.parcours.adaptive.selfAssessmentIds, ...Object.values(base.parcours.adaptive.tests).flatMap(item => [...item.primary, item.tiebreaker])]);
  const records = base.questions.filter(q => ids.has(q.id)).map(q => {
    const block = base.parcours.blocs.find(item => item.questions.includes(q.id));
    return { id: `rec-${q.id}`, fields: {
      [FIELDS.id]: q.id, [FIELDS.text]: q.texte, [FIELDS.type]: q.type,
      [FIELDS.points]: q.points, [FIELDS.level]: q.niveau,
      [FIELDS.choices]: JSON.stringify(q.choix), [FIELDS.answer]: JSON.stringify(q.bonneReponse),
      [FIELDS.multiple]: q.multiple, [FIELDS.random]: q.aleatoire,
      [FIELDS.yesNo]: q.reponseOuiNon, [FIELDS.conversational]: q.reponseConversationnelle,
      [FIELDS.phase]: 'Test', [FIELDS.editorialState]: 'Importée',
      [FIELDS.blockId]: block.id, [FIELDS.blockPosition]: block.questions.indexOf(q.id) + 1,
    } };
  });
  for (const [index, key] of ['identite', 'email', 'telephone'].entries()) records.push({ id: `profile-${key}`, fields: {
    [FIELDS.id]: `profil-${key}`, [FIELDS.text]: `Question ${key}`, [FIELDS.type]: 'text',
    [FIELDS.phase]: 'Profil', [FIELDS.editorialState]: 'Importée', [FIELDS.blockPosition]: index + 1,
  } });
  const audio = { id: 'recNewAudio', fields: {
    [FIELDS.id]: 'audio-editable', [FIELDS.phase]: 'Audio DEV', [FIELDS.editorialState]: 'Validée',
    [FIELDS.text]: 'מה עשית אתמול בערב?', [FIELDS.audioPrompt]: 'Répondre en hébreu au passé.',
    [FIELDS.audioFile]: [{ id: 'attStable', filename: 'question.wav', size: wav.length, url: 'https://v5.airtableusercontent.com/initial.wav' }],
  } };
  records.push(audio);
  const db = new DatabaseSync(':memory:');
  const adapter = {
    prepare(sql) {
      const statement = db.prepare(sql);
      const bound = values => {
        const args = values.map(value => value instanceof ArrayBuffer ? new Uint8Array(value) : value);
        return { run: async () => ({ meta: { changes: Number(statement.run(...args).changes) } }),
          first: async () => statement.get(...args) || null, all: async () => ({ results: statement.all(...args) }) };
      };
      return { ...bound([]), bind: (...values) => bound(values) };
    },
    async batch(statements) {
      db.exec('BEGIN');
      try { const results = []; for (const statement of statements) results.push(await statement.run()); db.exec('COMMIT'); return results; }
      catch (error) { db.exec('ROLLBACK'); throw error; }
    },
  };
  const env = { QUIZ_DB: adapter, CF_PAGES_BRANCH: 'DEV', QUIZ_AUDIO_ENABLED: 'true', QUIZ_PUBLISH_ENABLED: 'true', AIRTABLE_TOKEN: 'server-test-only',
    ASSETS: { fetch: async () => new Response(source) } };
  return { db, env, records, audio, unlock: () => db.exec('UPDATE quiz_dev_sync SET lock_until = 0') };
}

test('DEV uniquement, configuration prête sans clé admin ; aperçu et ancienne publication restent protégés', async () => {
  const { db, env } = fixture();
  try {
    const data = await onRequestGet({ request: request({ method: 'GET' }), env }).json();
    assert.equal(data.ready, true);
    assert.equal(JSON.stringify(data).includes(env.AIRTABLE_TOKEN), false);
    for (const host of ['https://test.oulpanlavi.com', 'https://test-hebreu-lavi.pages.dev', 'https://other.test-hebreu-lavi.pages.dev']) {
      assert.equal(onRequestGet({ request: request({ origin: host, method: 'GET' }), env }).status, 404);
      assert.equal((await onRequestPost({ request: request({ origin: host }), env })).status, 404);
    }
    assert.equal((await onRequestPost({ request: request(), env: { ...env, CF_PAGES_BRANCH: 'main' } })).status, 404);
    assert.equal((await adminPublish({ request: new Request(`${origin}/api/question-set`, { method: 'POST' }), env })).status, 401);
    assert.equal((await getQuestions({ request: new Request(`${origin}/api/question-set?preview=1`), env })).status, 401);
  } finally { db.close(); }
});

test('Une autre origine et un contenu fourni par le navigateur ne peuvent pas publier', async () => {
  const { db, env } = fixture();
  try {
    for (const headers of [{}, { Origin: 'https://example.com' }]) {
      assert.equal((await onRequestPost({ request: request({ headers }), env })).status, 403);
    }
    assert.equal((await onRequestPost({ request: request({ body: JSON.stringify({ questions: [], baseId: 'external' }) }), env })).status, 400);
    assert.equal((await onRequestPost({ request: request({ search: '?baseId=external' }), env })).status, 400);
    assert.equal(db.prepare("SELECT count(*) n FROM sqlite_master WHERE type='table'").get().n, 0);
  } finally { db.close(); }
});

test('Le clic sans clé importe les changements Airtable ; une URL expirante inchangée conserve la version et le fichier', async () => {
  const { db, env, records, audio, unlock } = fixture();
  const original = globalThis.fetch;
  let downloads = 0;
  globalThis.fetch = async url => {
    if (new URL(url).hostname === 'api.airtable.com') return new Response(JSON.stringify({ records }));
    downloads += 1; return new Response(wav);
  };
  try {
    const firstResponse = await onRequestPost({ request: request(), env });
    assert.equal(firstResponse.status, 200);
    const first = await firstResponse.json();
    assert.equal(first.updated, true); assert.equal(first.summary.audioQuestions, 1);
    assert.equal(downloads, 1);
    unlock();
    audio.fields[FIELDS.audioFile][0].url = 'https://v5.airtableusercontent.com/new-signed-link.wav';
    const unchanged = await (await onRequestPost({ request: request(), env })).json();
    assert.equal(unchanged.updated, false); assert.equal(unchanged.version, first.version);
    assert.equal(downloads, 1);
    unlock();
    audio.fields[FIELDS.text] = 'Question modifiée dans Airtable';
    const changed = await (await onRequestPost({ request: request(), env })).json();
    assert.equal(changed.updated, true); assert.notEqual(changed.version, first.version);
    const stored = db.prepare('SELECT * FROM quiz_publications').get();
    assert.equal(JSON.parse(stored.snapshot).devAudioQuestions[0].texte, 'Question modifiée dans Airtable');
    assert.equal(db.prepare('SELECT version FROM quiz_dev_sync').get().version, stored.version);
    assert.equal(db.prepare('SELECT count(DISTINCT version) n FROM quiz_question_audio').get().n, 1);
  } finally { globalThis.fetch = original; db.close(); }
});

test('Un brouillon invalide ou une panne audio conserve la dernière publication', async () => {
  const { db, env, records, audio, unlock } = fixture();
  const original = globalThis.fetch, originalError = console.error;
  let failedAudio = false;
  globalThis.fetch = async url => new URL(url).hostname === 'api.airtable.com'
    ? new Response(JSON.stringify({ records })) : new Response(failedAudio ? 'unavailable' : wav, { status: failedAudio ? 503 : 200 });
  try {
    const first = await (await onRequestPost({ request: request(), env })).json();
    const hash = db.prepare('SELECT source_hash FROM quiz_dev_sync').get().source_hash;
    unlock(); audio.fields[FIELDS.audioPrompt] = '';
    assert.equal((await onRequestPost({ request: request(), env })).status, 422);
    assert.equal(db.prepare('SELECT version FROM quiz_publications').get().version, first.version);
    unlock(); audio.fields[FIELDS.audioPrompt] = 'Nouveau critère'; failedAudio = true; console.error = () => {};
    assert.equal((await onRequestPost({ request: request(), env })).status, 502);
    assert.equal(db.prepare('SELECT version FROM quiz_publications').get().version, first.version);
    assert.equal(db.prepare('SELECT source_hash FROM quiz_dev_sync').get().source_hash, hash);
  } finally { globalThis.fetch = original; console.error = originalError; db.close(); }
});

test('Deux clics simultanés et le délai partagé ne multiplient pas les appels Airtable', async () => {
  const { db, env, records, unlock } = fixture();
  const original = globalThis.fetch;
  let release, entered, fetches = 0;
  const gate = new Promise(resolve => { release = resolve; });
  const started = new Promise(resolve => { entered = resolve; });
  globalThis.fetch = async url => {
    if (new URL(url).hostname !== 'api.airtable.com') return new Response(wav);
    fetches += 1; entered(); await gate; return new Response(JSON.stringify({ records }));
  };
  try {
    const pending = onRequestPost({ request: request(), env });
    await started;
    assert.equal((await onRequestPost({ request: request(), env })).status, 429);
    release(); assert.equal((await pending).status, 200);
    assert.equal((await onRequestPost({ request: request(), env })).status, 429);
    assert.equal(fetches, 1);
    unlock(); assert.equal((await onRequestPost({ request: request(), env })).status, 200);
    assert.equal(fetches, 2);
  } finally { release(); globalThis.fetch = original; db.close(); }
});
