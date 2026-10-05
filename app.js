const $ = (id) => document.getElementById(id);
let engine = createQuizEngine(questions, parcours);
// Données conservées uniquement en mémoire : un rechargement les efface.
const userProfile = { prenom: '', nom: '', email: '', telephone: '' };
const intakeSteps = [
  { key: 'identite', label: 'Prénom et nom', question: 'Donne-moi ton prénom et ton nom, s’il te plaît.', type: 'text', autocomplete: 'name' },
  { key: 'email', label: 'Email', question: 'Quelle est ton adresse email ?', type: 'email', autocomplete: 'email' },
  { key: 'telephone', label: 'Téléphone', question: 'Quel est ton numéro de téléphone avec l’indicatif du pays ? Par exemple : +33 6 12 34 56 78 (France) ou +972 50 123 4567 (Israël).', type: 'tel', autocomplete: 'tel' },
];
let intakeIndex = 0;

function intakeMessage(text, student = false) {
  const bubble = document.createElement('div');
  bubble.className = `bubble ${student ? 'student' : 'teacher'}`;
  const content = document.createElement('p');
  content.dir = 'auto';
  // textContent affiche les réponses comme du texte, jamais comme du HTML.
  content.textContent = text;
  if (student) {
    bubble.append(content);
  } else {
    const sender = document.createElement('span');
    sender.className = 'sender';
    sender.textContent = 'Professeur Lavi';
    bubble.append(sender, content);
  }
  $('intake-history').append(bubble);
}

function renderIntakeStep(focus = true) {
  const step = intakeSteps[intakeIndex];
  const conversationalInput = true;
  $('intake-question').textContent = step.question;
  $('intake-label').textContent = step.label;
  $('intake-form').className = conversationalInput ? 'composer chat-input-only' : 'composer';
  const input = $('intake-answer');
  input.type = step.type;
  input.name = step.key;
  input.autocomplete = step.autocomplete;
  input.placeholder = step.key === 'telephone' ? '+33 6 12 34 56 78' : conversationalInput ? `Écris ton ${step.label.toLowerCase()}…` : '';
  input.inputMode = step.key === 'telephone' ? 'tel' : step.key === 'email' ? 'email' : 'text';
  input.value = '';
  input.removeAttribute('aria-invalid');
  const submit = $('intake-submit');
  submit.setAttribute('aria-label', conversationalInput ? `Envoyer ton ${step.label.toLowerCase()}` : 'Envoyer');
  submit.textContent = conversationalInput ? '➤' : 'Envoyer →';
  $('intake-error').hidden = true;
  if (focus) input.focus();
  scrollConversationToBottom();
}

$('intake-form').addEventListener('submit', (event) => {
  event.preventDefault();
  if (intakeIndex >= intakeSteps.length) return;
  const step = intakeSteps[intakeIndex];
  const input = $('intake-answer');
  let value = input.value.trim();
  let error = '';
  if (!value) error = `Renseigne ton ${step.label.toLowerCase()}.`;
  else if (step.key === 'identite' && value.split(/\s+/).length < 2) {
    error = 'Saisis ton prénom et ton nom.';
  }
  else if (step.key === 'email' && (!input.validity.valid || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))) {
    error = 'Saisis un email valide, par exemple prenom@exemple.fr.';
  }
  else if (step.key === 'telephone') {
    const normalized = value.replace(/[\s().-]/g, '').replace(/^00/, '+');
    if (!/^\+[1-9]\d{6,14}$/.test(normalized)) {
      error = 'Ajoute l’indicatif de ton pays, par exemple +33 6 12 34 56 78 ou +972 50 123 4567.';
    } else value = normalized;
  }
  if (error) {
    $('intake-error').textContent = error;
    $('intake-error').hidden = false;
    input.setAttribute('aria-invalid', 'true');
    input.focus();
    return;
  }
  if (step.key === 'identite') {
    const [prenom, ...nom] = value.split(/\s+/);
    userProfile.prenom = prenom;
    userProfile.nom = nom.join(' ');
  } else {
    userProfile[step.key] = value;
  }
  intakeMessage(step.question);
  intakeMessage(value, true);
  if (step.key === 'identite') intakeMessage(`Enchanté ${userProfile.prenom}`);
  intakeIndex += 1;
  if (intakeIndex < intakeSteps.length) {
    renderIntakeStep();
  } else {
    $('intake-prompt').hidden = true;
    $('intake-form').hidden = true;
    $('intake-confirmation').textContent = `Parfait, merci ${userProfile.prenom}. On peut commencer le test 😊`;
    $('intake-complete').hidden = false;
    $('start-action').hidden = false;
    $('start').focus({ preventScroll: true });
    scrollConversationToBottom();
  }
});


let displayedChoices = [];
let selection = new Set();
let orientationSelections = new Map();
let testIntroShown = false;
let resultEmailSent = false;
let recommendationRequest = 0;
let previousMediaKey = '';
let previousPassage = '';
function personalize(text) {
  return text.replace(/\{\{field:358f8a5f-6233-46f7-acc7-980614b18b82\}\}/g, () => userProfile.prenom);
}
function scrollConversationToBottom() {
  const scroll = () => globalThis.scrollTo?.({
    top: document.documentElement?.scrollHeight || 0,
    behavior: 'smooth',
  });
  if (globalThis.requestAnimationFrame) globalThis.requestAnimationFrame(scroll);
  else scroll();
}
function scrollTestToTop() {
  const scroll = () => globalThis.scrollTo?.({ top: 0, behavior: 'smooth' });
  if (globalThis.requestAnimationFrame) globalThis.requestAnimationFrame(scroll);
  else scroll();
}
function startTest() {
  if (intakeIndex < intakeSteps.length) return;
  if (typeof stopAudio === 'function') {
    stopAudio(); audioDemoMode = false; engine = createQuizEngine(questions, parcours);
    $('audio-demo-return').hidden = true; $('audio-debug').hidden = true;
  }
  engine.reset();
  orientationSelections = new Map();
  testIntroShown = false;
  resultEmailSent = false;
  recommendationRequest += 1;
  previousMediaKey = '';
  previousPassage = '';
  $('history').replaceChildren();
  $('welcome').hidden = true;
  $('results').hidden = true;
  $('class-recommendations-status').textContent = '';
  $('class-recommendations-list').replaceChildren();
  $('quiz').hidden = false;
  $('active-question').hidden = false;
  showTestIntroduction();
  renderQuestion();
}

function showTestIntroduction() {
  const bubble = document.createElement('div');
  bubble.className = 'bubble teacher';
  const sender = document.createElement('span');
  sender.className = 'sender';
  sender.textContent = 'Professeur Lavi';
  const greeting = document.createElement('p');
  greeting.textContent = `OK ${userProfile.prenom},`;
  const explanation = document.createElement('p');
  explanation.textContent = 'Ce test est adaptatif : les questions s’ajustent à ton niveau. Si une question te semble trop difficile, clique simplement sur « Passer cette question ». Le test te proposera ensuite des questions plus adaptées.';
  bubble.append(sender, greeting, explanation);
  $('history').append(bubble);
  testIntroShown = true;
}

function renderOrientation() {
  if (typeof stopAudio === 'function') stopAudio();
  const orientationQuestions = parcours.adaptive.selfAssessmentIds.map(id => questions.find(question => question.id === id));
  $('student-message').hidden = true;
  $('feedback').hidden = true;
  $('next').hidden = true;
  $('answer-error').hidden = true;
  $('progress-label').hidden = true;
  $('support-progress').hidden = true;
  $('progress').hidden = true;
  $('passage-message').hidden = true;
  $('question-passage').replaceChildren();
  $('question-context').replaceChildren();
  $('composer').hidden = false;
  $('composer').classList.toggle('text-composer', false);
  $('composer').classList.toggle('voice-composer', false);
  $('confirm-choices').hidden = true;
  $('skip').hidden = true;
  $('written-form').hidden = true;
  $('question-title').textContent = 'Avant de commencer';
  $('question-title').dir = 'ltr';
  $('question-title').lang = 'fr';
  $('instruction').textContent = 'Pour chacune de ces quatre affirmations, choisis Oui ou Non.';
  $('instruction').hidden = false;
  $('choices').replaceChildren();
  $('choices').className = 'choices orientation-list';

  for (const question of orientationQuestions) {
    const item = document.createElement('div');
    item.className = 'orientation-item';
    const label = document.createElement('p');
    label.className = 'orientation-question';
    label.textContent = question.texte;
    const actions = document.createElement('div');
    actions.className = 'orientation-actions';
    for (const [text, value] of [['Oui', true], ['Non', false]]) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'orientation-choice';
      button.textContent = text;
      button.setAttribute('aria-pressed', String(orientationSelections.get(question.id) === value));
      button.addEventListener('click', () => {
        orientationSelections.set(question.id, value);
        for (const candidate of actions.children) {
          candidate.setAttribute('aria-pressed', String(candidate === button));
        }
        continueButton.disabled = orientationSelections.size !== orientationQuestions.length;
      });
      actions.append(button);
    }
    item.append(label, actions);
    $('choices').append(item);
  }

  const continueButton = document.createElement('button');
  continueButton.type = 'button';
  continueButton.className = 'primary orientation-submit';
  continueButton.textContent = 'Commencer le test →';
  continueButton.disabled = orientationSelections.size !== orientationQuestions.length;
  continueButton.addEventListener('click', () => {
    if (continueButton.disabled) return;
    try {
      for (const question of orientationQuestions) {
        if (engine.current()?.id !== question.id) throw new Error('Le parcours d’orientation est incomplet.');
        engine.submit(orientationSelections.get(question.id));
        engine.next();
      }
    } catch (error) {
      $('answer-error').textContent = error.message;
      $('answer-error').hidden = false;
      return;
    }
    $('choices').className = 'choices';
    renderQuestion(true);
  });
  $('choices').append(continueButton);
  $('question-title').focus({ preventScroll: true });
  scrollConversationToBottom();
}
function renderMedia(question) {
  const context = $('question-context');
  context.querySelectorAll('audio').forEach(audio => audio.pause());
  const passageMessage = $('passage-message');
  const passageContainer = $('question-passage');
  context.replaceChildren();
  passageContainer.replaceChildren();
  const currentPassage = engine.block.passage || '';
  const repeatedPassage = currentPassage && currentPassage === previousPassage;
  previousPassage = currentPassage;
  passageMessage.hidden = !currentPassage || repeatedPassage;
  if (currentPassage && !repeatedPassage) {
    const passage = document.createElement('p');
    passage.className = 'reading-passage';
    passage.lang = 'he';
    passage.dir = 'rtl';
    // Recognize inline bold markers while keeping Airtable content as plain text.
    if (!/\*\*[^*\n]+\*\*/.test(currentPassage)) passage.textContent = currentPassage;
    else for (const part of currentPassage.split(/(\*\*[^*\n]+\*\*)/g)) {
      const isBold = part.startsWith('**') && part.endsWith('**') && part.length > 4;
      const span = document.createElement(isBold ? 'strong' : 'span');
      span.textContent = isBold ? part.slice(2, -2) : part;
      passage.append(span);
    }
    passageContainer.append(passage);
  }
  const mediaKey = question.media ? `${question.media.type}:${question.media.url}` : '';
  const repeatedVideo = question.media?.type === 'video' && mediaKey === previousMediaKey;
  previousMediaKey = mediaKey;
  if (!question.media || repeatedVideo) return;
  if (question.media.type === 'audio') {
    if (typeof audioCapability === 'undefined' || !audioCapability?.enabled) return;
    const playback = createVoicePlayer(question.media.url, 'Écouter ou réécouter la question');
    const player = playback.audio; playback.element.className += ' question-audio';
    const error = document.createElement('p'); error.className = 'help'; error.hidden = true;
    error.textContent = 'Le fichier de la question est indisponible. Réessaie après son remplacement.';
    player.addEventListener('error', () => { error.hidden = false; });
    context.append(playback.element, error); return;
  }
  const url = new URL(question.media.url);
  if (url.protocol !== 'https:') return;
  if (question.media.type === 'image') {
    const img = document.createElement('img');
    img.src = question.media.url;
    img.alt = 'Illustration à observer pour répondre à la question';
    img.className = 'question-image';
    const error = document.createElement('p');
    error.className = 'help';
    error.hidden = true;
    error.textContent = 'L’image ne se charge pas. Vérifie ta connexion.';
    img.addEventListener('error', () => { error.hidden = false; });
    context.append(img, error);
  } else if (question.media.type === 'video') {
    const id = url.hostname === 'youtu.be' ? url.pathname.slice(1) : url.pathname.startsWith('/shorts/') ? url.pathname.split('/')[2] : url.searchParams.get('v');
    if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) {
      const preview = document.createElement('button');
      preview.type = 'button';
      preview.className = 'youtube-preview';
      preview.setAttribute('aria-label', 'Lire la vidéo de compréhension en hébreu');
      const thumbnail = document.createElement('img');
      thumbnail.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
      thumbnail.alt = 'Aperçu de la vidéo YouTube';
      thumbnail.loading = 'lazy';
      const play = document.createElement('span');
      play.className = 'youtube-play';
      play.setAttribute('aria-hidden', 'true');
      play.textContent = '▶';
      preview.append(thumbnail, play);
      preview.addEventListener('click', () => {
        const frame = document.createElement('iframe');
        frame.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`;
        frame.title = 'Vidéo de compréhension en hébreu';
        frame.className = 'question-video';
        frame.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
        frame.allowFullscreen = true;
        frame.referrerPolicy = 'strict-origin-when-cross-origin';
        preview.hidden = true;
        context.append(frame);
        scrollConversationToBottom();
      });
      context.append(preview);
    }
  }
  if (question.media.type === 'video') {
    const link = document.createElement('a');
    link.href = question.media.url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = 'Ouvrir la vidéo sur YouTube';
    context.append(link);
  }
}

function normalizeTypedValue(value) {
  return String(value).toLocaleLowerCase('fr').normalize('NFD')
    .replace(/[\u0300-\u036f\u0591-\u05C7\u200e\u200f]/g, '')
    .replace(/[?!.,;:'"“”«»()[\]]/g, ' ')
    .trim().replace(/\s+/g, ' ');
}

function formatHebrewText(rawText, asQuestion = false) {
  let text = personalize(rawText).trim();
  const firstHebrew = text.search(/[\u0590-\u05ff]/);
  if (firstHebrew < 0) return { text, hebrew: false };

  // L’export Typeform place parfois ? ou ! avant le texte hébreu.
  // En écriture RTL, la ponctuation doit être à la fin logique pour apparaître à gauche.
  const prefix = text.slice(0, firstHebrew);
  const leadingPunctuation = (prefix.match(/[?!]/g) || []).join('');
  if (leadingPunctuation) text = prefix.replace(/[?!]/g, '') + text.slice(firstHebrew);
  const beginsLikeQuestion = /^(?:["“״']?)(?:מה|מי|איפה|איך|למה|לאן|מתי|איזה|עם מי)(?:\s|$)/.test(text);
  if (leadingPunctuation && !/[?!]$/.test(text)) text += leadingPunctuation;
  if (asQuestion && beginsLikeQuestion && !text.endsWith('?')) text += '?';
  return { text, hebrew: true };
}

function formatQuestionText(rawText) {
  return formatHebrewText(rawText, true);
}

function findTypedChoice(question, rawAnswer) {
  const normalizedAnswer = normalizeTypedValue(rawAnswer);
  const position = Number(normalizedAnswer);
  if (Number.isInteger(position) && position >= 1 && position <= displayedChoices.length) {
    return displayedChoices[position - 1];
  }
  if (question.choix.some(choice => typeof choice.valeur === 'boolean')) {
    if (['oui', 'yes'].includes(normalizedAnswer)) return question.choix.find(choice => choice.valeur === true);
    if (['non', 'no'].includes(normalizedAnswer)) return question.choix.find(choice => choice.valeur === false);
  }
  return question.choix.find(choice => {
    const label = normalizeTypedValue(choice.libelle);
    const value = normalizeTypedValue(choice.valeur);
    return normalizedAnswer === label
      || normalizedAnswer === value
      || normalizedAnswer === label.replace(/^en /, '');
  });
}

function parseTypedAnswer(question, rawAnswer) {
  if (question.reponseOuiNon) {
    const normalizedAnswer = normalizeTypedValue(rawAnswer);
    if (normalizedAnswer === 'oui') return true;
    if (normalizedAnswer === 'non') return false;
    throw new Error('Écris simplement « oui » ou « non ».');
  }
  if (question.reponseConversationnelle) {
    const normalizedAnswer = normalizeTypedValue(rawAnswer);
    if (/\b(les deux|les 2|tous les deux)\b/.test(normalizedAnswer)) {
      throw new Error('Choisis une seule préférence : « en présentiel » ou « à distance ».');
    }
    const wantsInPerson = /\b(presentiel|sur place|en classe)\b/.test(normalizedAnswer);
    const wantsRemote = /\b(distanciel|a distance|en ligne|visio)\b/.test(normalizedAnswer);
    if (wantsInPerson === wantsRemote) {
      throw new Error('Choisis une seule préférence : « en présentiel » ou « à distance ».');
    }
    return question.choix.find(choice => normalizeTypedValue(choice.libelle).includes(wantsInPerson ? 'presentiel' : 'distanciel'))?.valeur;
  }
  if (question.type === 'text') return rawAnswer;
  if (!rawAnswer) throw new Error('Écris ta réponse ou choisis une proposition.');
  if (!question.multiple) {
    const choice = findTypedChoice(question, rawAnswer);
    if (!choice) throw new Error('Cette réponse ne correspond pas aux propositions affichées.');
    return choice.valeur;
  }
  const normalizedAnswer = normalizeTypedValue(rawAnswer);
  if (['les deux', 'tous', 'toutes'].includes(normalizedAnswer)) {
    return question.choix.map(choice => choice.valeur);
  }
  const parts = rawAnswer.split(/\s*(?:,|;|\/|\bet\b)\s*/i).filter(Boolean);
  const selectedChoices = parts.map(part => findTypedChoice(question, part));
  if (!selectedChoices.length || selectedChoices.some(choice => !choice)) {
    throw new Error('Sépare les réponses par « et », par exemple « présentiel et distanciel ».');
  }
  return [...new Set(selectedChoices.map(choice => choice.valeur))];
}

function renderQuestion(scrollToTop = false) {
  if (typeof stopAudio === 'function') stopAudio();
  const q = engine.current();
  if (!q) {
    if (typeof audioDemoMode !== 'undefined' && audioDemoMode) {
      $('composer').hidden = true; $('question-title').textContent = 'Essai audio terminé'; return;
    }
    showResults(); return;
  }
  if (engine.state.mode === 'orientation') {
    renderOrientation();
    return;
  }
  selection = new Set();
  $('student-message').hidden = true;
  $('feedback').hidden = true;
  $('next').hidden = true;
  $('answer-error').hidden = true;
  $('composer').hidden = false;
  $('composer').classList.toggle('text-composer', q.type === 'text');
  $('composer').classList.toggle('voice-composer', q.type === 'audio_response');
  $('confirm-choices').hidden = !q.multiple || q.reponseConversationnelle;
  $('skip').hidden = (typeof questionLabMode !== 'undefined' && questionLabMode) || q.obligatoire && engine.state.mode !== 'test';
  $('written-form').hidden = q.type !== 'text';
  const formattedQuestion = formatQuestionText(q.texte);
  $('question-title').textContent = formattedQuestion.text;
  $('question-title').dir = formattedQuestion.hebrew ? 'rtl' : 'ltr';
  $('question-title').lang = formattedQuestion.hebrew ? 'he' : 'fr';
  $('instruction').textContent = q.instruction || (q.type === 'text' ? 'Écris ta réponse.' : q.type === 'audio_response' ? 'Réponds en hébreu avec une note vocale.' : '');
  $('instruction').hidden = !$('instruction').textContent;
  const scoredQuestions = questions.filter(item => item.bonneReponse != null || item.type === 'audio_response' && item.points > 0);
  if (q.points > 0) {
    const adaptivePosition = engine.state.levelQuestionNumber;
    const levelQuestions = scoredQuestions.filter(item => item.niveau === q.niveau);
    const adaptiveTotal = engine.state.levelQuestionCount;
    $('progress-text').textContent = engine.state.tiebreakerActive
      ? 'Question de départage'
      : `Question ${adaptivePosition || levelQuestions.indexOf(q) + 1} sur ${adaptiveTotal || levelQuestions.length}`;
    $('progress').max = adaptiveTotal || levelQuestions.length;
    $('progress').value = adaptivePosition || levelQuestions.indexOf(q) + 1;
    $('question-level').textContent = `Niveau ${q.niveau} sur 8`;
    if (typeof audioDemoMode !== 'undefined' && audioDemoMode) {
      const number = audioExperimentQuestions.findIndex(item => item.id === q.id) + 1;
      $('progress-text').textContent = `${questionLabMode ? 'Question' : 'Question audio'} ${number} sur ${audioExperimentQuestions.length}`;
      $('progress').max = audioExperimentQuestions.length; $('progress').value = number;
      $('question-level').textContent = 'DEV';
    }
  }
  $('progress-label').hidden = !q.points;
  $('progress').hidden = !q.points;
  const support = engine.support;
  $('support-progress').hidden = !support;
  $('support-progress').textContent = support ? `${support.type === 'video' ? 'Vidéo' : 'Texte'} · question ${support.position} sur ${support.total}` : '';
  renderMedia(q);
  $('choices').replaceChildren();
  $('choices').className = 'choices';
  if (q.type === 'audio_response') {
    $('confirm-choices').hidden = true;
    if (typeof audioCapability !== 'undefined' && audioCapability?.enabled && typeof createAudioAnswer === 'function') {
      $('audio-answer').hidden = false;
      audioControl = createAudioAnswer($('audio-answer'), blob => submitAudio(blob, q));
    } else {
      $('answer-error').textContent = 'Cette question audio est réservée à l’environnement DEV.';
      $('answer-error').hidden = false;
    }
    $('question-title').focus({ preventScroll: true }); scrollConversationToBottom(); return;
  }
  displayedChoices = [...q.choix];
  if (q.aleatoire) {
    for (let i = displayedChoices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [displayedChoices[i], displayedChoices[j]] = [displayedChoices[j], displayedChoices[i]];
    }
  }
  if (!q.reponseConversationnelle) displayedChoices.forEach(choice => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'choice';
    const text = document.createElement('span');
    const formattedChoice = formatHebrewText(choice.libelle);
    text.textContent = formattedChoice.text;
    text.dir = formattedChoice.hebrew ? 'rtl' : 'ltr';
    if (formattedChoice.hebrew) text.lang = 'he';
    button.append(text);
    if (q.multiple) button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => {
      if (engine.state.answered) return;
      if (q.multiple) {
        if (selection.has(choice.valeur)) selection.delete(choice.valeur);
        else selection.add(choice.valeur);
        button.setAttribute('aria-pressed', String(selection.has(choice.valeur)));
      } else submitAnswer(choice.valeur);
    });
    $('choices').append(button);
  });
  const typedHebrew = q.type === 'text' && q.langue !== 'fr';
  const qcmHebrew = q.type === 'qcm' && q.choix.some(choice => /[\u0590-\u05ff]/.test(choice.libelle));
  const input = $('written-answer');
  input.value = '';
  input.disabled = false;
  input.required = q.obligatoire;
  input.lang = typedHebrew || qcmHebrew ? 'he' : 'fr';
  input.dir = typedHebrew || qcmHebrew ? 'rtl' : 'auto';
  input.placeholder = q.reponseOuiNon ? 'Écris oui ou non…' : 'Écris ta réponse…';
  $('answer-label').textContent = typedHebrew || qcmHebrew ? 'Ta réponse en hébreu' : 'Ta réponse';
  $('keyboard-help').hidden = !typedHebrew;
  $('keyboard').hidden = !typedHebrew;
  $('check').hidden = false;
  $('keyboard').replaceChildren();
  if (typedHebrew) [...'אבגדהוזחטיכךלמםנןסעפףצץקרשת', 'Espace', 'Effacer'].forEach(letter => {
      const key = document.createElement('button');
      key.type = 'button'; key.textContent = letter;
      key.addEventListener('click', () => {
        if (letter === 'Effacer') input.value = input.value.slice(0, -1);
        else input.setRangeText(letter === 'Espace' ? ' ' : letter, input.selectionStart, input.selectionEnd, 'end');
        input.focus();
      });
      $('keyboard').append(key);
    });
  $('question-title').focus({ preventScroll: true });
  if (scrollToTop) scrollTestToTop();
  else scrollConversationToBottom();
}
function submitAnswer(value) {
  const q = engine.current();
  if (!q || engine.state.answered) return;
  let result;
  try { result = engine.submit(value); }
  catch (error) { $('answer-error').textContent = error.message; $('answer-error').hidden = false; return; }
  if (!result) return;
  let label = 'Je passe cette question.';
  if (!result.skipped) {
    if (q.type === 'audio_response') label = '🎙️ Réponse vocale envoyée';
    else if (q.reponseOuiNon) label = value ? 'Oui' : 'Non';
    else if (q.reponseConversationnelle) label = q.choix.filter(c => value.includes(c.valeur)).map(c => c.libelle).join(' et ');
    else label = q.type === 'text' ? value : q.choix.filter(c => q.multiple ? value.includes(c.valeur) : c.valeur === value).map(c => c.libelle).join(' · ');
  }
  const formattedAnswer = formatHebrewText(label);
  $('student-answer').textContent = formattedAnswer.text;
  if (q.type === 'audio_response' && !result.skipped && typeof createSentVoiceNote === 'function') {
    $('student-answer').replaceChildren(createSentVoiceNote(value.duration));
  }
  $('student-answer').dir = formattedAnswer.hebrew ? 'rtl' : 'ltr';
  $('student-answer').lang = formattedAnswer.hebrew ? 'he' : 'fr';
  $('student-message').hidden = false;
  $('composer').hidden = true;
  const silentQuestionIds = new Set([
    '283a501f-c840-4b74-9e88-545152769ef9', // Autoévaluation : lecture
    '547b1f37-9fc4-4f7b-8d47-73297c1dd2aa', // Autoévaluation : expression
    '1933dae8-da62-464c-a72d-63141c72873b', // Autoévaluation : compréhension
    'ce09c281-36db-4e76-ba69-778b64eb6172', // Autoévaluation : vocabulaire
    'eb133ca8-54dc-489f-9b9a-2f1ab4553326', // Ville
    '01bd29a5-dc50-4012-959f-d415559996c6', // Présentiel ou distanciel
  ]);
  if (silentQuestionIds.has(q.id)) {
    archiveExchange(false);
    engine.next();
    renderQuestion();
    return;
  }
  if (q.type === 'audio_response') {
    $('feedback').textContent = result.skipped ? 'Question passée.' : value.status === 'correct' ? '✅ Juste' : '❌ Faux';
  } else if (result.scored) {
    const rawCorrect = q.type === 'text' ? q.bonneReponse : q.choix.find(c => c.valeur === q.bonneReponse).libelle;
    const formattedCorrect = formatHebrewText(rawCorrect);
    if (result.correct) {
      $('feedback').textContent = 'Bonne réponse';
    } else {
      const correct = formattedCorrect.hebrew ? `\u2067${formattedCorrect.text}\u2069` : formattedCorrect.text;
      $('feedback').textContent = `${result.skipped ? 'Voici la correction.' : 'Pas tout à fait.'} La bonne réponse est : ${correct}`;
    }
  } else {
    $('feedback').textContent = unscoredFeedback(q, value);
  }
  $('feedback').className = `bubble teacher feedback${result.scored && !result.correct ? ' incorrect' : ''}`;
  $('feedback').hidden = false;
  if (typeof audioDemoMode !== 'undefined' && audioDemoMode) {
    if (q.id !== audioExperimentQuestions.at(-1)?.id) {
      archiveExchange(); engine.next(); renderQuestion();
    } else {
      stopAudio(); engine.next(); $('composer').hidden = true;
      $('question-level').textContent = 'DEV · Essai terminé';
    }
    return;
  }
  archiveExchange();
  engine.next();
  renderQuestion();
}
function archiveExchange(includeFeedback = true) {
  const messages = [];
  if (!$('passage-message').hidden) messages.push($('passage-message'));
  messages.push($('active-question').querySelector('.question-message'), $('student-message'));
  if (includeFeedback) messages.push($('feedback'));
  const hasAudioDetails = includeFeedback && !$('audio-debug').hidden;
  if (hasAudioDetails) messages.push($('audio-debug'));
  for (const source of messages) {
    const copy = source.cloneNode(true);
    copy.removeAttribute('id'); copy.removeAttribute('role'); copy.removeAttribute('aria-live');
    copy.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
    copy.querySelectorAll('[tabindex]').forEach(node => node.removeAttribute('tabindex'));
    // Ne pas multiplier les lecteurs vidéo dans l’historique.
    copy.querySelectorAll('iframe').forEach(node => node.remove());
    copy.querySelectorAll('.youtube-preview').forEach(node => { node.hidden = false; });
    copy.querySelectorAll('details').forEach(node => { node.open = false; });
    if (typeof createVoicePlayer === 'function') copy.querySelectorAll('.voice-player').forEach(player => {
      const audio = player.querySelector('audio');
      const playback = createVoicePlayer(audio?.getAttribute('src') || '', 'Écouter ou réécouter la question');
      playback.element.className = player.className;
      player.replaceWith(playback.element);
    });
    $('history').append(copy);
  }
  if (hasAudioDetails) { $('audio-debug').hidden = true; $('audio-debug-content').replaceChildren(); }
}

function unscoredFeedback(question, value) {
  if (engine.block.transition) {
    return value === true
      ? 'Avec plaisir, passons au niveau suivant.'
      : 'Très bien, faisons le bilan.';
  }
  if (value == null || (Array.isArray(value) && value.length === 0)) {
    return 'On peut passer cette étape.';
  }
  const messages = {
    'eb133ca8-54dc-489f-9b9a-2f1ab4553326': `Très bien, tu habites à ${value}.`,
    '01bd29a5-dc50-4012-959f-d415559996c6': 'Je tiendrai compte de cette préférence.',
    'bfff1062-27eb-455c-bb6b-ae72d17c0495': value === true
      ? 'Très bien, passons aux questions en hébreu.'
      : 'D’accord, nous en tiendrons compte dans le bilan.',
  };
  return messages[question.id] || 'Très bien, continuons.';
}

async function sendResult(state) {
  if (resultEmailSent) return;
  resultEmailSent = true;
  const status = $('result-email-status');
  status.textContent = 'Envoi de ton bilan…';
  try {
    const response = await fetch('/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        prenom: userProfile.prenom,
        nom: userProfile.nom,
        email: userProfile.email,
        telephone: userProfile.telephone,
        niveau_lavi: state.variables.niveau_lavi,
        score: state.score,
        points_possibles: state.possible,
        questions_evaluees: state.attempted,
        raison_fin: state.reason,
      }),
    });
    if (!response.ok) throw new Error('Envoi refusé');
    status.textContent = 'Ton bilan a bien été transmis.';
  } catch (error) {
    status.textContent = 'Ton bilan n’a pas pu être envoyé automatiquement. Préviens le professeur Lavi.';
  }
}

function appendClassRecommendation(item) {
  const card = document.createElement('article');
  card.className = 'class-card';

  const title = document.createElement('h4');
  title.textContent = item.nom;
  const chapter = item.chapitre_en_cours == null ? '' : `Chapitre ${item.chapitre_en_cours}`;
  const details = [chapter, item.niveau, item.format, item.jour, item.horaires].filter(Boolean);
  const meta = document.createElement('p');
  meta.className = 'class-meta';
  meta.textContent = details.join(' · ');
  const reason = document.createElement('p');
  reason.className = 'class-reason';
  reason.textContent = item.raison;
  card.append(title);
  if (details.length) card.append(meta);
  card.append(reason);

  try {
    const url = new URL(item.lien);
    if (url.protocol === 'https:') {
      const link = document.createElement('a');
      link.className = 'class-link';
      link.href = url.toString();
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = 'Découvrir cette classe →';
      card.append(link);
    }
  } catch {
    // Une recommandation reste lisible même si son lien Airtable est invalide.
  }
  $('class-recommendations-list').append(card);
}

async function loadClassRecommendations(state) {
  const requestId = ++recommendationRequest;
  const status = $('class-recommendations-status');
  const list = $('class-recommendations-list');
  list.replaceChildren();
  status.textContent = 'Nous recherchons les classes adaptées à ton niveau…';
  try {
    const response = await fetch('/api/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ niveau_lavi: state.variables.niveau_lavi }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Recommandations indisponibles');
    if (requestId !== recommendationRequest) return;
    const recommendations = Array.isArray(data.recommendations) ? data.recommendations : [];
    if (!recommendations.length) {
      status.textContent = 'Aucune classe ouverte ne correspond à ton niveau pour le moment. Nous te contacterons avec une proposition.';
      return;
    }
    status.textContent = recommendations.length === 1
      ? 'Voici la classe la plus adaptée à ton niveau.'
      : 'Voici les classes les plus adaptées à ton niveau.';
    recommendations.forEach(appendClassRecommendation);
    scrollConversationToBottom();
  } catch (error) {
    if (requestId !== recommendationRequest) return;
    status.textContent = 'Les propositions de classes sont temporairement indisponibles. Ton niveau a bien été calculé.';
  }
}

function showResults() {
  $('active-question').hidden = true;
  $('results').hidden = false;
  $('progress-text').textContent = 'Test terminé';
  const state = engine.state;
  const messages = {
    choice: 'Tu as choisi de t’arrêter ici.',
    alphabet: 'Nous te conseillons de commencer par l’alphabet hébraïque.',
    threshold: 'Le seuil d’erreurs prévu pour cette étape est atteint. Nous nous arrêtons ici.',
    completed: 'Tu as parcouru toutes les étapes proposées. Bravo !',
    adaptive: 'Le parcours adaptatif a identifié ton niveau le plus précis.',
  };
  $('result-title').textContent = `Merci ${userProfile.prenom}, voici ton bilan.`;
  $('score').textContent = state.attempted ? `${state.score} / ${state.possible} points` : 'Pas de question notée';
  $('result-summary').textContent = `${messages[state.reason]} Niveau Lavi conseillé : ${state.variables.niveau_lavi}. ${state.attempted} question(s) évaluée(s) sur les ${questions.filter(q => q.bonneReponse != null || q.type === 'audio_response' && q.points > 0).length} disponibles. Ce positionnement est indicatif.`;
  sendResult(state);
  loadClassRecommendations(state);
  $('result-title').focus({ preventScroll: true });
  scrollConversationToBottom();
}
$('written-form').addEventListener('submit', event => {
  event.preventDefault();
  const question = engine.current();
  const rawAnswer = $('written-answer').value.trim();
  try {
    submitAnswer(parseTypedAnswer(question, rawAnswer));
  } catch (error) {
    $('answer-error').textContent = error.message;
    $('answer-error').hidden = false;
    $('written-answer').focus();
  }
});
$('confirm-choices').addEventListener('click', () => submitAnswer([...selection]));
$('skip').addEventListener('click', () => submitAnswer(null));
$('next').addEventListener('click', () => {
  if (!engine.state.answered || engine.state.finished) return;
  archiveExchange(); engine.next(); renderQuestion();
});
$('start').addEventListener('click', startTest);
$('restart').addEventListener('click', startTest);
$('welcome-description').textContent = 'Le parcours s’adapte à tes réponses. Chaque texte ou vidéo est suivi d’au moins trois questions.';
renderIntakeStep(false);

async function loadQuestionSet() {
  const status = $('question-set-status');
  const previewMode = new URLSearchParams(globalThis.location?.search || '').get('preview') === '1';
  const token = previewMode ? globalThis.sessionStorage?.getItem('quizAdminToken') : '';
  if (previewMode && !token) {
    status.textContent = 'Aperçu réservé à l’administration. Vérifie d’abord le brouillon depuis la page d’administration.';
    status.hidden = false;
    return;
  }
  try {
    const response = await fetch(`/api/question-set${previewMode ? '?preview=1' : ''}`, {
      headers: previewMode ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) throw new Error(`Questions ${response.status}`);
    const data = await response.json();
    if (typeof questionSetVersion !== 'undefined') questionSetVersion = data.version || '';
    const snapshot = data.snapshot;
    if (!Array.isArray(snapshot?.questions) || !Array.isArray(snapshot?.parcours?.blocs)
      || !snapshot?.parcours?.adaptive
      || !Array.isArray(snapshot?.profileQuestions)) throw new Error('Version des questions incomplète.');
    if (typeof devAudioQuestions !== 'undefined') devAudioQuestions = Array.isArray(snapshot.devAudioQuestions)
      ? snapshot.devAudioQuestions.filter(q => q.type === 'audio_response') : [];
    questions.splice(0, questions.length, ...snapshot.questions);
    const adaptiveConfiguration = parcours.adaptive;
    Object.assign(parcours, snapshot.parcours);
    // La sélection des mini-tests est versionnée avec le code, tandis qu’Airtable
    // fournit le contenu des questions. Cela permet d’améliorer le parcours sans
    // attendre une nouvelle publication du contenu éditorial.
    parcours.adaptive = adaptiveConfiguration;
    intakeSteps.splice(0, intakeSteps.length, ...snapshot.profileQuestions);
    engine = createQuizEngine(questions, parcours);
    renderIntakeStep(false);
    if (previewMode) {
      status.textContent = 'Aperçu Airtable : ces questions ne sont pas encore publiées.';
      status.hidden = false;
    }
  } catch {
    if (previewMode) {
      status.textContent = 'Aperçu indisponible. Retourne à l’administration pour vérifier le brouillon.';
      status.hidden = false;
      return;
    }
    // La version embarquée permet au test de fonctionner avant la première publication.
  }
  $('intake-answer').disabled = false;
  $('intake-submit').disabled = false;
}

$('intake-answer').disabled = true;
$('intake-submit').disabled = true;
const questionSetReady = loadQuestionSet();

const audioReady = typeof initializeAudioExperiment === 'function' ? initializeAudioExperiment() : Promise.resolve();
