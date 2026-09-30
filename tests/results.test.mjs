import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DatabaseSync } from 'node:sqlite';
import { locationFromRequest, internalLocationHtml } from '../lib/location.js';
import { onRequestPost } from '../functions/api/results.js';

const empty = { country: null, countryCode: null, region: null, city: null, postalCode: null, timezone: null };
const cf = { country: 'FR', region: 'Île-de-France', city: 'Paris', postalCode: '75012', timezone: 'Europe/Paris' };
const expected = { ...cf, country: 'France', countryCode: 'FR' };
const participant = {
  prenom: 'Test', nom: 'Localisation', email: 'TEST@example.com', telephone: '0000000000',
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
  for (const body of [null, [], { ...participant, email: 'invalid' }]) {
    assert.equal((await onRequestPost({ request: submission(body), env })).status, 400);
  }
});
