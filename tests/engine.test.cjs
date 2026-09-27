const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const {createQuizEngine} = require('../engine.js');
const data = vm.runInNewContext(fs.readFileSync('questions.js', 'utf8') + '\n({questions, parcours})');
const {questions, parcours} = data;
const scored = questions.filter(q => q.bonneReponse != null);
assert.equal(scored.length, 68);
assert.equal(new Set(questions.map(q => q.id)).size, questions.length);
assert.equal(scored.reduce((sum,q)=>sum+q.points,0), 68);
assert.equal(new Set(scored.map(q=>q.niveau)).size, 8);
const selfAssessmentIds = [
  '283a501f-c840-4b74-9e88-545152769ef9',
  '547b1f37-9fc4-4f7b-8d47-73297c1dd2aa',
  '1933dae8-da62-464c-a72d-63141c72873b',
  'ce09c281-36db-4e76-ba69-778b64eb6172',
];
for (const id of selfAssessmentIds) {
  const question = questions.find(q => q.id === id);
  assert.equal(question.type, 'text');
  assert.equal(question.reponseOuiNon, true);
  assert.equal(question.instruction, 'Écris oui ou non.');
}
assert.equal(parcours.blocs.filter(b=>b.passage).length, 5);
assert.equal(scored.filter(q=>q.media?.type === 'image').length, 8);
assert.equal(new Set(scored.filter(q=>q.media?.type === 'video').map(q=>q.media.url)).size, 7);
for (const q of scored) assert.ok(q.choix.some(c=>c.valeur === q.bonneReponse));
for (const b of parcours.blocs) for(const id of b.questions) assert.ok(questions.some(q=>q.id===id));
function preferred(q, strong=false) {
  if(q.bonneReponse != null) return q.multiple ? [q.bonneReponse] : q.bonneReponse;
  if(selfAssessmentIds.includes(q.id)) return strong;
  if(q.type==='text') return 'Paris';
  if(q.multiple) return q.choix.map(c=>c.valeur);
  if(typeof q.choix[0].valeur === 'number') return strong ? 3 : 1;
  return true;
}
function run(pick) {
  const e=createQuizEngine(questions,parcours); let steps=0;
  while(!e.state.finished) {
    assert.ok(steps++ < 100,'Pas de boucle de parcours');
    const q=e.current(); const v=pick(q,e);
    try { e.submit(v); } catch(error) { console.error(q.id,q.type,q.texte,v,q.choix); throw error; } const score=e.state.score;
    assert.equal(e.submit(v),null); assert.equal(e.state.score,score);
    e.next();
  }
  return e;
}
const full=run(q=>preferred(q));
assert.equal(full.state.attempted,68); assert.equal(full.state.score,68);
assert.equal(full.state.variables.niveau_lavi,'9');
assert.equal(full.state.reason,'completed');
assert.equal(full.state.variables.mr8,0); // Correction de l’inversion de la dernière question.
const lastBlockFail=run((q,e)=>e.block.id==='9f0e2fb4-ee7c-4e01-9ef8-9b7f8d4065cf'?q.choix.find(c=>c.valeur!==q.bonneReponse).valeur:preferred(q));
assert.equal(lastBlockFail.state.reason,'threshold');
assert.equal(lastBlockFail.state.variables.niveau_lavi,'8');
full.reset(); assert.equal(full.state.score,0); assert.equal(Object.keys(full.state.answers).length,0);
const noAlphabet=run(q=>q.id==='bfff1062-27eb-455c-bb6b-ae72d17c0495'?false:preferred(q));
assert.equal(noAlphabet.state.reason,'alphabet'); assert.equal(noAlphabet.state.attempted,0);
const earlyNo=createQuizEngine(questions,parcours);
earlyNo.submit(true); earlyNo.next();
earlyNo.submit(false); earlyNo.next();
assert.equal(earlyNo.current().id,'353a37e5-2d45-4bec-a856-a8312586b6f0');
assert.equal(earlyNo.state.answers[selfAssessmentIds[2]],undefined);
assert.equal(earlyNo.state.answers[selfAssessmentIds[3]],undefined);
const advanced=run(q=>preferred(q,true));
assert.equal(advanced.state.attempted,43); // Niveaux 1–3 omis selon l’autoévaluation.
assert.equal(advanced.state.score,43);
const advancedFail=run(q=>q.niveau===4?(q.multiple ? [q.choix.find(c=>c.valeur!==q.bonneReponse).valeur] : q.choix.find(c=>c.valeur!==q.bonneReponse).valeur):preferred(q,true));
assert.equal(advancedFail.state.variables.niveau_lavi,'3');
assert.equal(advancedFail.state.attempted,3);
for(let level=1;level<=8;level++) {
  const failed=run(q=>q.niveau===level?(q.multiple ? [q.choix.find(c=>c.valeur!==q.bonneReponse).valeur] : q.choix.find(c=>c.valeur!==q.bonneReponse).valeur):preferred(q));
  assert.ok(failed.state.finished);
  assert.equal(failed.state.variables.niveau_lavi,String(level));
  assert.ok(Number(failed.state.variables['mr'+level])>=2);
  assert.ok(failed.state.attempted<=68);
}
for(let level=1;level<=7;level++) {
  let gates=0;
  const stopped=run((q,e)=>e.block.transition && ++gates===level?false:preferred(q));
  assert.equal(stopped.state.reason,'choice');
  assert.equal(stopped.state.variables.niveau_lavi,String(level+1));
}
const skipped=run(q=>q.obligatoire?preferred(q):null);
assert.ok(skipped.state.finished); assert.ok(skipped.state.score<68);
const e=createQuizEngine(questions,parcours);
while(!e.current().obligatoire) { e.submit(preferred(e.current()));e.next(); }
assert.throws(()=>e.submit('   '),/Réponds/);
e.submit('Paris'); e.next();
while(e.current().type !== 'qcm') {e.submit(preferred(e.current()));e.next();}
assert.throws(()=>e.submit('invalid-choice'),/Choix/);
console.log('OK : import, parcours complet, démarrage avancé, arrêts des 8 niveaux, refus des 7 transitions, sauts, reset et double validation.');
