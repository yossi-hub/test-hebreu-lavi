const $ = (id) => document.getElementById(id);
const engine = createQuizEngine(questions, parcours);
// Données conservées uniquement en mémoire : un rechargement les efface.
const userProfile = { prenom: '', nom: '', email: '', telephone: '' };
const intakeSteps = [
  { key: 'identite', label: 'Prénom et nom', question: 'Donne-moi ton prénom et ton nom, s’il te plaît.', type: 'text', autocomplete: 'name' },
  { key: 'email', label: 'Email', question: 'Quelle est ton adresse email ?', type: 'email', autocomplete: 'email' },
  { key: 'telephone', label: 'Téléphone', question: 'Quel est ton numéro de téléphone ?', type: 'tel', autocomplete: 'tel' },
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
  input.placeholder = conversationalInput ? `Écris ton ${step.label.toLowerCase()}…` : '';
  input.value = '';
  input.removeAttribute('aria-invalid');
  const submit = $('intake-submit');
  submit.setAttribute('aria-label', conversationalInput ? `Envoyer ton ${step.label.toLowerCase()}` : 'Envoyer');
  submit.textContent = conversationalInput ? '➤' : 'Envoyer →';
  $('intake-error').hidden = true;
  if (focus) input.focus();
}

$('intake-form').addEventListener('submit', (event) => {
  event.preventDefault();
  if (intakeIndex >= intakeSteps.length) return;
  const step = intakeSteps[intakeIndex];
  const input = $('intake-answer');
  const value = input.value.trim();
  let error = '';
  if (!value) error = `Renseigne ton ${step.label.toLowerCase()}.`;
  else if (step.key === 'identite' && value.split(/\s+/).length < 2) {
    error = 'Saisis ton prénom et ton nom.';
  }
  else if (step.key === 'email' && (!input.validity.valid || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))) {
    error = 'Saisis un email valide, par exemple prenom@exemple.fr.';
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
    $('start').focus();
  }
});


let displayedChoices = [];
let selection = new Set();
let testIntroShown = false;
let resultEmailSent = false;
function personalize(text) {
  return text.replace(/\{\{field:358f8a5f-6233-46f7-acc7-980614b18b82\}\}/g, () => userProfile.prenom);
}
function startTest() {
  if (intakeIndex < intakeSteps.length) return;
  engine.reset();
  testIntroShown = false;
  resultEmailSent = false;
  $('history').replaceChildren();
  $('welcome').hidden = true;
  $('results').hidden = true;
  $('quiz').hidden = false;
  $('active-question').hidden = false;
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
  explanation.textContent = 'Voici quelques questions. Tu dois choisir la bonne réponse. On y va ?';
  bubble.append(sender, greeting, explanation);
  $('history').append(bubble);
  testIntroShown = true;
}
function renderMedia(question) {
  const context = $('question-context');
  const passageMessage = $('passage-message');
  const passageContainer = $('question-passage');
  context.replaceChildren();
  passageContainer.replaceChildren();
  passageMessage.hidden = !engine.block.passage;
  if (engine.block.passage) {
    const passage = document.createElement('p');
    passage.className = 'reading-passage';
    passage.lang = 'he';
    passage.dir = 'rtl';
    passage.textContent = engine.block.passage;
    passageContainer.append(passage);
  }
  if (!question.media) return;
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

function renderQuestion() {
  const q = engine.current();
  if (!q) { showResults(); return; }
  if (q.points > 0 && !testIntroShown) showTestIntroduction();
  selection = new Set();
  $('student-message').hidden = true;
  $('feedback').hidden = true;
  $('next').hidden = true;
  $('answer-error').hidden = true;
  $('composer').hidden = false;
  $('composer').classList.toggle('text-composer', q.type === 'text');
  $('confirm-choices').hidden = !q.multiple || q.reponseConversationnelle;
  $('skip').hidden = q.obligatoire;
  $('written-form').hidden = q.type !== 'text';
  const formattedQuestion = formatQuestionText(q.texte);
  $('question-title').textContent = formattedQuestion.text;
  $('question-title').dir = formattedQuestion.hebrew ? 'rtl' : 'ltr';
  $('question-title').lang = formattedQuestion.hebrew ? 'he' : 'fr';
  $('instruction').textContent = q.instruction || (q.type === 'text' ? 'Écris ta réponse.' : '');
  $('instruction').hidden = !$('instruction').textContent;
  const scoredQuestions = questions.filter(item => item.bonneReponse != null);
  if (q.points > 0) {
    const levelQuestions = scoredQuestions.filter(item => item.niveau === q.niveau);
    $('progress-text').textContent = `Question ${levelQuestions.indexOf(q) + 1} sur ${levelQuestions.length}`;
    $('progress').max = levelQuestions.length;
    $('progress').value = levelQuestions.indexOf(q) + 1;
    $('question-level').textContent = `Niveau ${q.niveau} sur 8`;
  }
  $('progress-label').hidden = !q.points;
  $('progress').hidden = !q.points;
  renderMedia(q);
  $('choices').replaceChildren();
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
  $('question-title').focus();
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
    if (q.reponseOuiNon) label = value ? 'Oui' : 'Non';
    else if (q.reponseConversationnelle) label = q.choix.filter(c => value.includes(c.valeur)).map(c => c.libelle).join(' et ');
    else label = q.type === 'text' ? value : q.choix.filter(c => q.multiple ? value.includes(c.valeur) : c.valeur === value).map(c => c.libelle).join(' · ');
  }
  const formattedAnswer = formatHebrewText(label);
  $('student-answer').textContent = formattedAnswer.text;
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
  if (result.scored) {
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
  archiveExchange();
  engine.next();
  renderQuestion();
}
function archiveExchange(includeFeedback = true) {
  const messages = [];
  if (!$('passage-message').hidden) messages.push($('passage-message'));
  messages.push($('active-question').querySelector('.question-message'), $('student-message'));
  if (includeFeedback) messages.push($('feedback'));
  for (const source of messages) {
    const copy = source.cloneNode(true);
    copy.removeAttribute('id'); copy.removeAttribute('role'); copy.removeAttribute('aria-live');
    copy.querySelectorAll('[id]').forEach(node => node.removeAttribute('id'));
    copy.querySelectorAll('[tabindex]').forEach(node => node.removeAttribute('tabindex'));
    // Ne pas multiplier les lecteurs vidéo dans l’historique.
    copy.querySelectorAll('iframe').forEach(node => node.remove());
    copy.querySelectorAll('details').forEach(node => { node.open = false; });
    $('history').append(copy);
  }
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
  };
  $('result-title').textContent = `Merci ${userProfile.prenom}, voici ton bilan.`;
  $('score').textContent = state.attempted ? `${state.score} / ${state.possible} points` : 'Pas de question notée';
  $('result-summary').textContent = `${messages[state.reason]} Niveau Lavi conseillé : ${state.variables.niveau_lavi}. ${state.attempted} question(s) évaluée(s) sur les ${questions.filter(q => q.bonneReponse != null).length} disponibles. Ce positionnement est indicatif.`;
  sendResult(state);
  $('result-title').focus();
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
$('welcome-description').textContent = 'Le parcours s’adapte à tes réponses. Tu pourras t’arrêter entre deux niveaux.';
renderIntakeStep(false);
