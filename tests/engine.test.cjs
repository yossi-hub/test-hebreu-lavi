const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const {createQuizEngine, questionSupport, validateQuestionCoherence} = require('../engine.js');

const {questions, parcours} = vm.runInNewContext(
  fs.readFileSync('questions.js', 'utf8') + '\n({questions, parcours})',
);
const scored = questions.filter(question => question.bonneReponse != null);
const selfAssessmentIds = parcours.adaptive.selfAssessmentIds;

assert.equal(scored.length, 68);
assert.equal(new Set(questions.map(question => question.id)).size, questions.length);
assert.equal(new Set(scored.map(question => question.niveau)).size, 8);
assert.deepEqual(Array.from(parcours.adaptive.startLevelByYesCount), [1, 2, 3, 5, 6]);
for (let level = 1; level <= 8; level += 1) {
  const test = parcours.adaptive.tests[level];
  assert.equal(test.primary.length, level >= 5 ? 6 : 3);
  assert.equal(Boolean(test.tiebreaker), level < 5);
  for (const id of [...test.primary, test.tiebreaker].filter(Boolean)) {
    assert.equal(questions.find(question => question.id === id).niveau, level);
  }
}
const levelsWithVideoQuestions = new Set(scored.filter(question => question.media?.type === 'video').map(question => question.niveau));
for (const level of levelsWithVideoQuestions) {
  const primaryQuestions = parcours.adaptive.tests[level].primary.map(id => questions.find(question => question.id === id));
  assert.ok(primaryQuestions.some(question => question.media?.type === 'video'), `Le niveau ${level} doit tester la compréhension orale.`);
}

function wrongAnswer(question) {
  if (question.type === 'text') return '__incorrect__';
  const choice = question.choix.find(item => item.valeur !== question.bonneReponse);
  return question.multiple ? [choice.valeur] : choice.valeur;
}

function run({orientation = [true, true, true, true], answer = () => true} = {}) {
  const engine = createQuizEngine(questions, parcours);
  let orientationIndex = 0;
  let steps = 0;
  while (!engine.state.finished) {
    assert.ok(steps++ < 40, 'Pas de boucle de parcours');
    const question = engine.current();
    const value = selfAssessmentIds.includes(question.id)
      ? orientation[orientationIndex++]
      : answer(question, engine) ? question.bonneReponse : wrongAnswer(question);
    engine.submit(value);
    engine.next();
  }
  return engine;
}

const perfect = run();
assert.equal(perfect.state.variables.niveau_lavi, '9');
assert.equal(perfect.state.attempted, 12);
assert.equal(perfect.state.score, 12);
assert.deepEqual(Object.keys(perfect.state.levelResults), ['6', '8']);
assert.equal(perfect.state.reason, 'adaptive');

const exactSix = run({ answer: question => question.niveau === 6 });
assert.equal(exactSix.state.variables.niveau_lavi, '7');
assert.equal(exactSix.state.attempted, 18);
assert.deepEqual(Object.keys(exactSix.state.levelResults), ['6', '7', '8']);

const beginner = run({ orientation: [false, false, false, false], answer: () => false });
assert.equal(beginner.state.variables.niveau_lavi, '1');
assert.equal(beginner.state.attempted, 3);
assert.deepEqual(beginner.state.levelResults['1'], {correct: 0, total: 3, passed: false});

// Pour chaque orientation, le niveau d’inscription suit le dernier niveau acquis.
for (let yesCount = 0; yesCount <= selfAssessmentIds.length; yesCount += 1) {
  for (let masteredLevel = 0; masteredLevel <= parcours.adaptive.maxLevel; masteredLevel += 1) {
    const result = run({
      orientation: selfAssessmentIds.map((_, index) => index < yesCount),
      answer: question => question.niveau <= masteredLevel,
    });
    assert.equal(result.state.variables.niveau_lavi, String(masteredLevel + 1));
    assert.equal(result.state.lowerBound, masteredLevel);
  }
}

const routed = createQuizEngine(questions, parcours);
for (const value of [true, true, true, false]) {
  routed.submit(value);
  routed.next();
}
assert.equal(routed.state.currentLevel, 5);
assert.equal(routed.current().id, parcours.adaptive.tests['5'].primary[0]);

const contradictory = createQuizEngine(questions, parcours);
for (const value of [false, true, true, true]) {
  contradictory.submit(value);
  contradictory.next();
}
assert.equal(contradictory.state.currentLevel, 1);

const tiebreak = createQuizEngine(questions, parcours);
for (const value of [false, true, true, true]) { tiebreak.submit(value); tiebreak.next(); }
const levelOne = parcours.adaptive.tests['1'];
for (const [index, id] of levelOne.primary.entries()) {
  assert.equal(tiebreak.current().id, id);
  const question = tiebreak.current();
  tiebreak.submit(index < 2 ? question.bonneReponse : wrongAnswer(question));
  tiebreak.next();
}
assert.equal(tiebreak.current().id, levelOne.tiebreaker);
tiebreak.submit(tiebreak.current().bonneReponse);
tiebreak.next();
assert.deepEqual(tiebreak.state.levelResults['1'], {correct: 3, total: 4, passed: true});

const skippableRequired = createQuizEngine(questions, parcours);
for (const value of [false, false, false, false]) { skippableRequired.submit(value); skippableRequired.next(); }
skippableRequired.submit(skippableRequired.current().bonneReponse);
skippableRequired.next();
assert.equal(skippableRequired.current().obligatoire, true);
const skipped = skippableRequired.submit(null);
assert.equal(skipped.skipped, true);
assert.equal(skipped.correct, false);

tiebreak.reset();
assert.equal(tiebreak.state.score, 0);
assert.equal(Object.keys(tiebreak.state.answers).length, 0);
assert.throws(() => tiebreak.submit('   '), /Réponds/);
tiebreak.submit(true);
tiebreak.next();
tiebreak.submit(true);
tiebreak.next();
tiebreak.submit(true);
tiebreak.next();
tiebreak.submit(true);
tiebreak.next();
assert.throws(() => tiebreak.submit('invalid-choice'), /Choix/);

// Chaque support est posé au moins trois fois de suite, quel que soit le résultat.
assert.deepEqual(validateQuestionCoherence(questions, parcours), []);
const blocks = new Map(parcours.blocs.flatMap(block => block.questions.map(id => [id, block])));
for (const correctCount of [0, 4, 5, 6]) {
  const grouped = createQuizEngine(questions, parcours);
  for (let index = 0; index < 4; index++) { grouped.submit(true); grouped.next(); }
  const sequence = [];
  for (let index = 0; index < 6; index++) {
    assert.equal(grouped.state.currentLevel, 6);
    sequence.push(questionSupport(grouped.current(), blocks.get(grouped.current().id)));
    assert.deepEqual(grouped.support, { type: index < 3 ? 'video' : 'text', position: index % 3 + 1, total: 3 });
    assert.equal(grouped.state.levelQuestionCount, 6);
    grouped.submit(index < correctCount ? grouped.current().bonneReponse : null);
    grouped.next();
  }
  assert.equal(new Set(sequence.slice(0, 3).map(support => support.key)).size, 1);
  assert.equal(new Set(sequence.slice(3).map(support => support.key)).size, 1);
  assert.notEqual(sequence[0].key, sequence[3].key);
  assert.deepEqual(grouped.state.levelResults['6'], { correct: correctCount, total: 6, passed: correctCount >= 5 });
}
const incoherent = JSON.parse(JSON.stringify(parcours));
[incoherent.adaptive.tests['6'].primary[1], incoherent.adaptive.tests['6'].primary[3]] = [incoherent.adaptive.tests['6'].primary[3], incoherent.adaptive.tests['6'].primary[1]];
assert.match(validateQuestionCoherence(questions, incoherent).join(' '), /3 questions consécutives/);
assert.throws(() => createQuizEngine(questions, incoherent), /3 questions consécutives/);
const canonicalVideo = questions.find(q => q.media?.type === 'video');
const alternateVideo = { ...canonicalVideo, media: { type: 'video', url: `https://www.youtube.com/watch?v=${canonicalVideo.media.url.split('/').at(-1)}&t=10` } };
assert.equal(questionSupport(canonicalVideo).key, questionSupport(alternateVideo).key);

console.log('OK : groupes texte/vidéo de trois questions, score 5/6, départage 3+1, bornes de niveau et reset.');
