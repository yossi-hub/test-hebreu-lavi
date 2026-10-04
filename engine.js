// Moteur sans dépendance, indépendant de l’affichage.
function questionSupport(question, block) {
  if (question?.media?.type === 'video') {
    let source = question.media.url;
    try {
      const url = new URL(source);
      const host = url.hostname.replace(/^(www\.|m\.)/, '');
      const id = host === 'youtu.be' ? url.pathname.split('/')[1]
        : ['youtube.com', 'youtube-nocookie.com'].includes(host)
          ? url.searchParams.get('v') || url.pathname.match(/^\/(?:shorts|embed)\/([^/]+)/)?.[1] : null;
      if (id) source = `youtube:${id}`;
    } catch { /* La validation éditoriale contrôle déjà les URL. */ }
    return { key: `video:${source}`, type: 'video' };
  }
  if (block?.passage?.trim()) return { key: `text:${block.passage.trim().replace(/\s+/g, ' ')}`, type: 'text' };
  return null;
}

function validateQuestionCoherence(questionList, configuration) {
  if (!configuration.adaptive) return [];
  const byId = new Map(questionList.map(q => [q.id, q]));
  const blocks = new Map(configuration.blocs.flatMap(block => block.questions.map(id => [id, block])));
  const errors = [];
  for (const [level, test] of Object.entries(configuration.adaptive.tests)) {
    let current = null, count = 0;
    const finishGroup = () => {
      if (current && count < 3) errors.push(`Niveau ${level} : chaque ${current.type === 'video' ? 'vidéo' : 'texte'} doit être suivi d’au moins 3 questions consécutives (groupe de ${count}).`);
    };
    for (const id of test.primary) {
      const support = questionSupport(byId.get(id), blocks.get(id));
      if (!support || support.key !== current?.key) { finishGroup(); current = support; count = 0; }
      if (support) count += 1;
    }
    finishGroup();
    if (test.tiebreaker) {
      const support = questionSupport(byId.get(test.tiebreaker), blocks.get(test.tiebreaker));
      if (support && support.key !== current?.key) errors.push(`Niveau ${level} : le départage doit conserver le dernier texte ou la dernière vidéo.`);
    }
  }
  return errors;
}

function audioVerdict(question, answer) {
  if (question.type !== 'audio_response' || answer == null) return;
  if (!['correct', 'incorrect'].includes(answer?.status) || typeof answer.confidence !== 'number'
    || !Number.isFinite(answer.confidence) || answer.confidence < 0.75 || answer.confidence > 1) {
    throw new Error('La réponse audio doit être réanalysée, sans perte de point.');
  }
}
function createAdaptiveQuizEngine(questionList, configuration) {
  const byId = new Map(questionList.map(question => [question.id, question]));
  const adaptive = configuration.adaptive;
  const blocks = configuration.blocs;
  const blockByQuestion = new Map();
  for (const block of blocks) for (const id of block.questions) blockByQuestion.set(id, block);
  const normalize = value => String(value).normalize('NFKD')
    .replace(/[\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u200e\u200f]/g, '').trim().replace(/\s+/g, ' ');
  const selfAssessmentIds = adaptive.selfAssessmentIds;
  const minLevel = adaptive.minLevel || 1;
  const maxLevel = adaptive.maxLevel || 8;
  let state;

  function question(id) {
    const item = byId.get(id);
    if (!item) throw new Error(`Question adaptative inconnue : ${id}`);
    return item;
  }

  function levelTest(level) {
    const test = adaptive.tests[String(level)];
    if (!test || !Array.isArray(test.primary) || test.primary.length < 3
      || new Set(test.primary).size !== test.primary.length
      || test.tiebreaker && test.primary.includes(test.tiebreaker)) {
      throw new Error(`Mini-test adaptatif invalide pour le niveau ${level}.`);
    }
    const minimum = test.minCorrect ?? Math.ceil(test.primary.length * 0.75);
    if (!Number.isInteger(minimum) || minimum < 1 || minimum > test.primary.length) throw new Error(`Seuil adaptatif invalide pour le niveau ${level}.`);
    return test;
  }

  function beginLevel(level) {
    const test = levelTest(level);
    state.mode = 'test';
    state.currentLevel = level;
    state.testQuestionIndex = 0;
    state.testCorrect = 0;
    state.levelQuestionCount = test.primary.length;
    state.tiebreakerActive = false;
    state.currentQuestionId = test.primary[0];
    state.levelQuestionNumber = 1;
  }

  function finish() {
    state.finished = true;
    state.reason = 'adaptive';
    state.currentQuestionId = null;
    // Le résultat indique le niveau où s’inscrire, après le dernier niveau acquis.
    state.variables.niveau_lavi = String(Math.max(minLevel, state.lowerBound + 1));
  }

  function reset() {
    for (const id of selfAssessmentIds) question(id);
    for (let level = minLevel; level <= maxLevel; level += 1) {
      const test = levelTest(level);
      [...test.primary, test.tiebreaker].filter(Boolean).forEach(question);
    }
    const coherenceErrors = validateQuestionCoherence(questionList, configuration);
    if (coherenceErrors.length) throw new Error(coherenceErrors.join(' '));
    state = {
      answers: {}, variables: {...configuration.variables}, score: 0, possible: 0,
      attempted: 0, answered: false, finished: false, reason: '', last: null,
      mode: 'orientation', orientationIndex: 0, currentQuestionId: selfAssessmentIds[0],
      currentLevel: null, levelQuestionNumber: 0, testQuestionIndex: 0, testCorrect: 0,
      levelQuestionCount: 0, tiebreakerActive: false,
      lowerBound: 0, upperBound: maxLevel + 1, levelResults: {},
    };
    state.variables.niveau_lavi = String(minLevel);
  }

  function current() {
    return state.finished ? null : question(state.currentQuestionId);
  }

  function submit(answer) {
    if (state.finished || state.answered) return null;
    const item = current();
    audioVerdict(item, answer);
    const empty = answer == null || (typeof answer === 'string' && !answer.trim()) || (Array.isArray(answer) && !answer.length);
    if (empty && item.obligatoire && state.mode !== 'test') throw new Error('Réponds à cette question.');
    if (!empty && item.type === 'qcm') {
      const values = item.multiple ? answer : [answer];
      if (!Array.isArray(values) || !values.every(value => item.choix.some(choice => choice.valeur === value))) {
        throw new Error('Choix non valide.');
      }
    }
    state.answers[item.id] = empty ? null : answer;
    const scored = item.bonneReponse != null || item.type === 'audio_response' && item.points > 0;
    const correct = scored && !empty && (item.type === 'audio_response' ? answer.status === 'correct' : item.type === 'text'
      ? normalize(answer) === normalize(item.bonneReponse)
      : item.multiple ? answer.length === 1 && answer[0] === item.bonneReponse : answer === item.bonneReponse);
    if (scored) {
      state.possible += item.points;
      state.attempted += 1;
      if (correct) state.score += item.points;
    }
    state.answered = true;
    state.last = {questionId: item.id, scored, correct, skipped: empty};
    return state.last;
  }

  function nextCandidate() {
    if (state.upperBound - state.lowerBound <= 1) return finish();
    let candidate = Math.ceil((state.lowerBound + state.upperBound) / 2);
    candidate = Math.max(state.lowerBound + 1, Math.min(state.upperBound - 1, candidate));
    beginLevel(candidate);
  }

  function completeLevel() {
    const test = levelTest(state.currentLevel);
    const total = state.testQuestionIndex + 1;
    const passed = state.testCorrect >= (test.minCorrect ?? Math.ceil(test.primary.length * 0.75));
    state.levelResults[state.currentLevel] = { correct: state.testCorrect, total, passed };
    if (passed) state.lowerBound = Math.max(state.lowerBound, state.currentLevel);
    else state.upperBound = Math.min(state.upperBound, state.currentLevel);
    nextCandidate();
  }

  function next() {
    if (state.finished || !state.answered) return;
    state.answered = false;
    if (state.mode === 'orientation') {
      state.orientationIndex += 1;
      if (state.orientationIndex < selfAssessmentIds.length) {
        state.currentQuestionId = selfAssessmentIds[state.orientationIndex];
        return;
      }
      let consecutiveYes = 0;
      for (const id of selfAssessmentIds) {
        if (state.answers[id] !== true) break;
        consecutiveYes += 1;
      }
      const startLevel = adaptive.startLevelByYesCount[consecutiveYes];
      beginLevel(startLevel);
      return;
    }

    if (state.last?.correct) state.testCorrect += 1;
    const test = levelTest(state.currentLevel);
    if (state.testQuestionIndex < test.primary.length - 1) {
      state.testQuestionIndex += 1;
      state.levelQuestionNumber = state.testQuestionIndex + 1;
      state.currentQuestionId = test.primary[state.testQuestionIndex];
      return;
    }
    const minimum = test.minCorrect ?? Math.ceil(test.primary.length * 0.75);
    if (state.testQuestionIndex === test.primary.length - 1 && test.tiebreaker && state.testCorrect === minimum - 1) {
      state.testQuestionIndex = test.primary.length;
      state.levelQuestionNumber = test.primary.length + 1;
      state.levelQuestionCount = test.primary.length + 1;
      state.tiebreakerActive = true;
      state.currentQuestionId = test.tiebreaker;
      return;
    }
    completeLevel();
  }

  reset();
  return {
    reset, current, submit, next,
    get state() { return state; },
    get block() { return blockByQuestion.get(state.currentQuestionId) || { id: 'orientation', questions: selfAssessmentIds, niveau: null }; },
    get support() {
      if (state.mode !== 'test' || state.finished) return null;
      const support = questionSupport(current(), blockByQuestion.get(state.currentQuestionId));
      if (!support) return null;
      const test = levelTest(state.currentLevel);
      const ids = [...test.primary, ...(state.tiebreakerActive ? [test.tiebreaker] : [])];
      const keyAt = index => questionSupport(question(ids[index]), blockByQuestion.get(ids[index]))?.key;
      let start = state.testQuestionIndex, end = start;
      while (start > 0 && keyAt(start - 1) === support.key) start -= 1;
      while (end + 1 < ids.length && keyAt(end + 1) === support.key) end += 1;
      return { type: support.type, position: state.testQuestionIndex - start + 1, total: end - start + 1 };
    },
  };
}

function createLegacyQuizEngine(questionList, configuration) {
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
    audioVerdict(question, answer);
    const empty = answer == null || (typeof answer === 'string' && !answer.trim()) || (Array.isArray(answer) && !answer.length);
    if (empty && question.obligatoire) throw new Error('Réponds à cette question.');
    if (!empty && question.type === 'qcm') {
      const values = question.multiple ? answer : [answer];
      if (!Array.isArray(values) || !values.every(v => question.choix.some(c => c.valeur === v))) throw new Error('Choix non valide.');
    }
    state.answers[question.id] = empty ? null : answer;
    const scored = question.bonneReponse != null || question.type === 'audio_response' && question.points > 0;
    const correct = scored && !empty && (question.type === 'audio_response' ? answer.status === 'correct' : question.type === 'text'
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
  return { reset, current, submit, next, get state() { return state; }, get block() { return blocks[state.blockIndex]; },
    get support() {
      const block = blocks[state.blockIndex];
      const support = questionSupport(current(), block);
      if (!support || !block) return null;
      const keyAt = index => questionSupport(byId.get(block.questions[index]), block)?.key;
      let start = state.itemIndex, end = start;
      while (start > 0 && keyAt(start - 1) === support.key) start -= 1;
      while (end + 1 < block.questions.length && keyAt(end + 1) === support.key) end += 1;
      return { type: support.type, position: state.itemIndex - start + 1, total: end - start + 1 };
    },
  };
}

function createQuizEngine(questionList, configuration) {
  return configuration.adaptive
    ? createAdaptiveQuizEngine(questionList, configuration)
    : createLegacyQuizEngine(questionList, configuration);
}
if (typeof module !== 'undefined') module.exports = {createQuizEngine, questionSupport, validateQuestionCoherence};
