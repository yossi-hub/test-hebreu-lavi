import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { compileQuestionSet, FIELDS, parseBaseScript } from '../lib/question-set.js';
import { onRequestGet, onRequestPost } from '../functions/api/question-set.js';

const { createQuizEngine } = createRequire(import.meta.url)('../engine.js');

const source = readFileSync('questions.js', 'utf8');
const base = parseBaseScript(source);
assert.equal(base.questions.length, 82);

const records = base.questions.map((q, index) => {
  const block = base.parcours.blocs.find(item => item.questions.includes(q.id));
  return {
    id: `rec${String(index).padStart(14, '0')}`,
    fields: {
      [FIELDS.id]: q.id,
      [FIELDS.text]: q.texte,
      [FIELDS.type]: q.type,
      [FIELDS.level]: q.niveau,
      [FIELDS.points]: q.points,
      [FIELDS.choices]: JSON.stringify(q.choix),
      [FIELDS.answer]: JSON.stringify(q.bonneReponse),
      [FIELDS.required]: q.obligatoire,
      [FIELDS.language]: q.langue,
      [FIELDS.instruction]: q.instruction,
      [FIELDS.mediaType]: q.media?.type,
      [FIELDS.mediaUrl]: q.media?.url,
      [FIELDS.blockId]: block?.id,
      [FIELDS.blockPosition]: block ? block.questions.indexOf(q.id) + 1 : null,
      [FIELDS.globalPosition]: index + 1,
      [FIELDS.editorialState]: 'Importée',
      [FIELDS.multiple]: q.multiple,
      [FIELDS.random]: q.aleatoire,
      [FIELDS.yesNo]: q.reponseOuiNon,
      [FIELDS.conversational]: q.reponseConversationnelle,
      [FIELDS.phase]: block ? 'Test' : 'Hors parcours',
    },
  };
});
const archivedIds = new Set([
  'bfff1062-27eb-455c-bb6b-ae72d17c0495',
  '8982d9c6-c435-48ee-8d81-a50df364117a',
  '0eb94c71-79ab-4c98-b1c4-5279a8bd85c4',
  '40e49b2e-f3cb-418e-a393-a32593404b5f',
  '646a923f-8ff6-43a7-819c-93c54e72e586',
  '37209185-6d5f-4382-8b38-f244f94cd8b0',
  '0383b52e-6fbf-4194-ac16-dc470a04e5de',
  '8b2b6d34-3da7-4174-8504-01820608eac9',
]);
for (const record of records) {
  if (archivedIds.has(record.fields[FIELDS.id])) record.fields[FIELDS.editorialState] = 'Archivée';
}
for (const [index, step] of [
  { key: 'identite', label: 'Prénom et nom', question: 'Donne-moi ton prénom et ton nom, s’il te plaît.', type: 'text', autocomplete: 'name' },
  { key: 'email', label: 'Email', question: 'Quelle est ton adresse email ?', type: 'email', autocomplete: 'email' },
  { key: 'telephone', label: 'Téléphone', question: 'Quel est ton numéro de téléphone ?', type: 'tel', autocomplete: 'tel' },
].entries()) {
  records.push({ id: `recProfile${index}`, fields: {
    [FIELDS.id]: `profil-${step.key}`,
    [FIELDS.text]: step.question,
    [FIELDS.type]: 'text',
    [FIELDS.points]: 0,
    [FIELDS.choices]: '[]',
    [FIELDS.answer]: 'null',
    [FIELDS.required]: true,
    [FIELDS.language]: 'fr',
    [FIELDS.blockPosition]: index + 1,
    [FIELDS.editorialState]: 'Importée',
    [FIELDS.phase]: 'Profil',
    [FIELDS.profileInputType]: step.type,
    [FIELDS.importedData]: JSON.stringify(step),
  } });
}

const first = compileQuestionSet(base, records);
assert.deepEqual(first.errors, []);
assert.deepEqual(first.summary, { testQuestions: 72, scoredQuestions: 68, profileQuestions: 3 });
assert.equal(first.snapshot.parcours.blocs.length, 26);
assert.equal(first.snapshot.profileQuestions[1].type, 'email');
const engine = createQuizEngine(first.snapshot.questions, first.snapshot.parcours);
let steps = 0;
while (!engine.state.finished) {
  assert.ok(steps++ < 100);
  const q = engine.current();
  const answer = q.bonneReponse != null ? q.bonneReponse
    : q.reponseOuiNon ? false
      : q.type === 'text' ? 'Paris'
        : q.multiple ? q.choix.map(choice => choice.valeur) : true;
  engine.submit(answer);
  engine.next();
}
assert.equal(engine.state.variables.niveau_lavi, '9');
assert.equal(engine.state.score, 21);

const brokenSupport = structuredClone(records);
const expandedId = base.parcours.adaptive.tests['6'].primary[1];
brokenSupport.find(record => record.fields[FIELDS.id] === expandedId).fields[FIELDS.mediaUrl] = 'https://youtu.be/AnotherVideo';
assert.match(compileQuestionSet(base, brokenSupport).errors.join(' '), /3 questions consécutives/);
brokenSupport.find(record => record.fields[FIELDS.id] === expandedId).fields[FIELDS.editorialState] = 'Archivée';
assert.match(compileQuestionSet(base, brokenSupport).errors.join(' '), /question nécessaire au parcours adaptatif absente ou archivée/);

const changed = structuredClone(records);
const firstScored = changed.find(record => record.fields[FIELDS.points] > 0);
firstScored.fields[FIELDS.text] = 'Question modifiée dans Airtable';
assert.ok(compileQuestionSet(base, changed).snapshot.questions.some(q => q.texte === 'Question modifiée dans Airtable'));
firstScored.fields[FIELDS.editorialState] = 'Brouillon';
assert.match(compileQuestionSet(base, changed, { requireReady: true }).errors.join(' '), /Validée/);
firstScored.fields[FIELDS.editorialState] = '';
assert.match(compileQuestionSet(base, changed, { requireReady: true }).errors.join(' '), /Validée/);
firstScored.fields[FIELDS.editorialState] = 'Importée';
firstScored.fields[FIELDS.choices] = '{';
assert.match(compileQuestionSet(base, changed).errors.join(' '), /JSON invalide/);

const originalFetch = globalThis.fetch;
globalThis.fetch = async url => {
  assert.match(String(url), /^https:\/\/api\.airtable\.com\/v0\//);
  return new Response(JSON.stringify({ records }), { status: 200 });
};
const row = { snapshot: '', version: '', published_at: '' };
const database = {
  prepare(sql) {
    return {
      first: async () => row.snapshot ? row : null,
      run: async () => ({ success: true }),
      bind: (snapshot, version, publishedAt) => ({ run: async () => {
        assert.match(sql, /INSERT INTO quiz_publications/);
        Object.assign(row, { snapshot, version, published_at: publishedAt });
      } }),
    };
  },
};
const env = {
  AIRTABLE_TOKEN: 'test-airtable', QUIZ_ADMIN_TOKEN: 'test-admin-token-at-least-24-characters',
  QUIZ_PUBLISH_ENABLED: 'true', QUIZ_DB: database,
  ASSETS: { fetch: async () => new Response(source, { status: 200 }) },
};
const request = (url, method = 'GET', token = env.QUIZ_ADMIN_TOKEN) => new Request(url, {
  method, headers: token ? { Authorization: `Bearer ${token}` } : {},
});
assert.equal((await onRequestGet({ request: request('https://test.local/api/question-set?preview=1', 'GET', ''), env })).status, 401);
const preview = await onRequestGet({ request: request('https://test.local/api/question-set?preview=1'), env });
assert.equal(preview.status, 200);
assert.equal((await preview.json()).summary.testQuestions, 72);
const publication = await onRequestPost({ request: request('https://test.local/api/question-set', 'POST'), env });
assert.equal(publication.status, 200);
assert.ok(row.version);
const published = await onRequestGet({ request: request('https://test.local/api/question-set'), env });
assert.equal((await published.json()).snapshot.questions.length, 72);
globalThis.fetch = originalFetch;
const audioRecords = structuredClone(records);
const audioRow = audioRecords.find(record => record.fields[FIELDS.points] > 0);
Object.assign(audioRow.fields, {
  [FIELDS.type]: 'audio_response', [FIELDS.choices]: '[]', [FIELDS.answer]: 'null',
  [FIELDS.mediaType]: 'audio', [FIELDS.mediaUrl]: '/audio/question-demo.wav',
  [FIELDS.multiple]: false, [FIELDS.yesNo]: false, [FIELDS.conversational]: false,
  [FIELDS.importedData]: JSON.stringify({ evaluationCriteria: 'Une activité hier soir en hébreu.', acceptedExamples: ['ראיתי סרט'] }),
});
assert.match(compileQuestionSet(base, audioRecords).errors.join(' '), /réservées à DEV/);
const audioSet = compileQuestionSet(base, audioRecords, { audioEnabled: true });
assert.deepEqual(audioSet.errors, []);
assert.equal(audioSet.summary.scoredQuestions, 68);
assert.equal(audioSet.snapshot.questions.find(q => q.id === audioRow.fields[FIELDS.id]).evaluationCriteria, 'Une activité hier soir en hébreu.');
audioRow.fields[FIELDS.importedData] = '{"evaluationCriteria":"", "acceptedExamples":"wrong"}';
assert.match(compileQuestionSet(base, audioRecords, { audioEnabled: true }).errors.join(' '), /critères audio.*exemples audio/);
console.log('OK : import Airtable, validation du parcours, aperçu protégé et publication stable.');
