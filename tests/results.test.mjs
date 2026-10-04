import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DatabaseSync } from 'node:sqlite';
import { locationFromRequest, internalLocationHtml } from '../lib/location.js';
import { onRequestPost } from '../functions/api/results.js';
import { brevoContact, syncBrevoContact } from '../lib/brevo.js';

const empty = { country: null, countryCode: null, region: null, city: null, postalCode: null, timezone: null };
const cf = { country: 'FR', region: 'Île-de-France', city: 'Paris', postalCode: '75012', timezone: 'Europe/Paris' };
const expected = { ...cf, country: 'France', countryCode: 'FR' };
const participant = {
  prenom: 'Test', nom: 'Localisation', email: 'TEST@example.com', telephone: '+33612345678',
  niveau_lavi: 4, score: 12, points_possibles: 16, questions_evaluees: 16, raison_fin: 'completed',
};
function submission(body = participant, metadata = cf) {
  const request = new Request('https://dev.test-hebreu-lavi.pages.dev/api/results', {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'CF-Connecting-IP': '203.0.113.9', 'CF-IPCountry': 'US' },
    body: JSON.stringify(body),
  });
  if (metadata !== undefined) Object.defineProperty(request, 'cf', { value: metadata });
  return request;
}
function database() {
  const sqlite = new DatabaseSync(':memory:');
  return { sqlite, binding: { prepare(sql) {
    const statement = sqlite.prepare(sql);
    return { run: async () => statement.run(), bind: (...values) => ({ run: async () => statement.run(...values) }) };
  } } };
}

test('Cloudflare metadata becomes a nullable location without trusting browser data or headers', () => {
  assert.deepEqual(locationFromRequest({ cf }), expected);
  assert.deepEqual(locationFromRequest(new Request('http://localhost:8000')), empty);
  assert.deepEqual(locationFromRequest({ cf: { city: ' Paris ', postalCode: '', country: 'XX' } }), { ...empty, city: 'Paris' });
  assert.deepEqual(locationFromRequest({ cf: { country: 'T1', region: 42, city: {} } }), empty);
  assert.deepEqual(locationFromRequest({ get cf() { throw new Error('Unavailable'); } }), empty);
  assert.equal(locationFromRequest({ cf: { country: 'US' } }).country, 'États-Unis');
  const html = internalLocationHtml({ ...empty, city: '<script>"x"</script>' });
  assert.ok(!html.includes('<script>'));
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /Non disponible/);
});

test('validated participations and their location are stored together and sent to Make without an IP', async t => {
  const db = database();
  t.after(() => db.sqlite.close());
  const sent = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.equal(url, 'https://make.test/webhook');
    const payload = JSON.parse(options.body);
    // Storage precedes Make, so a later webhook failure cannot lose the result.
    assert.ok(db.sqlite.prepare('SELECT id FROM test_participations WHERE id = ?').get(payload.participation_id));
    sent.push(payload);
    return new Response('Accepted');
  });
  const env = { QUIZ_DB: db.binding, MAKE_WEBHOOK_URL: 'https://make.test/webhook' };
  for (let attempt = 0; attempt < 2; attempt++) {
    const response = await onRequestPost({ request: submission({ ...participant, location: { city: 'Forged' }, ip: '203.0.113.9' }, { ...cf, latitude: '48', longitude: '2' }), env });
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true });
  }
  assert.equal(new Set(sent.map(p => p.participation_id)).size, 2);
  assert.deepEqual(sent[0].location, expected);
  assert.equal(sent[0].email, 'test@example.com');
  for (const key of Object.keys(participant).filter(key => key !== 'email')) assert.equal(sent[0][key], participant[key]);
  assert.match(sent[0].internal_location_html, /Paris/);
  const row = db.sqlite.prepare('SELECT * FROM test_participations WHERE id = ?').get(sent[0].participation_id);
  assert.equal(row.country, 'France');
  assert.equal(row.country_code, 'FR');
  assert.equal(row.region, cf.region);
  assert.equal(row.city, cf.city);
  assert.equal(row.postal_code, cf.postalCode);
  assert.equal(row.timezone, cf.timezone);
  assert.equal(row.score, participant.score);
  assert.equal(row.webhook_status, 'accepted');
  assert.ok(!JSON.stringify([sent, row]).includes('203.0.113.9'));
  assert.ok(!('latitude' in sent[0].location));
});

test('local execution and unavailable D1 never prevent transmission, missing geo fields stay null', async t => {
  const sent = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => { sent.push(JSON.parse(options.body)); return new Response('Accepted'); });
  t.mock.method(console, 'error', () => {});
  for (const QUIZ_DB of [undefined, { prepare() { throw new Error('D1 unavailable'); } }]) {
    const request = submission(participant, null);
    assert.equal((await onRequestPost({ request, env: { QUIZ_DB, MAKE_WEBHOOK_URL: 'https://make.test/webhook' } })).status, 200);
  }
  assert.equal(sent.length, 2);
  for (const payload of sent) assert.deepEqual(payload.location, empty);
});

test('Make errors keep the participation and location in D1', async t => {
  const db = database();
  t.after(() => db.sqlite.close());
  t.mock.method(console, 'error', () => {});
  t.mock.method(globalThis, 'fetch', async () => new Response('Unavailable', { status: 503 }));
  const response = await onRequestPost({ request: submission(), env: { QUIZ_DB: db.binding, MAKE_WEBHOOK_URL: 'https://make.test/webhook' } });
  assert.equal(response.status, 502);
  const row = db.sqlite.prepare('SELECT * FROM test_participations').get();
  assert.equal(row.city, 'Paris');
  assert.equal(row.webhook_status, 'failed');
});

test('invalid submissions are rejected before storage or transmission', async t => {
  t.mock.method(globalThis, 'fetch', async () => assert.fail('Invalid submission reached Make'));
  const env = { QUIZ_DB: { prepare() { assert.fail('Invalid submission reached D1'); } } };
  for (const body of [null, [], { ...participant, email: 'invalid' }, ...['0612345678', '', '+0000000', 'invalid'].map(telephone => ({ ...participant, telephone }))]) {
    assert.equal((await onRequestPost({ request: submission(body), env })).status, 400);
  }
});

test('international phones are normalized before storage and all transmissions', async t => {
  const db = database();
  t.after(() => db.sqlite.close());
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    const body = JSON.parse(options.body);
    if (url === 'https://make.test/webhook') assert.equal(body.telephone, '+972501234567');
    else for (const key of ['SMS', 'LANDLINE_NUMBER', 'WHATSAPP']) assert.equal(body.attributes[key], '+972501234567');
    return new Response(null, { status: 204 });
  });
  const env = { QUIZ_DB: db.binding, MAKE_WEBHOOK_URL: 'https://make.test/webhook', BREVO_API_KEY: 'test-key' };
  assert.equal((await onRequestPost({ request: submission({ ...participant, telephone: '00972 (50) 123-4567' }), env })).status, 200);
  assert.equal(db.sqlite.prepare('SELECT telephone FROM test_participations').get().telephone, '+972501234567');
});

test('Brevo creates then updates the contact by normalized email at the end of the test', async t => {
  const db = database();
  t.after(() => db.sqlite.close());
  const contacts = new Map();
  let calls = 0;
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    if (url === 'https://make.test/webhook') return new Response('Accepted');
    assert.equal(url, 'https://api.brevo.com/v3/contacts');
    assert.equal(options.headers['api-key'], 'test-key');
    assert.equal(options.method, 'POST');
    assert.ok(options.signal instanceof AbortSignal);
    const contact = JSON.parse(options.body);
    assert.equal(contact.updateEnabled, true);
    assert.deepEqual(contact.listIds, [42]);
    assert.equal(contact.email, 'test@example.com');
    assert.equal(contact.attributes.PRENOM, participant.prenom);
    assert.equal(contact.attributes.NOM, participant.nom);
    assert.equal(contact.attributes.SMS, '+33612345678');
    assert.equal(contact.attributes.LANDLINE_NUMBER, contact.attributes.SMS);
    assert.equal(contact.attributes.WHATSAPP, contact.attributes.SMS);
    assert.equal(contact.attributes.COUNTRY, 'France');
    assert.deepEqual(Object.keys(contact.attributes).sort(), ['COUNTRY', 'LANDLINE_NUMBER', 'NIVEAU_LAVI', 'NOM', 'PRENOM', 'SMS', 'WHATSAPP']);
    assert.ok(!('forceMerge' in contact));
    assert.ok(!('emailBlacklisted' in contact));
    assert.ok(!('smsBlacklisted' in contact));
    const exists = contacts.has(contact.email);
    contacts.set(contact.email, contact);
    calls++;
    return new Response(exists ? null : '{"id":123}', { status: exists ? 204 : 201 });
  });
  const env = { QUIZ_DB: db.binding, MAKE_WEBHOOK_URL: 'https://make.test/webhook', BREVO_API_KEY: 'test-key', BREVO_LIST_ID: '42' };
  for (const niveau_lavi of [4, 6]) {
    assert.equal((await onRequestPost({ request: submission({ ...participant, telephone: '+33 6 12 34 56 78', niveau_lavi }), env })).status, 200);
  }
  assert.equal(calls, 2);
  assert.equal(contacts.size, 1);
  assert.equal(contacts.get('test@example.com').attributes.NIVEAU_LAVI, 6);
  assert.deepEqual(db.sqlite.prepare('SELECT status, http_status FROM brevo_sync ORDER BY rowid').all().map(row => ({ ...row })), [
    { status: 'accepted', http_status: 201 }, { status: 'accepted', http_status: 204 },
  ]);
});

test('Brevo country comes only from Cloudflare and is omitted when unavailable', async t => {
  const sent = [];
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    if (url === 'https://api.brevo.com/v3/contacts') sent.push(JSON.parse(options.body));
    return new Response(null, { status: 204 });
  });
  const env = { MAKE_WEBHOOK_URL: 'https://make.test/webhook', BREVO_API_KEY: 'test-key' };
  for (const metadata of [{ country: 'IL' }, null, { country: 'XX' }]) {
    const request = submission({ ...participant, country: 'Forged', location: { country: 'Forged' } }, metadata);
    assert.equal((await onRequestPost({ request, env })).status, 200);
  }
  assert.equal(sent[0].attributes.COUNTRY, 'Israël');
  assert.ok(!('COUNTRY' in sent[1].attributes));
  assert.ok(!('COUNTRY' in sent[2].attributes));
});

test('Brevo and Make failures are tracked independently', async t => {
  t.mock.method(console, 'error', () => {});
  for (const failure of ['brevo-http', 'brevo-network', 'make-http', 'make-missing']) {
    const db = database();
    t.after(() => db.sqlite.close());
    t.mock.method(globalThis, 'fetch', async url => {
      if (url === 'https://api.brevo.com/v3/contacts') {
        if (failure === 'brevo-network') throw new Error('timeout');
        return new Response(null, { status: failure === 'brevo-http' ? 429 : 204 });
      }
      return new Response(null, { status: failure === 'make-http' ? 503 : 200 });
    });
    const env = { QUIZ_DB: db.binding, BREVO_API_KEY: 'test-key' };
    if (failure !== 'make-missing') env.MAKE_WEBHOOK_URL = 'https://make.test/webhook';
    const response = await onRequestPost({ request: submission(), env });
    assert.equal(response.status, failure === 'make-missing' ? 503 : failure === 'make-http' ? 502 : 200);
    const brevo = db.sqlite.prepare('SELECT status, http_status FROM brevo_sync').get();
    assert.equal(brevo.status, failure.startsWith('brevo') ? 'failed' : 'accepted');
    if (failure === 'brevo-http') assert.equal(brevo.http_status, 429);
    assert.equal(db.sqlite.prepare('SELECT webhook_status FROM test_participations').get().webhook_status,
      failure.startsWith('make') ? 'failed' : 'accepted');
  }
});

test('Brevo configuration supports existing attributes and rejects unsafe mappings and list IDs', async t => {
  const payload = { ...participant, date_test: '2026-09-30T22:00:00Z', source: 'Test Hébreu Lavi' };
  const contact = brevoContact(payload, { BREVO_ATTRIBUTE_MAP: '{"prenom":"PRENOM","nom":"NOM","score":null}' });
  assert.equal(contact.attributes.PRENOM, 'Test');
  assert.equal(contact.attributes.NOM, 'Localisation');
  assert.ok(!('FIRSTNAME' in contact.attributes));
  assert.ok(!('SCORE_TEST' in contact.attributes));
  assert.ok(!('listIds' in contact));
  for (const map of ['null', '[]', '{', '{"prenom":"lowercase"}', '{"prenom":"SMS"}', '{"nom":"WHATSAPP"}', '{"prenom":"LANDLINE_NUMBER"}', '{"extra":"EXTRA"}', '{"nom":"PRENOM"}']) {
    assert.throws(() => brevoContact(payload, { BREVO_ATTRIBUTE_MAP: map }));
  }
  for (const id of ['0', '-1', 'abc', '42.5', '9007199254740992']) {
    assert.throws(() => brevoContact(payload, { BREVO_LIST_ID: id }));
  }
  t.mock.method(globalThis, 'fetch', async () => assert.fail('Configuration error must not call Brevo'));
  t.mock.method(console, 'error', () => {});
  assert.deepEqual(await syncBrevoContact({}, payload), { status: 'not_configured' });
  assert.deepEqual(await syncBrevoContact({ BREVO_API_KEY: 'test-key', BREVO_LIST_ID: '-1' }, payload), { status: 'configuration_error' });
});

test('all three existing phone fields receive the international number without unwanted attributes', () => {
  for (const telephone of ['+33 6 12 34 56 78', '0033 6 12 34 56 78', '+33 (6) 12-34-56-78']) {
    const contact = brevoContact({ ...participant, telephone }, {});
    assert.deepEqual(contact.attributes, {
      PRENOM: participant.prenom, NOM: participant.nom, SMS: '+33612345678',
      LANDLINE_NUMBER: '+33612345678', WHATSAPP: '+33612345678', NIVEAU_LAVI: 4,
    });
  }
  for (const telephone of ['0612345678', '0000000000', 'invalid', '+0000000', '+33abc612345678']) {
    const attributes = brevoContact({ ...participant, telephone }, {}).attributes;
    for (const key of ['SMS', 'LANDLINE_NUMBER', 'WHATSAPP']) assert.ok(!(key in attributes));
  }
});

test('Brevo sync continues without D1 and when its status storage fails', async t => {
  t.mock.method(console, 'error', () => {});
  let calls = 0;
  t.mock.method(globalThis, 'fetch', async () => { calls++; return new Response(null, { status: 204 }); });
  const payload = { ...participant, participation_id: 'test-id', date_test: '2026-09-30T22:00:00Z' };
  for (const db of [undefined, { prepare() { throw new Error('D1 unavailable'); } }]) {
    assert.equal((await syncBrevoContact({ BREVO_API_KEY: 'test-key' }, payload, db)).status, 'accepted');
  }
  assert.equal(calls, 2);
});
