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
const context=vm.createContext({assert,URL,fetch:async()=>({ok:true,json:async()=>({success:true})}),document:{
  getElementById(id) {assert.ok(elements[id],`Identifiant absent : ${id}`);return elements[id];},
  createElement(tag) {const e=new Element(tag);created.push(e);return e;},
}});
for(const file of ['questions.js','engine.js','app.js']) vm.runInContext(fs.readFileSync(file,'utf8'),context);
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
intake('0600000000'); assert.equal(intakeIndex,3);
assert.equal(userProfile.prenom,'Alice');
assert.equal(userProfile.nom,'Martin');
assert.equal($('intake-confirmation').textContent,'Parfait, merci Alice. On peut commencer le test 😊');
$('start').events.click();
let steps=0;
let expectedHistory=$('history').children.length;
let introCounted=false;
while(!engine.state.finished) {
  assert.ok(steps++<100);
  const q=engine.current();
  if(q.points>0 && !introCounted) {
    assert.equal(testIntroShown,true);
    expectedHistory++;
    introCounted=true;
    const intro=$('history').children[$('history').children.length-1];
    assert.equal(intro.children[1].textContent,'OK Alice,');
  }
  const hadPassage=!$('passage-message').hidden;
  const historyBefore=$('history').children.length;
  assert.equal($('question-title').textContent,formatQuestionText(q.texte).text);
  assert.equal($('question-title').dir,/[\u0590-\u05ff]/.test(q.texte)?'rtl':'ltr');
  assert.equal($('written-form').hidden,q.type!=='text');
  if(q.type==='text') {
    if(q.reponseOuiNon) {
      $('written-answer').value='peut-être';
      $('written-form').events.submit({preventDefault(){}});
      assert.equal(engine.state.answered,false);
      assert.equal($('answer-error').hidden,false);
    }
    $('written-answer').value=q.reponseOuiNon?'non':q.reponseConversationnelle?'Je préfère les deux':'Paris';
    $('written-form').events.submit({preventDefault(){}});
  } else {
    const selfAssessmentIds=['283a501f-c840-4b74-9e88-545152769ef9','547b1f37-9fc4-4f7b-8d47-73297c1dd2aa','1933dae8-da62-464c-a72d-63141c72873b','ce09c281-36db-4e76-ba69-778b64eb6172'];
    const selected=q.bonneReponse!=null?q.bonneReponse:selfAssessmentIds.includes(q.id)?false:q.multiple?q.choix[0].valeur:true;
    const index=displayedChoices.findIndex(c=>c.valeur===selected);
    assert.ok(index>=0);
    $('choices').children[index].events.click();
    if(q.multiple) $('confirm-choices').events.click();
  }
  let introAddedThisTurn=false;
  if(!introCounted && testIntroShown) {
    expectedHistory++;
    introCounted=true;
    introAddedThisTurn=true;
    const intro=$('history').children[$('history').children.length-1];
    assert.equal(intro.children[1].textContent,'OK Alice,');
  }
  if(['283a501f-c840-4b74-9e88-545152769ef9','547b1f37-9fc4-4f7b-8d47-73297c1dd2aa','1933dae8-da62-464c-a72d-63141c72873b','ce09c281-36db-4e76-ba69-778b64eb6172','eb133ca8-54dc-489f-9b9a-2f1ab4553326','01bd29a5-dc50-4012-959f-d415559996c6'].includes(q.id)) {
    expectedHistory+=2+Number(hadPassage);
    assert.equal($('history').children.length,historyBefore+2+Number(hadPassage)+Number(introAddedThisTurn));
    assert.notEqual(engine.current().id,q.id);
    continue;
  }
  expectedHistory+=3+Number(hadPassage);
  assert.equal($('history').children.length,historyBefore+3+Number(hadPassage)+Number(introAddedThisTurn));
  if(!engine.state.finished) assert.notEqual(engine.current().id,q.id);
}
assert.equal(engine.state.score,68);
assert.equal($('score').textContent,'68 / 68 points');
assert.equal($('results').hidden,false);
assert.equal($('history').children.length,expectedHistory);
$('restart').events.click();
assert.equal(engine.state.score,0);
assert.equal($('history').children.length,0);
assert.equal(userProfile.prenom,'Alice');
assert.equal($('results').hidden,true);
`, context);
assert.ok(created.some(e=>e.tag==='img' && e.src.endsWith('/2ZwRQ52Q8wM/hqdefault.jpg')),'Aperçu du Short YouTube');
const videoPreview=created.find(e=>e.className==='youtube-preview');
videoPreview.events.click();
assert.ok(created.some(e=>e.tag==='iframe' && e.src.includes('youtube-nocookie.com/embed/')),'Lecture YouTube intégrée');
assert.equal(new Set(created.filter(e=>e.tag==='img' && e.src.includes('images.typeform.com')).map(e=>e.src)).size,8);
console.log('OK : profil, validations, parcours UI, QCM à choix unique, médias, score, historique, redémarrage.');
