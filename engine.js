// Moteur sans dépendance, indépendant de l’affichage.
function createQuizEngine(questionList, configuration) {
  const byId = new Map(questionList.map(q => [q.id, q]));
  const blocks = configuration.blocs;
  const blockIndexes = new Map(blocks.map((block, index) => [block.id, index]));
  const normalize = value => String(value).normalize('NFKD')
    .replace(/[\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u200e\u200f]/g, '').trim().replace(/\s+/g, ' ');
  let state;
  function reset() {
    state = { blockIndex: 0, itemIndex: 0, answers: {}, variables: {...configuration.variables},
      score: 0, possible: 0, attempted: 0, answered: false, finished: false, reason: '', last: null };
  }
  function current() {
    if (state.finished) return null;
    return byId.get(blocks[state.blockIndex].questions[state.itemIndex]);
  }
  function value(item) {
    if (item.type === 'field') return state.answers[item.value];
    if (item.type === 'variable') return state.variables[item.value];
    return item.value;
  }
  function condition(rule) {
    if (rule.op === 'always') return true;
    if (rule.op === 'and') return rule.vars.every(condition);
    if (rule.op === 'or') return rule.vars.some(condition);
    const [left, right] = rule.vars.map(value);
    switch (rule.op) {
      case 'is': case 'equal': return Array.isArray(left) ? left.includes(right) : left === right;
      case 'is_not': case 'not_equal': return Array.isArray(left) ? !left.includes(right) : left !== right;
      case 'greater_equal_than': return left >= right;
      case 'lower_equal_than': return left <= right;
      case 'greater_than': return left > right;
      case 'lower_than': return left < right;
      default: throw new Error(`Condition non prise en charge : ${rule.op}`);
    }
  }
  function submit(answer) {
    if (state.finished || state.answered) return null;
    const question = current();
    const empty = answer == null || (typeof answer === 'string' && !answer.trim()) || (Array.isArray(answer) && !answer.length);
    if (empty && question.obligatoire) throw new Error('Réponds à cette question.');
    if (!empty && question.type === 'qcm') {
      const values = question.multiple ? answer : [answer];
      if (!Array.isArray(values) || !values.every(v => question.choix.some(c => c.valeur === v))) throw new Error('Choix non valide.');
    }
    state.answers[question.id] = empty ? null : answer;
    const scored = question.bonneReponse != null;
    const correct = scored && !empty && (question.type === 'text'
      ? normalize(answer) === normalize(question.bonneReponse) : question.multiple ? answer.length === 1 && answer[0] === question.bonneReponse : answer === question.bonneReponse);
    if (scored) {
      state.possible += question.points;
      state.attempted++;
      if (correct) state.score += question.points;
    }
    state.answered = true;
    state.last = {questionId: question.id, scored, correct, skipped: empty};
    return state.last;
  }
  function finish(reason) { state.finished = true; state.reason = reason; }
  function next() {
    if (state.finished || !state.answered) return;
    const block = blocks[state.blockIndex];
    state.answered = false;
    if (block.stopOnNegative && state.answers[block.questions[state.itemIndex]] === false) {
      state.itemIndex = block.questions.length - 1;
    }
    if (state.itemIndex < block.questions.length - 1) { state.itemIndex++; return; }
    let target;
    for (const action of configuration.regles[block.id] || []) {
      if (!condition(action.condition)) continue;
      const details = action.details;
      if (action.action === 'add') state.variables[details.target.value] += value(details.value);
      else if (action.action === 'set') state.variables[details.target.value] = value(details.value);
      else if (action.action === 'jump') { target = details.to; break; }
      else throw new Error(`Action non prise en charge : ${action.action}`);
    }
    if (target && target.type !== 'field') {
      const declined = block.transition && state.answers[block.questions[0]] !== true;
      const alphabet = questionList.find(q => q.id === 'bfff1062-27eb-455c-bb6b-ae72d17c0495');
      const noAlphabet = !block.niveau && alphabet && state.answers[alphabet.id] === false;
      finish(declined ? 'choice' : noAlphabet ? 'alphabet' : state.blockIndex === blocks.length - 1 && Number(state.variables.niveau_lavi) > Number(block.niveau) ? 'completed' : 'threshold');
      return;
    }
    state.blockIndex = target ? blockIndexes.get(target.value) : state.blockIndex + 1;
    state.itemIndex = 0;
    if (state.blockIndex === undefined) throw new Error('Destination de parcours inconnue.');
    if (state.blockIndex >= blocks.length) finish('completed');
  }
  reset();
  return { reset, current, submit, next, get state() { return state; }, get block() { return blocks[state.blockIndex]; } };
}
if (typeof module !== 'undefined') module.exports = {createQuizEngine};
