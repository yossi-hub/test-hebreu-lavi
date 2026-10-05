// Chargé dans l’interface existante ; l’autorisation vient exclusivement du serveur.
let audioCapability = null;
let audioControl = null;
let audioDemoMode = false;
let questionLabMode = false;
let questionLabBusy = false;
let questionSetVersion = '';
let devAudioQuestions = [];
let audioExperimentQuestions = [];
let audioRequest = null;
const audioAttempts = [];

function stopAudio() {
  audioControl?.dispose(); audioControl = null;
  audioRequest?.abort(); audioRequest = null;
  document.getElementById('audio-answer').hidden = true;
}

async function submitAudio(blob, question) {
  if (!audioCapability?.enabled || engine.current()?.id !== question.id) return { status: 'uncertain' };
  const currentEngine = engine;
  const form = new FormData();
  form.append('questionId', question.id); form.append('version', questionSetVersion);
  if (questionLabMode) form.append('lab', '1');
  form.append('audio', blob, 'response.wav');
  const preview = new URLSearchParams(globalThis.location?.search || '').get('preview') === '1';
  const token = globalThis.sessionStorage?.getItem('quizAdminToken');
  const controller = new AbortController(); audioRequest = controller;
  const timeout = setTimeout(() => controller.abort(), 65000);
  $('skip').disabled = true;
  try {
    const response = await fetch(`/api/audio-response${preview ? '?preview=1' : ''}`, {
      method: 'POST', body: form, signal: controller.signal,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error('Analyse indisponible.');
    const data = await response.json();
    if (currentEngine !== engine || engine.current()?.id !== question.id) return { status: 'uncertain' };
    if (audioCapability.debug && data.debug) {
      audioAttempts.push(data.debug);
      if (audioAttempts.length > 50) audioAttempts.shift();
      $('audio-debug-content').textContent = audioAttempts.map(attempt => [
        `Question : ${attempt.question}`, `Transcription : ${attempt.transcription}`,
        `Décision : ${attempt.status}`, `Confidence : ${attempt.confidence}`, `Reason : ${attempt.reason}`,
        `Date : ${attempt.answeredAt}`, `Stockage D1 : ${attempt.stored ? 'oui' : 'non (mémoire de cette page)'}`,
      ].join('\n')).join('\n\n');
      $('audio-debug').hidden = false;
    }
    if (['correct', 'incorrect'].includes(data.status) && typeof data.confidence === 'number'
      && data.confidence >= 0.75 && data.confidence <= 1) submitAnswer({ status: data.status, confidence: data.confidence, duration: (blob.size - 44) / 32000 });
    return data;
  } finally {
    clearTimeout(timeout); if (audioRequest === controller) audioRequest = null;
    $('skip').disabled = false;
  }
}

async function loadAudioCapability() {
  try {
    const token = globalThis.sessionStorage?.getItem('quizAdminToken');
    const response = await fetch('/api/audio-response', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    const data = response.ok ? await response.json() : null;
    await questionSetReady;
    if (data?.enabled === true && data.demo?.type === 'audio_response') {
      audioCapability = data; populateAudioExercises(); $('audio-dev-entry').hidden = false;
      $('audio-catalog-status').textContent = devAudioQuestions.length
        ? `${devAudioQuestions.length} question${devAudioQuestions.length > 1 ? 's' : ''} audio ${new URLSearchParams(globalThis.location?.search || '').get('preview') === '1' ? 'en aperçu Airtable' : 'publiée' + (devAudioQuestions.length > 1 ? 's' : '')}.`
        : 'Démo audio · Ajoute tes questions dans Airtable, puis mets à jour DEV.';
      if (new URLSearchParams(globalThis.location?.search || '').get('lab') === '1') {
        configureQuestionLab(); await loadQuestionLab(false);
      }
    }
  } catch { /* Le test existant continue sans la fonctionnalité DEV. */ }
}

function audioExperimentConfiguration(questionList) {
  const blocs = [];
  for (const q of questionList) {
    const group = q.supportGroup || '';
    let block = blocs.at(-1);
    if (!group || block?.supportGroup !== group) {
      block = { id: `audio-exercise-${blocs.length}`, supportGroup: group, niveau: q.niveau || 1, questions: [] };
      if (q.supportText) block.passage = q.supportText;
      blocs.push(block);
    }
    block.questions.push(q.id);
  }
  return { variables: {}, regles: {}, blocs };
}

function populateAudioExercises() {
  const select = $('audio-exercise');
  select.replaceChildren();
  const all = document.createElement('option'); all.value = ''; all.textContent = 'Toutes les questions'; select.append(all);
  for (const group of new Set(devAudioQuestions.map(q => q.supportGroup).filter(Boolean))) {
    const option = document.createElement('option'); option.value = group; option.textContent = group; select.append(option);
  }
  $('audio-exercise-picker').hidden = select.children.length < 2;
}

function configureQuestionLab() {
  questionLabMode = true;
  $('welcome-day').textContent = 'ESPACE DE TEST DEV';
  $('welcome-title').textContent = 'Tester mes questions';
  $('welcome-intro').textContent = 'Choisis un exercice et réponds comme un élève, avec une note vocale.';
  $('welcome-description').textContent = 'Le texte hébreu s’affiche de droite à gauche. Tes brouillons restent dans Airtable pendant les essais.';
  for (const id of ['intake-history', 'intake-prompt', 'intake-form', 'intake-complete', 'start-action', 'audio-catalog-status']) $(id).hidden = true;
  $('question-lab-controls').hidden = false;
  $('audio-demo-start').textContent = 'Commencer l’essai';
  $('audio-demo-return').textContent = 'Choisir un autre exercice';
}

async function loadQuestionLab(importDrafts = true) {
  if (!questionLabMode || questionLabBusy) return;
  questionLabBusy = true;
  const button = $('question-lab-reload'), status = $('question-lab-status');
  button.disabled = true; $('audio-demo-start').disabled = true;
  $('question-lab-errors').replaceChildren();
  status.textContent = importDrafts ? 'Chargement de tes questions depuis Airtable…' : 'Ouverture de l’espace de test…';
  try {
    const response = await fetch('/api/question-lab', { method: importDrafts ? 'POST' : 'GET' });
    const data = await response.json();
    if (!response.ok) {
      for (const message of data.errors || []) {
        const item = document.createElement('li'); item.textContent = message; $('question-lab-errors').append(item);
      }
      throw new Error(data.error || 'Chargement indisponible. Réessaie.');
    }
    if (!Array.isArray(data.questions) || !data.version) throw new Error('Questions de test indisponibles.');
    devAudioQuestions = data.questions; questionSetVersion = data.version;
    const previous = $('audio-exercise').value;
    populateAudioExercises();
    const groups = [...new Set(devAudioQuestions.map(q => q.supportGroup).filter(Boolean))];
    $('audio-exercise').value = groups.includes(previous) ? previous : groups[0] || '';
    status.textContent = `${devAudioQuestions.length} questions prêtes à tester, dont ${data.draftQuestions || 0} en brouillon. Après une modification dans Airtable, recharge-les ici.`;
  } catch (error) {
    if (!importDrafts) { devAudioQuestions = []; populateAudioExercises(); }
    status.textContent = error.message;
  } finally {
    questionLabBusy = false; button.disabled = false;
    $('audio-demo-start').disabled = !devAudioQuestions.length;
  }
}

function initializeAudioExperiment() {
  $('question-lab-reload').addEventListener('click', () => loadQuestionLab(true));
  $('audio-demo-start').addEventListener('click', () => {
    if (!audioCapability?.enabled || questionLabMode && (questionLabBusy || !devAudioQuestions.length)) return;
    const selectedGroup = $('audio-exercise').value;
    audioExperimentQuestions = devAudioQuestions.length ? devAudioQuestions.filter(q => !selectedGroup || q.supportGroup === selectedGroup) : [audioCapability.demo];
    if (!audioExperimentQuestions.length) return;
    stopAudio(); audioDemoMode = true;
    engine = createQuizEngine(questionLabMode ? audioExperimentQuestions.map(q => ({ ...q, obligatoire: false })) : audioExperimentQuestions, audioExperimentConfiguration(audioExperimentQuestions));
    $('history').replaceChildren(); previousPassage = ''; previousMediaKey = '';
    $('welcome').hidden = true; $('results').hidden = true; $('quiz').hidden = false; $('active-question').hidden = false;
    $('audio-demo-return').hidden = false;
    renderQuestion();
  });
  $('audio-demo-return').addEventListener('click', () => {
    stopAudio(); audioDemoMode = false; engine = createQuizEngine(questions, parcours);
    $('audio-demo-return').hidden = true; $('audio-debug').hidden = true;
    $('quiz').hidden = true; $('welcome').hidden = false;
  });
  return loadAudioCapability();
}
