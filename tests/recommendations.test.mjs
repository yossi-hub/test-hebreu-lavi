import assert from 'node:assert/strict';
import {
  normalizeClass,
  onRequestPost,
  parseOpenAIResponse,
  selectEligible,
} from '../functions/api/recommendations.js';

const fields = {
  number: 'fldcKQPOroEmSYmwE',
  type: 'fldCuRG3sEcLnT5fK',
  level: 'fld2E7XYUsEBuPBPx',
  currentChapter: 'fldedo3AHC5u6o7pZ',
  hours: 'fldOT7CUfWymgpt6x',
  status: 'fldwfIvxjy0RU9ske',
  remaining: 'fld6xVGS673ouP1j6',
  signupUrl: 'fldPprJbrWEGOt1CT',
  day: 'fldBQEy5J44zTUtbJ',
};

const record = (id, overrides = {}) => ({
  id,
  fields: {
    [fields.number]: '105',
    [fields.type]: { name: 'Zoom' },
    [fields.level]: { name: 'Intermédiaire' },
    [fields.currentChapter]: '4,2',
    [fields.hours]: '19:00-20:30',
    [fields.status]: { name: 'Upcoming' },
    [fields.remaining]: 4,
    [fields.signupUrl]: 'https://www.oulpanlavi.com/classe-105',
    [fields.day]: 'Mardi',
    ...overrides,
  },
});

assert.deepEqual(normalizeClass(record('recA')), {
  id: 'recA',
  nom: 'Classe 105',
  niveau: 'Intermédiaire',
  chapitre_en_cours: 4.2,
  format: 'Zoom',
  statut: 'Upcoming',
  jour: 'Mardi',
  horaires: '19:00-20:30',
  professeur: '',
  adresse: '',
  calendrier: '',
  places_restantes: 4,
  lien: 'https://www.oulpanlavi.com/classe-105',
});

const eligible = selectEligible([
  record('recA'),
  record('recComplete', { [fields.status]: { name: 'Complete' } }),
  record('recInProgress', { [fields.status]: { name: 'In Progress' } }),
  record('recPresentiel', { [fields.type]: { name: 'Présentiel' } }),
  record('recFull', { [fields.remaining]: 0 }),
  record('recNearer', { [fields.currentChapter]: '4,0', [fields.level]: { name: 'Débutant+' } }),
  record('recWithoutChapter', { [fields.currentChapter]: '' }),
], 4);
assert.deepEqual(eligible.map(item => item.id), ['recNearer', 'recA']);
assert.equal(eligible[0].ecart_chapitre, 0);

// The inclusive +/- 1 range applies to all target levels, including the extremes.
for (const target of [1, 4, 9, 10]) {
  const withinRange = selectEligible([
    record('tooLow', { [fields.currentChapter]: target - 1.01 }),
    record('lowerBoundary', { [fields.currentChapter]: target - 1 }),
    record('exact', { [fields.currentChapter]: target }),
    record('decimal', { [fields.currentChapter]: `${target},2` }),
    record('upperBoundary', { [fields.currentChapter]: target + 1 }),
    record('tooHigh', { [fields.currentChapter]: target + 1.01 }),
  ], target);
  assert.deepEqual(withinRange.map(item => item.id), ['exact', 'decimal', 'lowerBoundary', 'upperBoundary']);
}

assert.deepEqual(parseOpenAIResponse({
  output: [{ content: [{ type: 'output_text', text: '{"recommandations":[]}' }] }],
}), { recommandations: [] });

const originalFetch = globalThis.fetch;
let calls = [];
globalThis.fetch = async (url, options = {}) => {
  calls.push({ url: String(url), options });
  if (String(url).startsWith('https://api.airtable.com/')) {
    return new Response(JSON.stringify({ records: [record('recA'), record('recTooFar', { [fields.currentChapter]: 6 })] }), { status: 200 });
  }
  if (String(url) === 'https://api.openai.com/v1/responses') {
    return new Response(JSON.stringify({
      output: [{ content: [{
        type: 'output_text',
        text: JSON.stringify({ recommandations: [
          { classe_id: 'recTooFar', raison: 'Une proposition hors plage à ignorer.' },
          { classe_id: 'recA', raison: 'Une classe à venir qui correspond précisément à ton niveau intermédiaire.' },
        ] }),
      }] }],
    }), { status: 200 });
  }
  throw new Error(`Unexpected URL: ${url}`);
};

const request = new Request('https://example.test/api/recommendations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ niveau_lavi: 4 }),
});
const response = await onRequestPost({
  request,
  env: { AIRTABLE_TOKEN: 'test-airtable', OPENAI_API_KEY: 'test-openai' },
});
assert.equal(response.status, 200);
const body = await response.json();
assert.equal(body.ok, true);
assert.equal(body.source, 'ai');
assert.equal(body.recommendations[0].id, 'recA');
assert.equal(body.recommendations.length, 1);
assert.equal(calls.length, 2);
assert.ok(!calls[1].options.body.includes('test-airtable'));
assert.deepEqual(JSON.parse(JSON.parse(calls[1].options.body).input).classes_eligibles.map(item => item.id), ['recA']);

calls = [];
const originalConsoleError = console.error;
console.error = () => {};
globalThis.fetch = async (url) => {
  calls.push(String(url));
  if (String(url).startsWith('https://api.airtable.com/')) {
    return new Response(JSON.stringify({ records: [record('recA'), record('recTooFar', { [fields.currentChapter]: 6 })] }), { status: 200 });
  }
  return new Response('indisponible', { status: 503 });
};
const fallbackResponse = await onRequestPost({
  request: new Request('https://example.test/api/recommendations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ niveau_lavi: 4 }),
  }),
  env: { AIRTABLE_TOKEN: 'test-airtable', OPENAI_API_KEY: 'test-openai' },
});
const fallbackBody = await fallbackResponse.json();
console.error = originalConsoleError;
assert.equal(fallbackBody.source, 'rules');
assert.equal(fallbackBody.recommendations.length, 1);
assert.match(fallbackBody.recommendations[0].raison, /chapitre 4.2/);

// No acceptable class means no recommendation, not a broader range or an AI call.
globalThis.fetch = async url => {
  assert.ok(String(url).startsWith('https://api.airtable.com/'), 'No AI call expected without eligible classes');
  return new Response(JSON.stringify({ records: [
    record('tooLow', { [fields.currentChapter]: '2,9' }),
    record('tooHigh', { [fields.currentChapter]: '5,1' }),
  ] }), { status: 200 });
};
const noMatchResponse = await onRequestPost({
  request: new Request('https://example.test/api/recommendations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ niveau_lavi: 4 }),
  }),
  env: { AIRTABLE_TOKEN: 'test-airtable', OPENAI_API_KEY: 'test-openai' },
});
assert.equal(noMatchResponse.status, 200);
assert.deepEqual((await noMatchResponse.json()).recommendations, []);

const levelTenResponse = await onRequestPost({
  request: new Request('https://example.test/api/recommendations', { method: 'POST',
    body: JSON.stringify({ niveau_lavi: 10 }) }),
  env: { AIRTABLE_TOKEN: 'test-airtable', OPENAI_API_KEY: 'test-openai' },
});
assert.equal(levelTenResponse.status, 200);
assert.equal((await levelTenResponse.json()).niveau_lavi, 10);
const invalidLevelResponse = await onRequestPost({
  request: new Request('https://example.test/api/recommendations', { method: 'POST',
    body: JSON.stringify({ niveau_lavi: 11 }) }),
  env: { AIRTABLE_TOKEN: 'test-airtable', OPENAI_API_KEY: 'test-openai' },
});
assert.equal(invalidLevelResponse.status, 400);
globalThis.fetch = originalFetch;
console.log('OK : normalisation Airtable, plage inclusive ±1, sélection IA, repli et absence de classe admissible.');
