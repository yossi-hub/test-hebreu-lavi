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
    if ((audioCapability.debug || questionLabMode) && data.debug) {
      audioAttempts.push(data.debug);
      if (audioAttempts.length > 50) audioAttempts.shift();
      renderAudioAttempts();
      $('audio-debug').open = true;
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
      audioCapability = data;
      if (data.environment === 'production') $('audio-demo-start').textContent = '🎙️ Tester les questions audio';
      populateAudioExercises(); $('audio-dev-entry').hidden = false;
      $('audio-catalog-status').textContent = devAudioQuestions.length
        ? `${devAudioQuestions.length} question${devAudioQuestions.length > 1 ? 's' : ''} audio ${new URLSearchParams(globalThis.location?.search || '').get('preview') === '1' ? 'en aperçu Airtable' : 'publiée' + (devAudioQuestions.length > 1 ? 's' : '')}.`
        : 'Démo audio · Ajoute tes questions dans Airtable, puis mets à jour DEV.';
      if (new URLSearchParams(globalThis.location?.search || '').get('lab') === '1') {
        configureQuestionLab(); await loadQuestionLab(false);
      }
    }
  } catch { /* Le test existant continue sans la fonctionnalité DEV. */ }
}

function renderAudioAttempts() {
  const content = $('audio-debug-content'); content.replaceChildren();
  const currentAttempts = audioAttempts.filter(attempt => attempt.questionId === engine.current()?.id);
  if (!currentAttempts.length) { $('audio-debug').hidden = true; return; }
  for (const attempt of currentAttempts) {
    const card = document.createElement('article'); card.className = 'audio-attempt';
    const question = document.createElement('h3'); question.textContent = attempt.question;
    question.dir = /[\u0590-\u05ff]/.test(attempt.question) ? 'rtl' : 'ltr';
    const date = document.createElement('p'); date.className = 'help';
    date.textContent = new Date(attempt.answeredAt).toLocaleString('fr-FR');
    const transcriptLabel = document.createElement('h4'); transcriptLabel.textContent = 'Transcription';
    const transcript = document.createElement('p'); transcript.className = 'audio-transcript'; transcript.dir = 'rtl'; transcript.lang = 'he';
    transcript.textContent = attempt.transcription || 'Aucune transcription exploitable.';
    const decision = document.createElement('p');
    const label = attempt.status === 'correct' ? 'Réponse juste · 1 point' : attempt.status === 'incorrect' ? 'Réponse incorrecte · 0 point' : 'À réessayer · Aucun point attribué';
    decision.textContent = `Décision retenue : ${label}. Certitude : ${Math.round(attempt.confidence * 100)} %.`;
    const outputLabel = document.createElement('h4'); outputLabel.textContent = 'Sortie du prompt · JSON';
    const output = document.createElement('pre');
    output.textContent = attempt.evaluationOutput != null ? JSON.stringify(attempt.evaluationOutput, null, 2) : 'L’évaluateur n’a pas renvoyé de résultat JSON.';
    const reason = document.createElement('p'); reason.textContent = `Justification : ${attempt.reason}`;
    card.append(question, date, transcriptLabel, transcript, decision, outputLabel, output, reason); content.append(card);
  }
  $('audio-debug').hidden = false;
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
  $('welcome-day').textContent = audioCapability?.environment === 'production' ? 'ESPACE DE TEST' : 'ESPACE DE TEST DEV';
  $('welcome-title').textContent = 'Tester mes questions';
  $('welcome-intro').textContent = 'Choisis un exercice et réponds comme un élève, avec les choix proposés ou une note vocale.';
  $('welcome-description').textContent = 'Le texte hébreu s’affiche de droite à gauche. Tes brouillons restent dans Airtable pendant les essais.';
  for (const id of ['intake-history', 'intake-prompt', 'intake-form', 'intake-choices', 'intake-complete', 'start-action', 'audio-catalog-status']) $(id).hidden = true;
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
    stopAudio(); audioDemoMode = true; audioAttempts.length = 0;
    engine = createQuizEngine(audioExperimentQuestions, audioExperimentConfiguration(audioExperimentQuestions));
    $('history').replaceChildren(); previousPassage = ''; previousMediaKey = '';
    $('welcome').hidden = true; $('results').hidden = true; $('quiz').hidden = false; $('active-question').hidden = false;
    $('audio-demo-return').hidden = false;
    if (questionLabMode) renderAudioAttempts();
    renderQuestion();
  });
  $('audio-demo-return').addEventListener('click', () => {
    stopAudio(); audioDemoMode = false; engine = createQuizEngine(questions, parcours);
    $('audio-demo-return').hidden = true; $('audio-debug').hidden = true;
    $('quiz').hidden = true; $('welcome').hidden = false;
  });
  return loadAudioCapability();
}
