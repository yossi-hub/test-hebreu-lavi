import assert from 'node:assert/strict';
import { MAX_SESSION_GAP, normalizeClass, onRequestGet, onRequestPost, selectEligible } from '../functions/api/recommendations.js';
import { CHAPTER_SESSIONS, chapterStartIndex, nextClassSession, parseChapterSession, sessionDistance } from '../lib/class-progression.js';

const fields = {
  number: 'fldcKQPOroEmSYmwE', type: 'fldCuRG3sEcLnT5fK', level: 'fld2E7XYUsEBuPBPx',
  currentChapter: 'fldedo3AHC5u6o7pZ', hours: 'fldOT7CUfWymgpt6x', status: 'fldwfIvxjy0RU9ske',
  remaining: 'fld6xVGS673ouP1j6', remainingCourses: 'fld7GpJgDkoIdSANr', signupUrl: 'fldPprJbrWEGOt1CT',
  day: 'fldBQEy5J44zTUtbJ', address: 'fldzLmZHGT3ZrJpuB', place: 'fldaewXOB571FRk08',
  calendar: 'fldF0hUIJ16Oj6B03', start: 'fldRD4iUQikjM9IqI', next: 'fldYhtsc0XJUen2L4',
};

const record = (id, overrides = {}) => ({
  id,
  fields: {
    [fields.number]: '105', [fields.type]: { name: 'Zoom' }, [fields.level]: { name: 'Intermédiaire' },
    [fields.currentChapter]: '4.2', [fields.hours]: '19:00–20:30', [fields.status]: { name: 'In Progress' },
    [fields.remaining]: 4, [fields.remainingCourses]: 12, [fields.signupUrl]: 'https://www.oulpanlavi.com/inscription/105',
    [fields.day]: 'Mardi', ...overrides,
  },
});
const upcoming = (id, overrides = {}) => record(id, { [fields.status]: 'Upcoming', ...overrides });
const presentiel = (id, overrides = {}) => record(id, {
  [fields.type]: { name: 'Présentiel ' }, [fields.address]: ['10 rue des Rosiers, 75004 Paris'], ...overrides,
});

// Chapter/session labels are ordinal positions. Session 10 is not session 1.
assert.deepEqual(CHAPTER_SESSIONS, [7, 5, 7, 13, 7, 14, 10, 18, 10]);
assert.deepEqual(parseChapterSession('4.10'), { chapter: 4, session: 10, label: '4.10' });
assert.equal(parseChapterSession('4,10').session, 10);
assert.equal(parseChapterSession('4').session, 0);
assert.equal(nextClassSession('4').label, '4.1');
assert.equal(nextClassSession('4.2').label, '4.3');
assert.equal(nextClassSession('3.7').label, '4.1');
assert.equal(nextClassSession('4.13').label, '5.1');
assert.equal(nextClassSession('9.10').label, '10.1');
assert.equal(chapterStartIndex(4), 19);
assert.equal(chapterStartIndex(10), 91);
for (const invalid of ['', null, '4.14', '2.6', '0', '10.1', '4.2foo', '4.1.2', '-1']) {
  assert.equal(parseChapterSession(invalid), null, `Reject unknown/invalid position ${invalid}`);
}
assert.deepEqual(sessionDistance('3.7', 4), { prochaine_seance: '4.1', ecart_seances: 0, distance_seances: 0 });
assert.equal(sessionDistance('3.6', 4).ecart_seances, -1);
assert.equal(sessionDistance('4.1', 4).ecart_seances, 1);
assert.equal(sessionDistance('4.10', 4).distance_seances, 10);
assert.equal(sessionDistance('9.9', 10).ecart_seances, -1);

const normalized = normalizeClass(record('recA', {
  [fields.currentChapter]: '4,10', [fields.place]: ['recPlace'], [fields.start]: ['2026-11-20'],
  [fields.next]: '2026-11-27', [fields.calendar]: '20/11 ; 27/11',
}));
assert.equal(normalized.chapitre_en_cours, '4.10');
assert.equal(normalized.lien, 'https://www.oulpanlavi.com/inscription/105');
assert.equal(normalized.nombre_cours_restants, 12);
assert.equal(normalized.date_debut, '2026-11-20');
assert.equal(normalized.date_prochain_cours, '2026-11-27');
assert.equal(normalized.calendrier, '20/11 ; 27/11');
assert.deepEqual(normalized.endroit_ids, ['recPlace']);
assert.equal(normalizeClass(record('recVenue', { [fields.place]: ['rec4JfbyOmwLcLRln'] })).lieu, 'Fontenay-aux-Roses');

// In-progress classes require confirmed seats and at least five future courses.
const eligibility = selectEligible([
  record('fiveCourses', { [fields.remainingCourses]: 5 }),
  record('fourCourses', { [fields.remainingCourses]: 4 }),
  record('missingCount', { [fields.remainingCourses]: undefined }),
  record('unknownSeats', { [fields.remaining]: undefined }),
  record('emptySeats', { [fields.remaining]: '' }),
  record('zeroSeats', { [fields.remaining]: 0 }),
  record('negativeSeats', { [fields.remaining]: -1 }),
  record('complete', { [fields.status]: 'Complete' }),
  record('creation', { [fields.status]: 'In creation' }),
  record('noUrl', { [fields.signupUrl]: '' }),
  record('unsafeUrl', { [fields.signupUrl]: 'javascript:alert(1)' }),
  record('httpUrl', { [fields.signupUrl]: 'http://example.test/inscription' }),
  record('credentialsUrl', { [fields.signupUrl]: 'https://user:secret@example.test/inscription' }),
  record('badChapter', { [fields.currentChapter]: '4.99' }),
  record('noChapter', { [fields.currentChapter]: '' }),
  record('unsupportedFormat', { [fields.type]: 'Théâtre' }),
  upcoming('upcomingUnknown', { [fields.remaining]: undefined, [fields.remainingCourses]: undefined }),
  upcoming('upcomingFull', { [fields.remaining]: 0 }),
  presentiel('physical'),
], 4);
assert.deepEqual(eligibility.map(item => item.id), ['fiveCourses', 'physical', 'upcomingUnknown']);

// Rank admissible classes within five sessions, prioritising an earlier position on a tie.
const ordered = selectEligible([
  record('ten', { [fields.currentChapter]: '4.10' }),
  record('after', { [fields.currentChapter]: '4.1' }),
  record('exact', { [fields.currentChapter]: '3.7' }),
  record('two', { [fields.currentChapter]: '4.2' }),
  record('before', { [fields.currentChapter]: '3.6' }),
  record('nextChapter', { [fields.currentChapter]: '5.1' }),
], 4);
assert.deepEqual(ordered.map(item => item.id), ['exact', 'before', 'after', 'two']);
assert.equal(MAX_SESSION_GAP, 5);

// Both inclusive boundaries apply to every format and status, across chapter changes.
for (const factory of [record, upcoming, presentiel]) {
  const boundaryClasses = selectEligible([
    factory('outsideBefore', { [fields.currentChapter]: '3.1' }), // Next 3.2: six sessions before 4.1.
    factory('lowerBoundary', { [fields.currentChapter]: '3.2' }), // Next 3.3: five sessions before 4.1.
    factory('upperBoundary', { [fields.currentChapter]: '4.5' }), // Next 4.6: five sessions after 4.1.
    factory('outsideAfter', { [fields.currentChapter]: '4.6' }), // Next 4.7: six sessions after 4.1.
  ], 4);
  assert.deepEqual(boundaryClasses.map(item => item.id), ['lowerBoundary', 'upperBoundary']);
  assert.deepEqual(boundaryClasses.map(item => item.ecart_seances), [-5, 5]);
}
const rolloverBoundaries = selectEligible([
  record('lowerBoundary', { [fields.currentChapter]: '1.2' }),
  record('upperBoundary', { [fields.currentChapter]: '2.5' }), // Next 3.1: exactly five sessions after 2.1.
  record('outsideBefore', { [fields.currentChapter]: '1.1' }),
  record('outsideAfter', { [fields.currentChapter]: '3.1' }),
], 2);
assert.deepEqual(rolloverBoundaries.map(item => item.id), ['lowerBoundary', 'upperBoundary']);
assert.deepEqual(rolloverBoundaries.map(item => item.ecart_seances), [-5, 5]);
assert.equal(rolloverBoundaries[1].prochaine_seance, '3.1');

const request = (body) => new Request('https://example.test/api/recommendations', {
  method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
});
const env = { AIRTABLE_TOKEN: 'test-airtable' }; // No OpenAI key is required.
const originalFetch = globalThis.fetch;
const originalConsoleError = console.error;
try {
  globalThis.fetch = () => { throw new Error('Invalid input must not call Airtable'); };
  for (const input of [null, [], true, { niveau_lavi: null }, { niveau_lavi: true }, { niveau_lavi: 0 },
    { niveau_lavi: 11 }, { niveau_lavi: 4.2 }, { niveau_lavi: '4.2' }, { niveau_lavi: {} },
    { niveau_lavi: 4, presentiel: 'true' }, { niveau_lavi: 4, presentiel: true },
    { niveau_lavi: 4, presentiel: true, localisation: { pays: 'France', ville: '' } },
    { niveau_lavi: 4, presentiel: true, localisation: { pays: '', ville: 'Paris' } },
    { niveau_lavi: 4, presentiel: true, localisation: { pays: 'France', ville: 'x'.repeat(161) } },
  ]) {
    assert.equal((await onRequestPost({ request: request(input), env })).status, 400, JSON.stringify(input));
  }
  assert.equal((await onRequestPost({ request: new Request('https://example.test', { method: 'POST', body: 'invalid' }), env })).status, 400);
  assert.equal((await onRequestPost({ request: request({ niveau_lavi: 4 }), env: {} })).status, 503);
  assert.equal(onRequestGet().status, 405);

  const calls = [];
  const pages = [
    [record('zoomFar', { [fields.currentChapter]: '4.10' }), presentiel('parisFar')],
    [record('zoomTwo'), presentiel('lyon', { [fields.address]: ['10 rue Victor Hugo, 69002 Lyon'] })],
    [record('zoomOne', { [fields.currentChapter]: '4.1' }), presentiel('parisExact', { [fields.currentChapter]: '3.7' })],
    [record('zoomExact', { [fields.currentChapter]: '3.7' }), presentiel('parisOne', { [fields.currentChapter]: '4.1' })],
  ];
  globalThis.fetch = async (url, options) => {
    const parsed = new URL(url);
    assert.equal(parsed.hostname, 'api.airtable.com');
    assert.equal(options.headers.Authorization, 'Bearer test-airtable');
    assert.ok(options.signal instanceof AbortSignal);
    assert.equal(parsed.searchParams.get('returnFieldsByFieldId'), 'true');
    assert.ok(parsed.searchParams.getAll('fields[]').includes(fields.remainingCourses));
    const index = calls.length;
    assert.equal(parsed.searchParams.get('offset'), index ? `page${index + 1}` : null);
    calls.push(String(url));
    return Response.json({ records: pages[index], ...(index < pages.length - 1 ? { offset: `page${index + 2}` } : {}) });
  };
  const response = await onRequestPost({ request: request({ niveau_lavi: '4', presentiel: true, localisation: { pays: 'France', ville: 'Paris' } }), env });
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(body.source, 'rules');
  assert.equal(calls.length, 4, 'Read every Airtable page, including after page three');
  assert.deepEqual(body.groups.zoom.map(item => item.id), ['zoomExact', 'zoomOne', 'zoomTwo']);
  assert.deepEqual(body.groups.presentiel.map(item => item.id), ['parisExact', 'parisOne', 'parisFar']);
  assert.equal(body.recommendations.length, 6);
  assert.equal(body.localisation_reconnue, true);
  assert.match(body.groups.zoom[0].raison, /exactement/);
  assert.match(body.groups.zoom[1].raison, /rattraper/);
  assert.equal(body.groups.zoom[0].lien, 'https://www.oulpanlavi.com/inscription/105');

  globalThis.fetch = async () => Response.json({ records: [
    record('zoomBefore', { [fields.currentChapter]: '3.2' }),
    record('zoomAfter', { [fields.currentChapter]: '4.5' }),
    record('zoomOutsideBefore', { [fields.currentChapter]: '3.1' }),
    record('zoomOutsideAfter', { [fields.currentChapter]: '4.6' }),
    presentiel('parisBefore', { [fields.currentChapter]: '3.2' }),
    presentiel('parisAfter', { [fields.currentChapter]: '4.5' }),
    presentiel('parisOutsideBefore', { [fields.currentChapter]: '3.1' }),
    presentiel('parisOutsideAfter', { [fields.currentChapter]: '4.6' }),
  ] });
  const bounded = await (await onRequestPost({ request: request({ niveau_lavi: 4, presentiel: true, localisation: { pays: 'France', ville: 'Paris' } }), env })).json();
  assert.deepEqual(bounded.groups.zoom.map(item => item.id), ['zoomBefore', 'zoomAfter']);
  assert.deepEqual(bounded.groups.presentiel.map(item => item.id), ['parisBefore', 'parisAfter']);
  assert.equal(bounded.recommendations.length, 4, 'Do not fill a format with classes outside the window');
  for (const items of [bounded.groups.zoom, bounded.groups.presentiel, bounded.recommendations]) {
    assert.ok(items.every(item => item.distance_seances <= MAX_SESSION_GAP));
  }

  // No wider fallback when the only available classes are outside either boundary.
  globalThis.fetch = async () => Response.json({ records: [
    record('farZoom', { [fields.currentChapter]: '4.6' }),
    presentiel('farParis', { [fields.currentChapter]: '3.1' }),
  ] });
  const noNearby = await (await onRequestPost({ request: request({ niveau_lavi: 4, presentiel: true, localisation: { pays: 'France', ville: 'Paris' } }), env })).json();
  assert.deepEqual(noNearby.groups, { zoom: [], presentiel: [] });
  assert.deepEqual(noNearby.recommendations, []);

  globalThis.fetch = async () => Response.json({ records: [presentiel('paris'), record('zoom')] });
  const withoutOptIn = await (await onRequestPost({ request: request({ niveau_lavi: 4, presentiel: false, localisation: { pays: 'France', ville: 'Paris' } }), env })).json();
  assert.equal(withoutOptIn.groups.presentiel.length, 0, 'No physical class without explicit opt-in');
  assert.equal(withoutOptIn.localisation_reconnue, null);
  const unknownLocation = await (await onRequestPost({ request: request({ niveau_lavi: 4, presentiel: true, localisation: { pays: 'France', ville: 'Ville inconnue' } }), env })).json();
  assert.equal(unknownLocation.groups.presentiel.length, 0);
  assert.equal(unknownLocation.groups.zoom.length, 1);
  assert.equal(unknownLocation.localisation_reconnue, false);
  assert.equal((await onRequestPost({ request: request({ niveau_lavi: 10 }), env })).status, 200);

  globalThis.fetch = async () => Response.json({ records: [] });
  const empty = await (await onRequestPost({ request: request({ niveau_lavi: 1 }), env })).json();
  assert.deepEqual(empty.groups, { zoom: [], presentiel: [] });
  assert.deepEqual(empty.recommendations, []);

  console.error = () => {};
  for (const status of [401, 403, 429, 503]) {
    globalThis.fetch = async () => Response.json({ error: { type: 'UPSTREAM_ERROR' } }, { status });
    const failure = await onRequestPost({ request: request({ niveau_lavi: 4 }), env });
    assert.equal(failure.status, 502);
    const errorBody = await failure.json();
    assert.equal(errorBody.diagnostic.status, status);
    assert.equal(errorBody.diagnostic.type, 'UPSTREAM_ERROR');
    assert.ok(!JSON.stringify(errorBody).includes('test-airtable'));
  }
  globalThis.fetch = async () => Response.json({ error: 'bad shape' });
  assert.equal((await onRequestPost({ request: request({ niveau_lavi: 4 }), env })).status, 502);
  let repeatedCalls = 0;
  globalThis.fetch = async () => { repeatedCalls += 1; return Response.json({ records: [], offset: 'same' }); };
  assert.equal((await onRequestPost({ request: request({ niveau_lavi: 4 }), env })).status, 502);
  assert.equal(repeatedCalls, 2, 'Repeated pagination cursor must not loop forever');
  globalThis.fetch = async () => { throw new DOMException('Request timed out', 'TimeoutError'); };
  assert.equal((await onRequestPost({ request: request({ niveau_lavi: 4 }), env })).status, 502);
} finally {
  globalThis.fetch = originalFetch;
  console.error = originalConsoleError;
}

console.log('OK : progression par séances, places confirmées, seuil cinq cours, classement, opt-in présentiel, groupes, pagination et erreurs.');
