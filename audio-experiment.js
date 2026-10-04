// Chargé dans l’interface existante ; l’autorisation vient exclusivement du serveur.
let audioCapability = null;
let audioControl = null;
let audioDemoMode = false;
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
      audioCapability = data; $('audio-dev-entry').hidden = false;
      $('audio-catalog-status').textContent = devAudioQuestions.length
        ? `${devAudioQuestions.length} question${devAudioQuestions.length > 1 ? 's' : ''} audio ${new URLSearchParams(globalThis.location?.search || '').get('preview') === '1' ? 'en aperçu Airtable' : 'publiée' + (devAudioQuestions.length > 1 ? 's' : '')}.`
        : 'Démo audio · Ajoute tes questions dans Airtable, puis mets à jour DEV.';
    }
  } catch { /* Le test existant continue sans la fonctionnalité DEV. */ }
}

function initializeAudioExperiment() {
  $('audio-demo-start').addEventListener('click', () => {
    if (!audioCapability?.enabled) return;
    stopAudio(); audioDemoMode = true;
    audioExperimentQuestions = devAudioQuestions.length ? devAudioQuestions : [audioCapability.demo];
    engine = createQuizEngine(audioExperimentQuestions, { variables: {}, regles: {}, blocs: [{ id: 'audio-demo', niveau: 1, questions: audioExperimentQuestions.map(q => q.id) }] });
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
