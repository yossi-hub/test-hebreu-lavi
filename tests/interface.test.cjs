// Vérification des interactions sans navigateur : éléments DOM minimaux.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const created = [];
class Element {
  constructor(tag='div') { this.tag=tag; this.children=[]; this.hidden=false; this.events={}; this.attributes={}; this.value=''; this.validity={valid:true}; this.classList={toggle(){}}; }
  append(...nodes) { this.children.push(...nodes); }
  replaceChildren() { this.children=[]; }
  addEventListener(name,fn) {this.events[name]=fn;}
  setAttribute(key,value) {this.attributes[key]=value;}
  removeAttribute(key) {delete this.attributes[key];}
  querySelector() {return new Element();}
  querySelectorAll() {return [];}
  cloneNode(deep=false) {
    const copy = new Element(this.tag);
    for (const key of ['className', 'textContent', 'hidden', 'open', 'dir', 'lang']) copy[key] = this[key];
    copy.attributes = {...this.attributes};
    if (deep) copy.children = this.children.map(child => child.cloneNode(true));
    return copy;
  }
  focus() {}
  remove() {}
}
const html=fs.readFileSync('index.html','utf8');
assert.ok(html.includes('Je suis Lavi, ensemble, nous allons évaluer ton niveau d’hébreu.'));
const ids=[...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]);
assert.equal(new Set(ids).size,ids.length);
const elements=Object.fromEntries(ids.map(id=>[id,new Element()]));
const context=vm.createContext({assert,URL,URLSearchParams,FormData,Blob,AbortController,setTimeout,clearTimeout,fetch:async()=>({ok:true,json:async()=>({success:true})}),document:{
  getElementById(id) {assert.ok(elements[id],`Identifiant absent : ${id}`);return elements[id];},
  createElement(tag) {const e=new Element(tag);created.push(e);return e;},
}});
context.scrollPositions=[];
context.scrollTo=({top})=>context.scrollPositions.push(top);
for(const file of ['questions.js','engine.js','audio-recorder.js','audio-experiment.js','app.js']) vm.runInContext(fs.readFileSync(file,'utf8'),context);
vm.runInContext(`
const firstQcm=questions.find(q=>q.id==='353a37e5-2d45-4bec-a856-a8312586b6f0');
assert.equal(parseTypedAnswer(firstQcm,'אני דויד'),firstQcm.bonneReponse);
displayedChoices=[...firstQcm.choix];
assert.equal(parseTypedAnswer(firstQcm,String(displayedChoices.findIndex(c=>c.valeur===firstQcm.bonneReponse)+1)),firstQcm.bonneReponse);
const preference=questions.find(q=>q.id==='01bd29a5-dc50-4012-959f-d415559996c6');
assert.throws(()=>parseTypedAnswer(preference,'présentiel et distanciel'),/une seule préférence/);
assert.equal(parseTypedAnswer(preference,'Je préfère suivre les cours en ligne'),preference.choix[1].valeur);
assert.equal(parseTypedAnswer(preference,'Je préfère venir sur place'),preference.choix[0].valeur);
assert.throws(()=>parseTypedAnswer(firstQcm,'réponse inconnue'),/propositions/);
assert.deepEqual(formatQuestionText('?שלום! איך קוראים לך'),{text:'שלום! איך קוראים לך?',hebrew:true});
assert.deepEqual(formatHebrewText('!בסדר'),{text:'בסדר!',hebrew:true});
assert.deepEqual(formatQuestionText('Comment vas-tu ?'),{text:'Comment vas-tu ?',hebrew:false});
startTest(); assert.equal($('choices').children.length,0);
function intake(value) { $('intake-answer').value=value; $('intake-form').events.submit({preventDefault(){}}); }
assert.equal($('intake-form').className,'composer chat-input-only');
assert.equal($('intake-question').textContent,'Donne-moi ton prénom et ton nom, s’il te plaît.');
assert.equal($('intake-answer').placeholder,'Écris ton prénom et nom…');
intake(' '); assert.equal(intakeIndex,0);
intake('Alice'); assert.equal(intakeIndex,0);
intake('Alice Martin');
assert.equal($('intake-history').children[2].children[1].textContent,'Enchanté Alice');
assert.equal($('intake-form').className,'composer chat-input-only');
intake('bad-email'); assert.equal(intakeIndex,1);
intake('alice@example.fr'); intake(' '); assert.equal(intakeIndex,2);
assert.equal($('intake-answer').inputMode,'tel');
assert.equal($('intake-answer').placeholder,'+33 6 12 34 56 78');
for (const phone of ['0600000000', 'abc', '+0000000', '+33', '+336123456789012345']) {
  intake(phone); assert.equal(intakeIndex,2);
  assert.equal($('intake-error').hidden,false);
  assert.ok($('intake-error').textContent.includes('indicatif'));
}
intake('00 33 6 12 34 56 78'); assert.equal(intakeIndex,3);
assert.equal(userProfile.telephone,'+33612345678');
assert.equal(userProfile.prenom,'Alice');
assert.equal(userProfile.nom,'Martin');
assert.equal($('intake-choices').hidden,false);
assert.equal($('intake-form').hidden,true);
assert.equal($('intake-choices').children.length,2);
intake('autre'); assert.equal(intakeIndex,3);
$('intake-choices').children[1].events.click();
assert.equal(intakeIndex,4); assert.equal(userProfile.format_cours,'distanciel');
assert.equal(engine.state.score,0);
assert.equal($('intake-choices').hidden,true);
assert.equal($('intake-confirmation').textContent,'Parfait, merci Alice. On peut commencer le test 😊');
$('start').events.click();
assert.equal(testIntroShown,true);
const intro=$('history').children[0];
assert.equal(intro.children[1].textContent,'OK Alice,');
assert.match(intro.children[2].textContent,/adaptatif/);
assert.match(intro.children[2].textContent,/Passer cette question/);
assert.equal($('question-title').textContent,'Avant de commencer');
assert.equal($('choices').children.length,5);
const orientationSubmit=$('choices').children[4];
assert.equal(orientationSubmit.disabled,true);
for(let index=0;index<4;index++) {
  const noButton=$('choices').children[index].children[1].children[1];
  noButton.events.click();
  assert.equal(noButton.attributes['aria-pressed'],'true');
}
assert.equal(orientationSubmit.disabled,false);
orientationSubmit.events.click();
assert.equal(engine.state.mode,'test');
assert.equal(scrollPositions.at(-1),0);
let steps=0;
let expectedHistory=$('history').children.length;
while(!engine.state.finished) {
  assert.ok(steps++<100);
  const q=engine.current();
  const hadPassage=!$('passage-message').hidden;
  const historyBefore=$('history').children.length;
  assert.equal($('question-title').textContent,formatQuestionText(q.texte).text);
  assert.equal($('question-title').dir,/[\u0590-\u05ff]/.test(q.texte)?'rtl':'ltr');
  assert.equal($('progress-text').textContent, engine.state.tiebreakerActive ? 'Question de départage' : 'Question '+engine.state.levelQuestionNumber+' sur '+engine.state.levelQuestionCount);
  assert.equal($('progress').max,engine.state.levelQuestionCount);
  const support=engine.support;
  assert.equal($('support-progress').hidden,!support);
  if(support) assert.equal($('support-progress').textContent,(support.type==='video'?'Vidéo':'Texte')+' · question '+support.position+' sur '+support.total);
  assert.equal($('written-form').hidden,q.type!=='text');
  assert.equal($('skip').hidden,false);
  if(q.type==='text') {
    $('written-answer').value=q.bonneReponse;
    $('written-form').events.submit({preventDefault(){}});
  } else {
    const selected=q.bonneReponse;
    const index=displayedChoices.findIndex(c=>c.valeur===selected);
    assert.ok(index>=0);
    $('choices').children[index].events.click();
    if(q.multiple) $('confirm-choices').events.click();
  }
  expectedHistory+=3+Number(hadPassage);
  assert.equal($('history').children.length,historyBefore+3+Number(hadPassage));
  if(!engine.state.finished) assert.notEqual(engine.current().id,q.id);
}
assert.equal(engine.state.score,21);
assert.equal($('score').textContent,'21 / 21 points');
assert.equal($('results').hidden,false);
assert.equal(engine.state.variables.niveau_lavi,'9');
assert.ok($('result-summary').textContent.includes('Niveau Lavi conseillé : 9.'));
assert.equal($('history').children.length,expectedHistory);
$('restart').events.click();
assert.equal(engine.state.score,0);
assert.equal($('history').children.length,1);
assert.equal($('question-title').textContent,'Avant de commencer');
assert.equal($('support-progress').hidden,true);
assert.equal(userProfile.prenom,'Alice');
assert.equal($('results').hidden,true);
previousMediaKey='';
renderMedia(questions.find(q=>q.media?.type==='video'));
`, context);
assert.ok(created.some(e=>e.tag==='img' && e.src.includes('i.ytimg.com/vi/')),'Aperçu YouTube');
const videoPreview=created.find(e=>e.className==='youtube-preview');
videoPreview.events.click();
assert.ok(created.some(e=>e.tag==='iframe' && e.src.includes('youtube-nocookie.com/embed/')),'Lecture YouTube intégrée');
assert.ok(new Set(created.filter(e=>e.tag==='img' && e.src.includes('images.typeform.com')).map(e=>e.src)).size>=1);
vm.runInContext(`
// Vérifie le parcours de plusieurs nouvelles questions Airtable, hors placement.
createAudioAnswer = () => ({ dispose() {} });
createVoicePlayer = () => ({ element: document.createElement('div'), audio: document.createElement('audio') });
createSentVoiceNote = () => document.createElement('span');
audioCapability = { enabled: true };
devAudioQuestions = [
  { id: 'nouvelle-audio-1', type: 'audio_response', texte: 'Première question audio', points: 1, niveau: 1, choix: [], bonneReponse: null, obligatoire: true },
  { id: 'nouvelle-audio-2', type: 'audio_response', texte: 'Deuxième question audio', points: 1, niveau: 2, choix: [], bonneReponse: null, obligatoire: true },
];
$('audio-demo-start').events.click();
assert.equal(engine.current().id, 'nouvelle-audio-1');
assert.equal($('progress-text').textContent, 'Question audio 1 sur 2');
const unchanged = engine.state.attempted;
submitAnswer({ status: 'uncertain', confidence: 0.4 });
assert.equal(engine.state.attempted, unchanged);
submitAnswer({ status: 'correct', confidence: 0.95, duration: 2 });
assert.equal(engine.current().id, 'nouvelle-audio-2');
assert.equal($('progress-text').textContent, 'Question audio 2 sur 2');
submitAnswer({ status: 'incorrect', confidence: 0.95, duration: 3 });
assert.equal(engine.state.finished, true);
assert.equal($('results').hidden, true);
assert.equal($('composer').hidden, true);
assert.equal($('feedback').textContent, '❌ Faux');
$('audio-demo-return').events.click();
assert.equal(audioDemoMode, false);
assert.equal($('welcome').hidden, false);
assert.equal(engine.state.mode, 'orientation');
`, context);
vm.runInContext(`
// Deux textes : changement de bloc, compteur et sélection d’un seul exercice.
devAudioQuestions = ['texte-a', 'texte-b'].flatMap(group => [1, 2, 3].map(position => ({
  id: group + '-' + position, type: 'audio_response', texte: 'Question ' + position,
  supportGroup: group, supportText: 'Texte commun ' + group,
  points: 1, choix: [], bonneReponse: null, obligatoire: false,
})));
populateAudioExercises();
assert.equal($('audio-exercise-picker').hidden, false);
$('audio-exercise').value = '';
$('audio-demo-start').events.click();
for (let index = 0; index < 6; index++) {
  assert.equal(engine.current().id, (index < 3 ? 'texte-a' : 'texte-b') + '-' + (index % 3 + 1));
  assert.equal($('passage-message').hidden, index % 3 !== 0);
  assert.equal($('support-progress').textContent, 'Texte · question ' + (index % 3 + 1) + ' sur 3');
  assert.equal($('audio-answer').hidden, false);
  assert.equal($('written-form').hidden, true);
  assert.match($('instruction').textContent, /note vocale/);
  submitAnswer({ status: 'correct', confidence: 0.95, duration: 2 });
}
assert.equal(engine.state.finished, true);
assert.equal($('composer').hidden, true);
assert.equal($('results').hidden, true);
$('audio-demo-return').events.click();
$('audio-exercise').value = 'texte-b';
$('audio-demo-start').events.click();
assert.equal(audioExperimentQuestions.length, 3);
assert.equal(engine.current().id, 'texte-b-1');
assert.equal($('progress-text').textContent, 'Question audio 1 sur 3');
assert.equal($('question-passage').children[0].textContent, 'Texte commun texte-b');
$('audio-demo-return').events.click();
`, context);
console.log('OK : profil, validations, parcours UI, QCM à choix unique, médias, score, historique, redémarrage.');

// L’espace de test importe les brouillons, présélectionne le texte et laisse parcourir les trois questions.
(async () => {
  const labQuestions = [1, 2, 3].map(position => ({
    id: 'lab-' + position, type: 'audio_response', texte: 'לאן דנה נוסעת?',
    supportGroup: 'mon-texte', supportText: 'דנה נוסעת לירושלים ביום ראשון.',
    points: 1, choix: [], bonneReponse: null, obligatoire: true,
  }));
  context.fetch = async () => ({ ok: true, json: async () => ({ enabled: true, environment: 'production', demo: {type:'audio_response'} }) });
  elements['audio-dev-entry'].hidden = true;
  await vm.runInContext('loadAudioCapability()', context);
  assert.equal(elements['audio-dev-entry'].hidden, true, 'No audio test entry in the student journey');
  vm.runInContext('assert.equal(audioCapability.enabled,true)', context);
  let imported = 0;
  context.fetch = async (url, options) => {
    assert.equal(url, '/api/question-lab'); assert.equal(options.method, 'POST'); imported += 1;
    return { ok: true, json: async () => ({ version: 'lab-version', questions: labQuestions, draftQuestions: 3 }) };
  };
  vm.runInContext('configureQuestionLab()', context);
  assert.equal(elements['intake-form'].hidden, true);
  assert.equal(elements['start-action'].hidden, true);
  assert.equal(elements['question-lab-controls'].hidden, false);
  assert.equal(elements['audio-dev-entry'].hidden, false, 'The lab remains available to administrators');
  assert.equal(elements['welcome-title'].textContent, 'Tester mes questions');
  await vm.runInContext('loadQuestionLab(true)', context);
  assert.equal(imported, 1);
  assert.equal(elements['audio-exercise'].value, 'mon-texte');
  assert.equal(elements['audio-demo-start'].disabled, false);
  assert.match(elements['question-lab-status'].textContent, /3 en brouillon/);
  vm.runInContext(`
    assert.equal(questionSetVersion, 'lab-version');
    $('audio-demo-start').events.click();
    for (let position = 1; position <= 3; position++) {
      assert.equal(engine.current().id, 'lab-' + position);
      assert.equal($('question-title').dir, 'rtl');
      assert.equal($('skip').hidden, true);
      assert.equal($('audio-answer').hidden, false);
      assert.equal($('written-form').hidden, true);
      assert.equal($('support-progress').textContent, 'Texte · question ' + position + ' sur 3');
      if (position === 1) {
        assert.equal($('question-passage').children[0].dir, 'rtl');
        assert.equal($('question-passage').children[0].textContent, 'דנה נוסעת לירושלים ביום ראשון.');
      }
      submitAnswer({ status: 'correct', confidence: 0.96, duration: 2 });
    }
    assert.equal(engine.state.finished, true);
    assert.equal($('results').hidden, true);
    $('audio-demo-return').events.click();
    assert.equal($('welcome').hidden, false);
    assert.equal($('intake-form').hidden, true);
  `, context);
  context.fetch = async () => ({ ok: false, json: async () => ({ error: 'Corrige le groupe.', errors: ['Au moins 3 questions.'] }) });
  await vm.runInContext('loadQuestionLab(true)', context);
  vm.runInContext("assert.equal(questionSetVersion, 'lab-version'); assert.equal(devAudioQuestions.length, 3)", context);
  assert.equal(elements['audio-demo-start'].disabled, false);
  assert.equal(elements['question-lab-errors'].children[0].textContent, 'Au moins 3 questions.');
  assert.equal(elements['question-lab-status'].textContent, 'Corrige le groupe.');
  vm.runInContext("$('audio-demo-start').events.click()", context);
  assert.equal(elements['audio-debug'].hidden, true);
  assert.equal(elements['audio-debug-content'].children.length, 0);
  elements['audio-debug'].className = 'audio-debug';
  elements['audio-debug'].append(elements['audio-debug-content']);
  let audioCalls = 0;
  context.fetch = async (url, options) => {
    assert.equal(url, '/api/audio-response'); assert.equal(options.body.get('lab'), '1');
    assert.equal(options.body.get('version'), 'lab-version'); audioCalls += 1;
    const status = audioCalls === 1 ? 'uncertain' : audioCalls === 3 ? 'incorrect' : 'correct';
    return { ok: true, json: async () => ({ status, confidence: audioCalls === 1 ? 0.5 : 0.96,
      debug: { questionId: options.body.get('questionId'), question: 'לאן דנה נוסעת?', transcription: 'לירושלים', status, confidence: audioCalls === 1 ? 0.5 : 0.96,
        reason: 'Bonne destination.', answeredAt: '2026-10-05T08:00:00Z',
        evaluationOutput: { status: audioCalls === 3 ? 'incorrect' : 'correct', confidence: audioCalls === 1 ? 0.5 : 0.96, reason: 'Bonne destination.' } } }) };
  };
  await vm.runInContext('submitAudio(new Blob([new Uint8Array(100)], {type:"audio/wav"}), engine.current())', context);
  vm.runInContext("assert.equal(engine.current().id, 'lab-1'); assert.equal(engine.state.attempted, 0)", context);
  const firstAttempt = elements['audio-debug-content'].children[0];
  assert.equal(firstAttempt.children[3].textContent, 'לירושלים'); assert.equal(firstAttempt.children[3].dir, 'rtl');
  assert.match(firstAttempt.children[4].textContent, /Aucun point attribué/);
  assert.equal(JSON.parse(firstAttempt.children[6].textContent).status, 'correct');
  await vm.runInContext('submitAudio(new Blob([new Uint8Array(100)], {type:"audio/wav"}), engine.current())', context);
  vm.runInContext("assert.equal(engine.current().id, 'lab-2')", context);
  assert.equal(elements['audio-debug'].hidden, true);
  assert.equal(elements['audio-debug-content'].children.length, 0);
  const firstArchivedDetails = elements['history'].children.at(-1);
  assert.equal(firstArchivedDetails.className, 'audio-debug'); assert.equal(firstArchivedDetails.open, true);
  assert.equal(elements['history'].children.at(-2).textContent, '✅ Juste');
  const firstArchivedAttempts = firstArchivedDetails.children[0].children;
  assert.equal(firstArchivedAttempts.length, 2);
  assert.match(firstArchivedAttempts[0].children[4].textContent, /Aucun point attribué/);
  assert.match(firstArchivedAttempts[1].children[4].textContent, /1 point/);
  await vm.runInContext('submitAudio(new Blob([new Uint8Array(100)], {type:"audio/wav"}), engine.current())', context);
  vm.runInContext("assert.equal(engine.current().id, 'lab-3')", context);
  const secondArchivedDetails = elements['history'].children.at(-1);
  assert.equal(elements['history'].children.at(-2).textContent, '❌ Faux');
  assert.equal(secondArchivedDetails.children[0].children.length, 1);
  assert.match(secondArchivedDetails.children[0].children[0].children[4].textContent, /0 point/);
  assert.equal(firstArchivedDetails.children[0].children.length, 2);
  assert.equal(elements['audio-debug'].hidden, true);
  await vm.runInContext('submitAudio(new Blob([new Uint8Array(100)], {type:"audio/wav"}), engine.current())', context);
  vm.runInContext("assert.equal(engine.state.finished, true)", context);
  assert.equal(elements['feedback'].textContent, '✅ Juste');
  assert.equal(elements['audio-debug'].hidden, false);
  assert.equal(elements['audio-debug-content'].children.length, 1);
  const published = JSON.parse(vm.runInContext('JSON.stringify({questions, parcours, profileQuestions:intakeSteps})', context));
  const levelNine = Array.from({length:7}, (_,index)=>({id:`published-reading-${index+1}`, texte:`Question ${index+1}`, type:'audio_response', niveau:9, points:1, choix:[], bonneReponse:null}));
  published.questions.push(...levelNine);
  published.parcours.adaptive.maxLevel = 9;
  published.parcours.adaptive.tests[9] = {primary:levelNine.map(q=>q.id), minCorrect:6};
  published.parcours.blocs.push({id:'published-reading', niveau:9, passage:'Texte commun', questions:levelNine.map(q=>q.id)});
  context.fetch = async()=>({ok:true,json:async()=>({version:'level-nine',snapshot:published})});
  await vm.runInContext('loadQuestionSet()', context);
  vm.runInContext("assert.equal(parcours.adaptive.maxLevel,9); assert.equal(parcours.adaptive.tests[9].primary.length,7); assert.equal(engine.state.finished,false)", context);
  console.log('OK : laboratoire DEV, brouillons, texte RTL, transcription et JSON, distinction entre verdict modèle et décision retenue.');
})().catch(error => { console.error(error); process.exitCode = 1; });
