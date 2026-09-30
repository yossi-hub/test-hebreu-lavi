const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const {createQuizEngine} = require('../engine.js');

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
  assert.equal(test.primary.length, 3);
  assert.ok(test.tiebreaker);
  for (const id of [...test.primary, test.tiebreaker]) {
    assert.equal(questions.find(question => question.id === id).niveau, level);
  }
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
assert.equal(perfect.state.variables.niveau_lavi, '8');
assert.equal(perfect.state.attempted, 6);
assert.equal(perfect.state.score, 6);
assert.deepEqual(Object.keys(perfect.state.levelResults), ['6', '8']);
assert.equal(perfect.state.reason, 'adaptive');

const exactSix = run({ answer: question => question.niveau === 6 });
assert.equal(exactSix.state.variables.niveau_lavi, '6');
assert.equal(exactSix.state.attempted, 9);
assert.deepEqual(Object.keys(exactSix.state.levelResults), ['6', '7', '8']);

const beginner = run({ orientation: [false, false, false, false], answer: () => false });
assert.equal(beginner.state.variables.niveau_lavi, '1');
assert.equal(beginner.state.attempted, 3);
assert.deepEqual(beginner.state.levelResults['1'], {correct: 0, total: 3, passed: false});

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
for (const value of [true, true, true, true]) { tiebreak.submit(value); tiebreak.next(); }
const levelSix = parcours.adaptive.tests['6'];
for (const [index, id] of levelSix.primary.entries()) {
  assert.equal(tiebreak.current().id, id);
  const question = tiebreak.current();
  tiebreak.submit(index < 2 ? question.bonneReponse : wrongAnswer(question));
  tiebreak.next();
}
assert.equal(tiebreak.current().id, levelSix.tiebreaker);
tiebreak.submit(tiebreak.current().bonneReponse);
tiebreak.next();
assert.deepEqual(tiebreak.state.levelResults['6'], {correct: 3, total: 4, passed: true});

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

console.log('OK : orientation, mini-tests adaptatifs 3+1, départage, bornes de niveau et reset.');
