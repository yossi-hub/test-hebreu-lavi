import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { audioFileResponse, prepareQuestionAudio, QUESTION_AUDIO_TABLE, validateQuestionAttachment, MAX_QUESTION_AUDIO_BYTES } from '../lib/question-audio.js';
import { compileQuestionSet, FIELDS, parseBaseScript } from '../lib/question-set.js';
import { onRequestGet as getAudio } from '../functions/api/question-audio.js';
import { onRequestGet as getQuestions, onRequestPost as publish } from '../functions/api/question-set.js';
import { onRequestPost as answer } from '../functions/api/audio-response.js';

const base = parseBaseScript(readFileSync('questions.js', 'utf8'));
const wav = readFileSync('audio/question-demo.wav');
const attachment = { filename: 'question.wav', size: wav.length, url: 'https://v5.airtableusercontent.com/example/question.wav' };
const newQuestion = { id: 'recNewAudio', fields: {
  [FIELDS.phase]: 'Audio DEV', [FIELDS.editorialState]: 'Validée',
  [FIELDS.text]: 'מה עשית אתמול בערב?', [FIELDS.audioFile]: [attachment],
  [FIELDS.audioPrompt]: 'Une activité passée, en hébreu, hier soir.',
  [FIELDS.audioExamples]: 'ראיתי סרט\n\nהלכתי למסעדה',
} };

function database() {
  const db = new DatabaseSync(':memory:');
  const adapter = {
    prepare(sql) {
      const statement = db.prepare(sql);
      const bound = values => {
        const args = values.map(value => value instanceof ArrayBuffer ? new Uint8Array(value) : value);
        return { run: async () => statement.run(...args), first: async () => statement.get(...args) || null,
          all: async () => ({ results: statement.all(...args) }) };
      };
      return { ...bound([]), bind: (...values) => bound(values) };
    },
    async batch(statements) {
      db.exec('BEGIN');
      try { const results = []; for (const statement of statements) results.push(await statement.run()); db.exec('COMMIT'); return results; }
      catch (error) { db.exec('ROLLBACK'); throw error; }
    },
  };
  return { db, adapter };
}

test('Airtable : ajout sans ID ni code de parcours, prompt direct, brouillons exclus, DEV uniquement', () => {
  const result = compileQuestionSet(base, [newQuestion], { audioEnabled: true });
  const q = result.snapshot.devAudioQuestions[0];
  assert.equal(q.id, 'recNewAudio');
  assert.equal(q.type, 'audio_response');
  assert.equal(q.points, 1);
  assert.equal(q.evaluationCriteria, newQuestion.fields[FIELDS.audioPrompt]);
  assert.deepEqual(q.acceptedExamples, ['ראיתי סרט', 'הלכתי למסעדה']);
  assert.equal(result.errors.filter(error => error.startsWith('recNewAudio')).length, 0);
  assert.equal(compileQuestionSet(base, [newQuestion]).snapshot.devAudioQuestions, undefined);
  const draft = structuredClone(newQuestion); draft.fields[FIELDS.editorialState] = 'Brouillon';
  const excluded = compileQuestionSet(base, [draft], { audioEnabled: true, requireReady: true });
  assert.equal(excluded.snapshot.devAudioQuestions.length, 0);
  assert.equal(excluded.summary.audioDrafts, 1);
  const missing = structuredClone(newQuestion); delete missing.fields[FIELDS.audioPrompt];
  assert.match(compileQuestionSet(base, [missing], { audioEnabled: true }).errors.join(' '), /critères audio manquants/);
  const multiple = structuredClone(newQuestion); multiple.fields[FIELDS.audioFile].push(attachment);
  assert.match(compileQuestionSet(base, [multiple], { audioEnabled: true }).errors.join(' '), /un seul fichier/);
});

test('Pièces jointes : hôte contrôlé, formats et taille bornés, vraie signature audio', async () => {
  assert.equal(validateQuestionAttachment(attachment), 'audio/wav');
  for (const bad of [
    { ...attachment, url: 'https://example.com/audio.wav' },
    { ...attachment, url: 'https://v5.airtableusercontent.com.evil.test/audio.wav' },
    { ...attachment, url: 'http://v5.airtableusercontent.com/audio.wav' },
    { ...attachment, filename: 'question.html' },
    { ...attachment, size: MAX_QUESTION_AUDIO_BYTES + 1 },
  ]) assert.throws(() => validateQuestionAttachment(bad));
  const original = globalThis.fetch;
  globalThis.fetch = async () => new Response('<html>not audio</html>');
  try {
    const { db, adapter } = database();
    await adapter.prepare(QUESTION_AUDIO_TABLE).run();
    await assert.rejects(prepareQuestionAudio({ questions: [], devAudioQuestions: [{ id: 'new', type: 'audio_response', audioAttachment: attachment }] }, { QUIZ_DB: adapter }, 'v', new Date().toISOString()), /contenu du fichier/);
    assert.equal(db.prepare('SELECT count(*) n FROM quiz_question_audio').get().n, 0);
    globalThis.fetch = async () => new Response(null, { status: 302, headers: { Location: 'https://example.com/redirect.wav' } });
    await assert.rejects(prepareQuestionAudio({ questions: [], devAudioQuestions: [{ id: 'new', type: 'audio_response', audioAttachment: attachment }] }, { QUIZ_DB: adapter }, 'v', new Date().toISOString()), /Téléchargement du fichier audio impossible/);
  } finally { globalThis.fetch = original; }
});

test('Publication copie le fichier, reste lisible après expiration Airtable et respecte Range Safari', async () => {
  const original = globalThis.fetch;
  const { db, adapter } = database();
  await adapter.prepare(QUESTION_AUDIO_TABLE).run();
  globalThis.fetch = async (url, options) => {
    assert.equal(url, attachment.url); assert.equal(options.redirect, 'manual');
    return new Response(wav);
  };
  const snapshot = { questions: [], devAudioQuestions: [{ id: 'new-audio', type: 'audio_response', evaluationCriteria: 'secret criteria', acceptedExamples: ['secret'], audioAttachment: attachment }] };
  const env = { QUIZ_DB: adapter, APP_ENV: 'development', QUIZ_AUDIO_ENABLED: 'true' };
  try {
    const statements = await prepareQuestionAudio(snapshot, env, 'stable-v1', new Date().toISOString());
    await adapter.batch(statements);
    assert.equal(snapshot.devAudioQuestions[0].audioAttachment, undefined);
    assert.equal(snapshot.devAudioQuestions[0].media.url, '/api/question-audio?questionId=new-audio&version=stable-v1');
    await adapter.prepare('CREATE TABLE quiz_publications (id INTEGER PRIMARY KEY, snapshot TEXT, version TEXT, published_at TEXT)').run();
    await adapter.prepare('INSERT INTO quiz_publications VALUES (1, ?, ?, ?)').bind(JSON.stringify(snapshot), 'stable-v1', new Date().toISOString()).run();
    globalThis.fetch = async () => { throw new Error('Airtable URL expired'); };
    const request = range => new Request('http://localhost/api/question-audio?questionId=new-audio&version=stable-v1', { headers: range ? { Range: range } : {} });
    const full = await getAudio({ request: request(), env });
    assert.equal(full.status, 200); assert.deepEqual(Buffer.from(await full.arrayBuffer()), wav);
    const partial = await getAudio({ request: request('bytes=0-1'), env });
    assert.equal(partial.status, 206); assert.equal(partial.headers.get('Content-Range'), `bytes 0-1/${wav.length}`);
    assert.equal(Buffer.from(await partial.arrayBuffer()).toString(), 'RI');
    assert.equal((await getAudio({ request: request('bytes=999999999-'), env })).status, 416);
    assert.equal((await getAudio({ request: new Request('http://localhost/api/question-audio?questionId=new-audio&version=old'), env })).status, 409);
    assert.equal((await getAudio({ request: new Request('https://test.oulpanlavi.com/api/question-audio?questionId=new-audio&version=stable-v1'), env })).status, 404);
    const publicData = await (await getQuestions({ request: new Request('http://localhost/api/question-set'), env })).json();
    assert.equal(publicData.snapshot.devAudioQuestions[0].evaluationCriteria, undefined);
    assert.equal(publicData.snapshot.devAudioQuestions[0].acceptedExamples, undefined);
    const production = await (await getQuestions({ request: new Request('https://test.oulpanlavi.com/api/question-set'), env })).json();
    assert.equal(production.snapshot.devAudioQuestions, undefined);
    const form = new FormData(); form.append('questionId', 'new-audio'); form.append('version', 'stable-v1');
    form.append('audio', new Blob([wav], { type: 'audio/wav' }), 'response.wav');
    const response = await answer({ request: new Request('http://localhost/api/audio-response', { method: 'POST', body: form }), env: { ...env, QUIZ_AUDIO_LOCAL_DEBUG: 'true' } });
    const result = await response.json();
    assert.equal(result.debug.questionId, 'new-audio');
    assert.equal(result.status, 'uncertain'); // No API key in this offline test.
    assert.equal(db.prepare('SELECT count(*) n FROM quiz_question_audio').get().n > 0, true);
  } finally { globalThis.fetch = original; db.close(); }
});

test('Range accepte les suffixes et rejette les plages multiples ou vides', async () => {
  const rows = [{ mime: 'audio/mpeg', content: new Uint8Array([1, 2, 3, 4]) }];
  assert.deepEqual([...new Uint8Array(await audioFileResponse(rows, 'bytes=-2').arrayBuffer())], [3, 4]);
  for (const value of ['bytes=-', 'bytes=-0', 'bytes=3-1', 'bytes=0-1,2-3']) assert.equal(audioFileResponse(rows, value).status, 416);
});

test('Le bouton valide et publie en une requête ; une panne de fichier conserve la version précédente', async () => {
  const ids = new Set([...base.parcours.adaptive.selfAssessmentIds, ...Object.values(base.parcours.adaptive.tests).flatMap(test => [...test.primary, test.tiebreaker])]);
  const records = base.questions.filter(q => ids.has(q.id)).map(q => {
    const block = base.parcours.blocs.find(block => block.questions.includes(q.id));
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
  const added = structuredClone(newQuestion); records.push(added);
  const { db, adapter } = database();
  const env = { QUIZ_DB: adapter, APP_ENV: 'development', QUIZ_AUDIO_ENABLED: 'true', QUIZ_PUBLISH_ENABLED: 'true', AIRTABLE_TOKEN: 'offline-test-only',
    QUIZ_ADMIN_TOKEN: 'offline-admin-at-least-24-characters', ASSETS: { fetch: async () => new Response(readFileSync('questions.js', 'utf8')) } };
  const request = () => new Request('http://localhost/api/question-set', { method: 'POST', headers: { Authorization: `Bearer ${env.QUIZ_ADMIN_TOKEN}` } });
  const original = globalThis.fetch; const originalError = console.error;
  let audioFails = false, downloads = 0;
  globalThis.fetch = async url => {
    if (new URL(url).hostname === 'api.airtable.com') return new Response(JSON.stringify({ records }));
    downloads += 1; if (audioFails) return new Response('Unavailable', { status: 503 });
    return new Response(wav);
  };
  try {
    assert.equal((await publish({ request: new Request('http://localhost/api/question-set', { method: 'POST' }), env })).status, 401);
    const result = await publish({ request: request(), env });
    assert.equal(result.status, 200);
    const first = await result.json(); assert.equal(first.summary.audioQuestions, 1);
    const stored = db.prepare('SELECT * FROM quiz_publications').get();
    assert.equal(JSON.parse(stored.snapshot).devAudioQuestions[0].evaluationCriteria, added.fields[FIELDS.audioPrompt]);
    added.fields[FIELDS.audioPrompt] = '';
    assert.equal((await publish({ request: request(), env })).status, 422);
    assert.equal(downloads, 1);
    added.fields[FIELDS.audioPrompt] = 'Updated prompt'; audioFails = true; console.error = () => {};
    assert.equal((await publish({ request: request(), env })).status, 502);
    assert.equal(db.prepare('SELECT version FROM quiz_publications').get().version, first.version);
    audioFails = false;
    const updated = await (await publish({ request: request(), env })).json();
    assert.notEqual(updated.version, first.version);
    assert.equal(db.prepare('SELECT COUNT(DISTINCT version) n FROM quiz_question_audio').get().n, 1);
  } finally { globalThis.fetch = original; console.error = originalError; db.close(); }
});

test('La page indique la configuration manquante sans exposer de secrets', async () => {
  const request = new Request('http://localhost/api/question-set?configuration=1');
  const data = await (await getQuestions({ request, env: {} })).json();
  assert.equal(data.ready, false);
  assert.equal(data.missing.length, 4);
  const { db, adapter } = database();
  const env = { AIRTABLE_TOKEN: 'private-airtable-test', QUIZ_ADMIN_TOKEN: 'private-admin-at-least-24-characters',
    QUIZ_PUBLISH_ENABLED: 'true', QUIZ_DB: adapter, QUIZ_AUDIO_ENABLED: 'true', APP_ENV: 'development' };
  const configured = await (await getQuestions({ request, env })).json();
  assert.equal(configured.ready, true);
  assert.equal(JSON.stringify(configured).includes('private'), false);
  db.close();
});
