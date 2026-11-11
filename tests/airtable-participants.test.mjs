import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DatabaseSync } from 'node:sqlite';
import { createRequire } from 'node:module';
import { normalizeMistakes, participantFields, PARTICIPANT_FIELDS as f, syncAirtableParticipant } from '../lib/airtable-participants.js';
import { onRequestPost as finish } from '../functions/api/results.js';
import { onRequestPost as start } from '../functions/api/participants.js';
const { createQuizEngine } = createRequire(import.meta.url)('../engine.js');
const payload = {
  prenom:'Test', nom:'Connexion', email:'test@example.com', telephone:'+33612345678',
  participation_id:'test-id', date_test:'2026-11-11T10:00:00Z', jeu_concours_hanouka:true,
  niveau_lavi:3, score:2, points_possibles:3, questions_evaluees:3, raison_fin:'adaptive',
  erreurs:[{question_id:'q1',question:'איך קוראים לך?',answer:'בוקר טוב',expected:'אני דנה',skipped:false}],
};
const env = { AIRTABLE_PARTICIPANTS_ENABLED:'true', AIRTABLE_TOKEN:'test-token', MAKE_WEBHOOK_URL:'https://make.test/webhook' };
const request = body => new Request('https://test.oulpanlavi.com/api/results', {
  method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body),
});
function database() {
  const sqlite = new DatabaseSync(':memory:');
  return {sqlite,binding:{prepare(sql) { const s=sqlite.prepare(sql); return {
    run:async()=>s.run(), all:async()=>({results:s.all()}), bind:(...values)=>({run:async()=>s.run(...values)}),
  }; }}};
}

test('The grading engine records readable mistakes, skips and reset for either quiz engine', () => {
  const questions=[{id:'q1',texte:'Question',type:'qcm',points:1,bonneReponse:'yes',choix:[{valeur:'yes',libelle:'Oui hébreu'},{valeur:'no',libelle:'Non hébreu'}]}];
  const quiz=createQuizEngine(questions,{variables:{},blocs:[{id:'b',questions:['q1'],niveau:1}]});
  quiz.submit('no');
  assert.deepEqual(quiz.state.mistakes,[{question_id:'q1',question:'Question',answer:'Non hébreu',expected:'Oui hébreu',skipped:false}]);
  quiz.reset(); assert.deepEqual(quiz.state.mistakes,[]);
  quiz.submit(null); assert.equal(quiz.state.mistakes[0].skipped,true);
  assert.equal(quiz.state.mistakes[0].answer,'Question passée');
  quiz.reset(); quiz.submit('yes'); assert.equal(quiz.state.mistakes.length,0);
});

test('Mistakes preserve Hebrew, reject malformed submissions and do not invent errors for old clients', () => {
  assert.deepEqual(normalizeMistakes(payload.erreurs),payload.erreurs);
  assert.equal(normalizeMistakes(undefined),null);
  for(const value of [{},[null],[{}],Array(151).fill({})]) assert.throws(()=>normalizeMistakes(value));
  const fields=participantFields(payload);
  assert.equal(fields[f.phone],payload.telephone);
  assert.equal(participantFields({...payload,telephone:'0033 6 12 34 56 78'},true)[f.phone],payload.telephone);
  assert.ok(!(f.phone in participantFields({...payload,telephone:undefined})));
  assert.equal(fields[f.contest],true); assert.equal(fields[f.mistakes],1);
  assert.match(fields[f.details],/בוקר טוב/); assert.match(fields[f.details],/אני דנה/);
  assert.equal(fields[f.status],'Terminé');
  const unknown=participantFields({...payload,erreurs:null});
  assert.ok(!(f.mistakes in unknown)); assert.ok(!(f.details in unknown));
  assert.equal(participantFields({...payload,erreurs:[]})[f.mistakes],0);
});

test('Start and repeated completions use the same email; restart preserves the completed result', async t => {
  const db=database(); t.after(()=>db.sqlite.close());
  const records=new Map(); let writes=0;
  t.mock.method(globalThis,'fetch',async(url,options)=>{
    assert.equal(options.headers.Authorization,'Bearer test-token');
    if(options.method!=='PATCH') return Response.json({records:[...records.values()]});
    const body=JSON.parse(options.body); writes++;
    assert.deepEqual(body.performUpsert.fieldsToMergeOn,[f.email]);
    const fields=body.records[0].fields, prior=records.get(fields[f.email]);
    const record={id:prior?.id || 'recTest',fields:{...prior?.fields,...fields}};
    records.set(fields[f.email],record); return Response.json({records:[record]});
  });
  assert.equal((await syncAirtableParticipant(env,payload,db.binding,{started:true})).status,'accepted');
  assert.equal(records.get(payload.email).fields[f.status],'Commencé');
  for(const level of [3,5]) assert.equal((await syncAirtableParticipant(env,{...payload,niveau_lavi:level},db.binding)).status,'accepted');
  await syncAirtableParticipant(env,payload,db.binding,{started:true});
  assert.equal(records.size,1); assert.equal(writes,3);
  assert.equal(records.get(payload.email).fields[f.status],'Terminé');
  assert.equal(records.get(payload.email).fields[f.level],'5');
  assert.equal(db.sqlite.prepare('SELECT status FROM airtable_sync').get().status,'accepted');
});

test('Intake stores the opt-in but cannot send Make emails or Brevo contacts',async t=>{
  const calls=[];
  t.mock.method(globalThis,'fetch',async(url,options)=>{
    assert.match(String(url),/^https:\/\/api.airtable.com\//); calls.push(options);
    return Response.json({records:options.method==='PATCH'?[{id:'recTest'}]:[]});
  });
  assert.equal((await start({request:request({...payload,email:'TEST@example.com'}),env})).status,200);
  const fields=JSON.parse(calls[1].body).records[0].fields;
  assert.equal(fields[f.email],'test@example.com'); assert.equal(fields[f.contest],true);
  assert.equal(fields[f.status],'Commencé'); assert.ok(!(f.score in fields));
  assert.equal(fields[f.phone],payload.telephone);
  assert.equal((await start({request:request({...payload,email:'invalid'}),env})).status,400);
  assert.equal(calls.length,2);
});

test('Restart updates only the phone of an existing completed participant and preserves results', async t => {
  const calls=[];
  t.mock.method(globalThis,'fetch',async(url,options)=>{
    calls.push({url:String(url),options});
    if(options.method==='PATCH') return Response.json({id:'recExisting'});
    assert.equal(new URL(url).searchParams.get('returnFieldsByFieldId'),'true');
    return Response.json({records:[{id:'recExisting',fields:{[f.status]:'Terminé',[f.score]:8,[f.details]:'Previous mistakes'}}]});
  });
  assert.equal((await start({request:request({...payload,telephone:'0033 6 12 34 56 78'}),env})).status,200);
  assert.equal(calls.length,2);
  assert.match(calls[1].url,/\/recExisting$/);
  assert.deepEqual(JSON.parse(calls[1].options.body),{fields:{[f.phone]:'+33612345678'}});
});

test('Airtable failure preserves the complete data and does not block existing result deliveries',async t=>{
  const db=database();t.after(()=>db.sqlite.close());
  t.mock.method(console,'error',()=>{});
  let make=0,brevo=0;
  t.mock.method(globalThis,'fetch',async(url,options)=>{
    if(String(url).startsWith('https://api.airtable.com')) return new Response(null,{status:403});
    if(url==='https://make.test/webhook') {make++;assert.ok(!('erreurs' in JSON.parse(options.body)));}
    else { assert.equal(url,'https://api.brevo.com/v3/contacts');brevo++; }
    return new Response(null,{status:204});
  });
  assert.equal((await finish({request:request(payload),env:{...env,QUIZ_DB:db.binding,BREVO_API_KEY:'test-key'}})).status,200);
  assert.equal(make,1);assert.equal(brevo,1);
  const row=db.sqlite.prepare('SELECT * FROM airtable_sync').get();
  assert.equal(row.status,'failed');assert.equal(row.http_status,403);
  assert.equal(JSON.parse(row.fields_json)[f.mistakes],1);
  assert.match(row.fields_json,/אני דנה/);
  assert.equal(db.sqlite.prepare('SELECT count(*) AS n FROM test_participations').get().n,1);
});

test('Airtable still saves when Make fails, malformed errors never reach any service',async t=>{
  t.mock.method(console,'error',()=>{});
  let airtable=0;
  t.mock.method(globalThis,'fetch',async(url)=>{
    if(String(url).startsWith('https://api.airtable.com')) {airtable++;return Response.json({records:[{id:'recTest'}]});}
    return new Response(null,{status:503});
  });
  assert.equal((await finish({request:request(payload),env})).status,502); assert.equal(airtable,1);
  assert.equal((await finish({request:request({...payload,erreurs:[null]}),env})).status,400);assert.equal(airtable,1);
});
