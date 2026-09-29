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
  record('recFull', { [fields.remaining]: 0 }),
  record('recNearer', { [fields.currentChapter]: '4,0', [fields.level]: { name: 'Débutant+' } }),
  record('recWithoutChapter', { [fields.currentChapter]: '' }),
], 4);
assert.deepEqual(eligible.map(item => item.id), ['recNearer', 'recA']);
assert.equal(eligible[0].ecart_chapitre, 0);

assert.deepEqual(parseOpenAIResponse({
  output: [{ content: [{ type: 'output_text', text: '{"recommandations":[]}' }] }],
}), { recommandations: [] });

const originalFetch = globalThis.fetch;
let calls = [];
globalThis.fetch = async (url, options = {}) => {
  calls.push({ url: String(url), options });
  if (String(url).startsWith('https://api.airtable.com/')) {
    return new Response(JSON.stringify({ records: [record('recA')] }), { status: 200 });
  }
  if (String(url) === 'https://api.openai.com/v1/responses') {
    return new Response(JSON.stringify({
      output: [{ content: [{
        type: 'output_text',
        text: JSON.stringify({ recommandations: [{ classe_id: 'recA', raison: 'Une classe à venir qui correspond précisément à ton niveau intermédiaire.' }] }),
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
assert.equal(calls.length, 2);
assert.ok(!calls[1].options.body.includes('test-airtable'));

calls = [];
const originalConsoleError = console.error;
console.error = () => {};
globalThis.fetch = async (url) => {
  calls.push(String(url));
  if (String(url).startsWith('https://api.airtable.com/')) {
    return new Response(JSON.stringify({ records: [record('recA')] }), { status: 200 });
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

globalThis.fetch = originalFetch;
console.log('OK : normalisation Airtable, filtrage par niveau, sélection IA et repli par règles.');
