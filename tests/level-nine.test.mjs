import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { compileQuestionSet, FIELDS, parseBaseScript } from '../lib/question-set.js';
import { onRequestGet } from '../functions/api/question-set.js';
const { createQuizEngine } = createRequire(import.meta.url)('../engine.js');
const base = parseBaseScript(readFileSync('questions.js', 'utf8'));
const config = base.parcours.adaptive.textTests[0];

function fixture() {
  const ids = new Set([...base.parcours.adaptive.selfAssessmentIds, ...base.questions.filter(q => q.bonneReponse != null).map(q => q.id)]);
  const records = base.questions.filter(q => ids.has(q.id)).map(q => {
    const block = base.parcours.blocs.find(block => block.questions.includes(q.id));
    return { id: `rec-${q.id}`, fields: {
      [FIELDS.id]: q.id, [FIELDS.text]: q.texte, [FIELDS.type]: q.type,
      [FIELDS.points]: q.points, [FIELDS.level]: q.niveau,
      [FIELDS.choices]: JSON.stringify(q.choix), [FIELDS.answer]: JSON.stringify(q.bonneReponse),
      [FIELDS.mediaType]: q.media?.type, [FIELDS.mediaUrl]: q.media?.url,
      [FIELDS.phase]: 'Test', [FIELDS.editorialState]: 'Importée',
      [FIELDS.blockId]: block.id, [FIELDS.blockPosition]: block.questions.indexOf(q.id) + 1,
    } };
  });
  for (const [index, key] of ['identite', 'email', 'telephone'].entries()) records.push({ id: key, fields: {
    [FIELDS.id]: `profil-${key}`, [FIELDS.text]: key, [FIELDS.type]: 'text', [FIELDS.phase]: 'Profil',
    [FIELDS.editorialState]: 'Importée', [FIELDS.blockPosition]: index + 1,
  } });
  for (let position = 1; position <= 7; position++) records.push(reading(position));
  return records;
}
function reading(position) {
  const audio = position <= 3 || position === 7;
  return { id: `reading-${position}`, fields: {
    [FIELDS.id]: `dev-mon-texte-01-q${position}`, [FIELDS.text]: `שאלה ${position}`,
    [FIELDS.phase]: 'Test', [FIELDS.editorialState]: 'Validée', [FIELDS.level]: 9,
    [FIELDS.blockId]: config.blockId, [FIELDS.blockPosition]: position,
    [FIELDS.supportGroup]: config.supportGroup, [FIELDS.points]: 1,
    [FIELDS.type]: audio ? 'audio_response' : 'qcm',
    [FIELDS.choices]: audio ? '[]' : JSON.stringify([{ libelle: 'נכון', valeur: 'vrai' }, { libelle: 'לא נכון', valeur: 'faux' }]),
    [FIELDS.answer]: audio ? 'null' : '"vrai"',
    ...(audio ? { [FIELDS.audioPrompt]: 'Réponse cohérente au texte {{text}} et à la question {{question}}.' } : {}),
    ...(position === 1 ? { [FIELDS.supportText]: '**שבת בעיר**\nבתל אביב יש אוטובוסים בשבת.' } : {}),
  } };
}
const compile = records => compileQuestionSet(base, records, { audioEnabled: true, requireReady: true });
function run(snapshot, mastered = 9, correctAtNine = 7, yesCount = 4) {
  const engine = createQuizEngine(snapshot.questions, snapshot.parcours);
  const nine = []; let steps = 0;
  while (!engine.state.finished) {
    assert.ok(steps++ < 60);
    const q = engine.current();
    let answer;
    if (engine.state.mode === 'orientation') answer = engine.state.orientationIndex < yesCount;
    else {
      const correct = q.niveau <= mastered && (q.niveau !== 9 || nine.length < correctAtNine);
      if (q.niveau === 9) {
        nine.push(q.id);
        assert.deepEqual(engine.support, { type: 'text', position: nine.length, total: snapshot.parcours.adaptive.tests[9].primary.length });
        assert.equal(engine.block.passage, q.supportText);
        if (q.type === 'audio_response') {
          const before = structuredClone(engine.state);
          assert.throws(() => engine.submit({ status: 'uncertain', confidence: 0.5 }), /réanalysée/);
          assert.deepEqual(engine.state, before);
        }
      }
      answer = q.type === 'audio_response' ? { status: correct ? 'correct' : 'incorrect', confidence: 0.95 }
        : correct ? q.bonneReponse : q.choix.find(choice => choice.valeur !== q.bonneReponse).valeur;
    }
    engine.submit(answer); engine.next();
  }
  return { engine, nine };
}

test('Le niveau 9 pose les sept questions du texte et ne conseille 10 qu’au seuil 6/7', () => {
  const result = compile(fixture());
  assert.deepEqual(result.errors, []);
  assert.equal(result.summary.testQuestions, 79);
  assert.equal(result.summary.scoredQuestions, 75);
  assert.equal(result.summary.placementMaxLevel, 10);
  assert.deepEqual(result.summary.textMiniTests, [{ level: 9, total: 7, minCorrect: 6 }]);
  for (const correct of [0, 5, 6, 7]) {
    const { engine, nine } = run(result.snapshot, 9, correct);
    assert.deepEqual(nine, result.snapshot.parcours.adaptive.tests[9].primary);
    assert.equal(engine.state.variables.niveau_lavi, correct >= 6 ? '10' : '9');
    assert.deepEqual(engine.state.levelResults[9], { correct, total: 7, passed: correct >= 6 });
  }
  for (let yes = 0; yes <= 4; yes++) for (let mastered = 0; mastered <= 9; mastered++) {
    const { engine } = run(result.snapshot, mastered, 7, yes);
    assert.equal(engine.state.variables.niveau_lavi, String(mastered + 1));
  }
  assert.equal(base.parcours.adaptive.maxLevel, 8, 'La compilation ne modifie pas le secours embarqué.');
});

test('Les nouvelles questions du même texte rejoignent le mini-test complet et restent testables au lab', () => {
  const records = fixture(); records.push(reading(8)); records.reverse();
  const result = compile(records);
  assert.deepEqual(result.errors, []);
  assert.deepEqual(result.snapshot.parcours.adaptive.tests[9], { primary: Array.from({ length: 8 }, (_, i) => `dev-mon-texte-01-q${i + 1}`), minCorrect: 7 });
  const lab = compileQuestionSet(base, records, { audioEnabled: true, labMode: true });
  assert.deepEqual(lab.errors, []);
  assert.deepEqual(lab.snapshot.devAudioQuestions.map(q => q.id), result.snapshot.parcours.adaptive.tests[9].primary);
  assert.ok(lab.snapshot.devAudioQuestions.every(q => q.supportText === lab.snapshot.devAudioQuestions[0].supportText));
});

test('Une publication partielle, un brouillon ou un groupe incohérent ne remplace pas le mini-test', () => {
  for (const [change, error] of [
    [row => row.fields[FIELDS.blockPosition] = 2, /sans doublon/],
    [row => row.fields[FIELDS.phase] = 'Audio DEV', /Phase = Test/],
    [row => row.fields[FIELDS.editorialState] = 'Brouillon', /Validée/],
    [row => row.fields[FIELDS.supportText] = 'Texte différent', /un seul texte commun/],
    [row => row.fields[FIELDS.points] = 0, /1 point/],
    [row => row.fields[FIELDS.blockId] = 'autre-bloc', /niveau-9-mon-texte-01/],
    [row => row.fields[FIELDS.level] = 10, /niveau invalide/],
  ]) {
    const records = fixture(); change(records.find(record => record.id === 'reading-7'));
    assert.match(compile(records).errors.join(' '), error);
  }
  const oldRecords = fixture().filter(record => !record.id.startsWith('reading-'));
  assert.deepEqual(compile(oldRecords).errors, []);
  assert.equal(compile(oldRecords).snapshot.parcours.adaptive.maxLevel, 8);
});

test('La banque publique fournit le mini-test 9 sans exposer les prompts privés', async () => {
  const result = compile(fixture());
  const env = { CF_PAGES_BRANCH: 'main', QUIZ_AUDIO_ENABLED: 'true', QUIZ_PRODUCTION_FEATURES_ENABLED: 'true',
    QUIZ_DB: { prepare: () => ({ first: async () => ({ snapshot: JSON.stringify(result.snapshot), version: 'level-nine', published_at: 'now' }) }) } };
  const response = await onRequestGet({ request: new Request('https://test.oulpanlavi.com/api/question-set'), env });
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.snapshot.parcours.adaptive.maxLevel, 9);
  for (const q of data.snapshot.questions.filter(q => q.niveau === 9)) {
    assert.equal(q.evaluationCriteria, undefined); assert.equal(q.acceptedExamples, undefined);
    assert.ok(q.supportText); assert.equal(q.points, 1);
  }
});
