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
  cloneNode() {return new Element();}
  focus() {}
  remove() {}
}
const html=fs.readFileSync('index.html','utf8');
assert.ok(html.includes('Je suis Lavi, ensemble, nous allons évaluer ton niveau d’hébreu.'));
const ids=[...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]);
assert.equal(new Set(ids).size,ids.length);
const elements=Object.fromEntries(ids.map(id=>[id,new Element()]));
const context=vm.createContext({assert,URL,URLSearchParams,fetch:async()=>({ok:true,json:async()=>({success:true})}),document:{
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
assert.equal(engine.state.score,12);
assert.equal($('score').textContent,'12 / 12 points');
assert.equal($('results').hidden,false);
assert.equal(engine.state.variables.niveau_lavi,'9');
assert.ok($('result-summary').textContent.includes('Niveau Lavi conseillé : 9.'));
assert.equal($('history').children.length,expectedHistory);
$('restart').events.click();
assert.equal(engine.state.score,0);
assert.equal($('history').children.length,1);
assert.equal($('question-title').textContent,'Avant de commencer');
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
console.log('OK : profil, validations, parcours UI, QCM à choix unique, médias, score, historique, redémarrage.');
