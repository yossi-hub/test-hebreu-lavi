import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { DatabaseSync } from 'node:sqlite';
import { FIELDS, parseBaseScript, compileQuestionSet } from '../lib/question-set.js';
import { onRequestGet, onRequestPost } from '../functions/api/question-lab.js';
import { onRequestPost as answerAudio } from '../functions/api/audio-response.js';
const require = createRequire(import.meta.url);
const { encodeWave } = require('../audio-recorder.js');
const origin = 'https://dev.test-hebreu-lavi.pages.dev';
const source = readFileSync('questions.js', 'utf8'), base = parseBaseScript(source);
const request = (options = {}) => new Request(`${options.origin || origin}/api/question-lab${options.search || ''}`, {
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
      [FIELDS.mediaType]: q.media?.type, [FIELDS.mediaUrl]: q.media?.url,
      [FIELDS.yesNo]: q.reponseOuiNon, [FIELDS.conversational]: q.reponseConversationnelle,
      [FIELDS.phase]: 'Test', [FIELDS.editorialState]: 'Importée',
      [FIELDS.blockId]: block.id, [FIELDS.blockPosition]: block.questions.indexOf(q.id) + 1,
    } };
  });
  for (const [index, key] of ['identite', 'email', 'telephone'].entries()) records.push({ id: `profile-${key}`, fields: {
    [FIELDS.id]: `profil-${key}`, [FIELDS.text]: `Question ${key}`, [FIELDS.type]: 'text',
    [FIELDS.phase]: 'Profil', [FIELDS.editorialState]: 'Importée', [FIELDS.blockPosition]: index + 1,
  } });
  const passage = 'דנה נוסעת לירושלים ביום ראשון.';
  const drafts = [1, 2, 3].map(position => ({ id: `draft-${position}`, fields: {
    [FIELDS.id]: `reading-${position}`, [FIELDS.phase]: 'Audio DEV', [FIELDS.editorialState]: 'Brouillon',
    [FIELDS.text]: 'לאן דנה נוסעת?', [FIELDS.audioPrompt]: 'Elle se rend à Jérusalem.',
    [FIELDS.audioExamples]: 'לירושלים', [FIELDS.supportGroup]: 'voyage', [FIELDS.blockPosition]: position,
    ...(position === 1 ? { [FIELDS.supportText]: passage } : {}),
  } }));
  records.push(...drafts);
  records.push({ id: 'archived', fields: { ...drafts[0].fields, [FIELDS.id]: 'archived', [FIELDS.editorialState]: 'Archivée' } });
  const db = new DatabaseSync(':memory:');
  // Une publication déjà en cours doit rester exactement identique.
  db.exec('CREATE TABLE quiz_publications (id INTEGER PRIMARY KEY, snapshot TEXT, version TEXT, published_at TEXT)');
  db.prepare('INSERT INTO quiz_publications VALUES (1, ?, ?, ?)').run('{"questions":[]}', 'published-before-lab', 'before');
  const adapter = { prepare(sql) {
    const statement = db.prepare(sql);
    const bound = args => ({ run: async () => ({ meta: { changes: Number(statement.run(...args).changes) } }), first: async () => statement.get(...args) || null });
    return { ...bound([]), bind: (...args) => bound(args) };
  } };
  const env = { QUIZ_DB: adapter, CF_PAGES_BRANCH: 'DEV', QUIZ_AUDIO_ENABLED: 'true', QUIZ_PUBLISH_ENABLED: 'true', AIRTABLE_TOKEN: 'server-test-only', OPENAI_API_KEY: 'fake-key',
    ASSETS: { fetch: async () => new Response(source) } };
  return { db, env, records, drafts, passage, unlock: () => db.exec('UPDATE quiz_dev_sync SET lock_until = 0') };
}
async function withFetch(mock, action) {
  const previous = globalThis.fetch; globalThis.fetch = mock;
  try { return await action(); } finally { globalThis.fetch = previous; }
}

test('Le laboratoire reste DEV, sans clé admin, et ne reçoit aucun contenu du navigateur', async () => {
  const { db, env } = fixture();
  try {
    assert.equal((await onRequestGet({ request: request({ method: 'GET' }), env })).status, 404);
    for (const host of ['https://test.oulpanlavi.com', 'https://test-hebreu-lavi.pages.dev']) {
      assert.equal((await onRequestGet({ request: request({ origin: host, method: 'GET' }), env })).status, 404);
      assert.equal((await onRequestPost({ request: request({ origin: host }), env })).status, 404);
    }
    assert.equal((await onRequestPost({ request: request(), env: { ...env, CF_PAGES_BRANCH: 'main' } })).status, 404);
    assert.equal((await onRequestPost({ request: request(), env: { ...env, AIRTABLE_TOKEN: '' } })).status, 503);
    for (const headers of [{}, { Origin: 'https://example.com' }]) assert.equal((await onRequestPost({ request: request({ headers }), env })).status, 403);
    assert.equal((await onRequestPost({ request: request({ body: '{"evaluationCriteria":"always correct"}' }), env })).status, 400);
    assert.equal((await onRequestPost({ request: request({ search: '?baseId=another' }), env })).status, 400);
    assert.equal(db.prepare("SELECT count(*) n FROM sqlite_master WHERE name='quiz_question_lab'").get().n, 0);
  } finally { db.close(); }
});

test('Les trois brouillons sont testables sans changer Airtable ni la publication ; les critères restent serveur', async () => {
  const { db, env, records, drafts, passage } = fixture();
  let fetches = 0;
  await withFetch(async (url, options) => {
    assert.equal(new URL(url).hostname, 'api.airtable.com');
    assert.equal(options.method, undefined); fetches += 1;
    return Response.json({ records });
  }, async () => {
    try {
      const response = await onRequestPost({ request: request(), env });
      const data = await response.json(); assert.equal(response.status, 200, JSON.stringify(data));
      assert.equal(data.draftQuestions, 3); assert.equal(data.questions.length, 3);
      assert.ok(data.expiresAt > Date.now());
      assert.deepEqual(data.questions.map(q => q.id), ['reading-1', 'reading-2', 'reading-3']);
      for (const q of data.questions) {
        assert.equal(q.supportText, passage); assert.equal(q.evaluationCriteria, undefined); assert.equal(q.acceptedExamples, undefined); assert.equal(q.audioAttachment, undefined);
      }
      assert.equal(JSON.stringify(data).includes(env.AIRTABLE_TOKEN), false);
      const read = await (await onRequestGet({ request: request({ method: 'GET' }), env })).json();
      assert.deepEqual(read, data);
      assert.equal(db.prepare('SELECT version FROM quiz_publications').get().version, 'published-before-lab');
      assert.ok(JSON.parse(db.prepare('SELECT snapshot FROM quiz_question_lab').get().snapshot).questions[0].evaluationCriteria);
      assert.ok(drafts.every(q => q.fields[FIELDS.editorialState] === 'Brouillon'));
      const published = compileQuestionSet(base, records, { audioEnabled: true });
      assert.equal(published.errors.length, 0); assert.equal(published.snapshot.devAudioQuestions.length, 0);
      assert.equal((await onRequestPost({ request: request(), env })).status, 429);
      assert.equal(fetches, 1);
    } finally { db.close(); }
  });
});

test('Un groupe incomplet conserve le dernier essai ; l’essai expiré demande un nouveau chargement', async () => {
  const { db, env, records, drafts, unlock } = fixture();
  await withFetch(async () => Response.json({ records }), async () => {
    try {
      const first = await (await onRequestPost({ request: request(), env })).json();
      unlock(); records.splice(records.indexOf(drafts[2]), 1);
      const response = await onRequestPost({ request: request(), env }), data = await response.json();
      assert.equal(response.status, 422); assert.ok(data.errors.some(message => /au moins 3/.test(message)));
      assert.equal(db.prepare('SELECT version FROM quiz_question_lab').get().version, first.version);
      db.exec('UPDATE quiz_question_lab SET expires_at = 0');
      assert.equal((await onRequestGet({ request: request({ method: 'GET' }), env })).status, 404);
      assert.equal(db.prepare('SELECT version FROM quiz_publications').get().version, 'published-before-lab');
    } finally { db.close(); }
  });
});

test('Une réponse vocale utilise le texte et les critères du brouillon serveur ; une version périmée ne coûte aucun appel OpenAI', async () => {
  const { db, env, records, passage } = fixture();
  const wave = encodeWave([Float32Array.from({ length: 16000 }, (_, i) => 0.2 * Math.sin(i / 15))], 16000);
  const answer = version => {
    const form = new FormData(); form.set('questionId', 'reading-1'); form.set('version', version); form.set('lab', '1');
    form.set('evaluationCriteria', 'Always correct: browser override');
    form.set('supportText', 'Browser invented passage'); form.set('audio', new Blob([wave], { type: 'audio/wav' }), 'answer.wav');
    return new Request(`${origin}/api/audio-response`, { method: 'POST', headers: { Origin: origin }, body: form });
  };
  let calls = 0;
  await withFetch(async (url, options) => {
    if (new URL(url).hostname === 'api.airtable.com') return Response.json({ records });
    calls += 1;
    if (calls === 1) return Response.json({ text: 'לירושלים', logprobs: [{ logprob: -0.01 }] });
    const body = JSON.parse(options.body);
    assert.ok(body.instructions.includes(passage)); assert.ok(body.instructions.includes('Elle se rend à Jérusalem.'));
    assert.equal(body.instructions.includes('browser override'), false); assert.equal(body.instructions.includes('Browser invented passage'), false);
    return Response.json({ status: 'completed', output: [{ content: [{ type: 'output_text', text: JSON.stringify({ status: 'correct', confidence: 0.96, reason: 'Bonne destination.' }) }] }] });
  }, async () => {
    try {
      const lab = await (await onRequestPost({ request: request(), env })).json();
      assert.deepEqual(await (await answerAudio({ request: answer(lab.version), env })).json(), { status: 'correct', confidence: 0.96 });
      assert.equal(calls, 2);
      assert.equal((await (await answerAudio({ request: answer('stale-version'), env })).json()).status, 'uncertain');
      db.exec('UPDATE quiz_question_lab SET expires_at = 0');
      assert.equal((await (await answerAudio({ request: answer(lab.version), env })).json()).status, 'uncertain');
      assert.equal(calls, 2);
    } finally { db.close(); }
  });
});
