// Parcours des recommandations : consentement, lieu conditionnel et requêtes concurrentes.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');

class Element {
  constructor(tag = 'div') {
    this.tag = tag;
    this.tagName = tag.toUpperCase();
    this.children = [];
    this.events = {};
    this.attributes = {};
    this.hidden = false;
    this.disabled = false;
    this.value = '';
    this.checked = false;
    this.textContent = '';
    this.validity = { valid: true };
    this.classList = { toggle() {}, add() {}, remove() {} };
  }
  append(...nodes) { this.children.push(...nodes); }
  replaceChildren(...nodes) { this.children = [...nodes]; }
  addEventListener(name, listener) { this.events[name] = listener; }
  setAttribute(key, value) { this.attributes[key] = String(value); }
  getAttribute(key) { return this.attributes[key] ?? null; }
  removeAttribute(key) { delete this.attributes[key]; }
  focus() { this.focused = true; }
  remove() {}
  querySelector() { return null; }
  querySelectorAll() { return []; }
  set innerHTML(value) { throw new Error(`HTML brut injecté dans ${this.tag}`); }
}

const tick = () => new Promise(setImmediate);
const response = (data, ok = true) => ({ ok, json: async () => data });
const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};
const descendants = element => [element, ...(element.children || []).flatMap(node => typeof node === 'object' ? descendants(node) : [])];
const text = element => descendants(element).map(node => node.textContent || '').join(' ');
const cards = element => descendants(element).filter(node => node.tag === 'article');
const links = element => descendants(element).filter(node => node.tag === 'a');

const zoomClass = {
  id: 'recZoom', nom: 'Classe Zoom 105', niveau: 'Intermédiaire', format: 'Zoom', statut: 'In Progress',
  chapitre_en_cours: '4.2', prochaine_seance: '4.3', ecart_seances: 2, distance_seances: 2,
  jour: 'Mardi', horaires: '19:00–20:30', adresse: '', raison: 'Deux séances à rattraper.',
  places_restantes: 2, nombre_cours_restants: 5, lien: 'https://www.oulpanlavi.com/inscription-105',
};
const inPersonClass = {
  ...zoomClass, id: 'recParis', nom: 'Classe Paris 106', format: 'Présentiel', statut: 'Upcoming',
  lieu: 'Paris 19e · Acting International',
  adresse: '55 rue des Alouettes, 75019 Paris', zone_presentiel: 'Paris et petite couronne',
  date_debut: '2026-12-01', lien: 'https://www.oulpanlavi.com/inscription-106',
};
const result = (zoom = [zoomClass], presentiel = []) => ({
  ok: true, niveau_lavi: 4, source: 'rules', groups: { zoom, presentiel }, recommendations: [...zoom, ...presentiel],
});

function harness() {
  const html = fs.readFileSync('index.html', 'utf8');
  const elements = {};
  for (const match of html.matchAll(/<([a-z][\w-]*)\b([^>]*\bid="([^"]+)"[^>]*)>/g)) {
    const [, tag, attributes, id] = match;
    assert.ok(!elements[id], `Identifiant dupliqué : ${id}`);
    elements[id] = new Element(tag);
    elements[id].hidden = /\bhidden(?:\s|>|$)/.test(attributes);
  }
  const calls = [];
  let answer = async () => response(result());
  const context = vm.createContext({
    URL, URLSearchParams, AbortController, console,
    document: {
      getElementById(id) { assert.ok(elements[id], `Identifiant absent : ${id}`); return elements[id]; },
      createElement(tag) { return new Element(tag); },
      documentElement: { scrollHeight: 1000 },
    },
    scrollTo() {},
    fetch: async (url, options = {}) => {
      calls.push({ url, options });
      if (url === '/api/recommendations') return answer(url, options);
      return response({ ok: true });
    },
  });
  for (const file of ['questions.js', 'engine.js', 'app.js']) {
    vm.runInContext(fs.readFileSync(file, 'utf8'), context, { filename: file });
  }
  const run = source => vm.runInContext(source, context);
  const click = async id => { assert.equal(typeof elements[id].events.click, 'function', `Bouton non connecté : ${id}`); elements[id].events.click({ preventDefault() {} }); await tick(); };
  const submit = async () => { await elements['recommendation-location-form'].events.submit({ preventDefault() {} }); await tick(); };
  const requests = () => calls.filter(call => call.url === '/api/recommendations');
  const show = async () => {
    run(`
      intakeIndex = intakeSteps.length;
      userProfile.prenom = 'Alice';
      engine.state.variables.niveau_lavi = '4';
      engine.state.score = 4;
      engine.state.possible = 6;
      engine.state.attempted = 6;
      engine.state.reason = 'adaptive';
      showResults();
    `);
    await tick();
  };
  return { elements, calls, context, run, click, submit, requests, show, answer(fn) { answer = fn; } };
}

(async () => {
  // Le résultat et son envoi restent disponibles sans autoriser les recommandations.
  const h = harness();
  const el = h.elements;
  await h.show();
  assert.equal(el.results.hidden, false);
  assert.equal(el['result-level'].textContent, 'Niveau 4');
  assert.doesNotMatch(el['result-level'].textContent, /points|4\s*\/\s*6/);
  assert.match(el['result-summary'].textContent, /indicatif/);
  assert.doesNotMatch(el['result-summary'].textContent, /Niveau Lavi|question.s. évaluée/);
  assert.equal(el['recommendation-optin'].hidden, false);
  assert.equal(el['recommendation-format'].hidden, true);
  assert.equal(el['recommendation-location-form'].hidden, true);
  assert.equal(h.requests().length, 0, 'Aucun appel de recommandations au résultat');
  assert.equal(h.calls.filter(call => call.url === '/api/results').length, 1);
  const resultPayload = JSON.parse(h.calls.find(call => call.url === '/api/results').options.body);
  assert.equal(resultPayload.score, 4);
  assert.equal(resultPayload.points_possibles, 6);
  await h.click('recommendation-no');
  assert.equal(h.requests().length, 0, 'Refuser ne charge aucune classe');
  assert.equal(el.results.hidden, false);
  assert.equal(el['recommendation-declined'].hidden, false);
  assert.equal(el['recommendation-reconsider'].hidden, false);

  await h.click('recommendation-reconsider');
  // Le bouton de retour peut réafficher le consentement ou l'accepter explicitement.
  if (!el['recommendation-optin'].hidden) await h.click('recommendation-yes');
  assert.equal(el['recommendation-format'].hidden, false);
  assert.equal(el['recommendation-location-form'].hidden, true);
  assert.equal(h.requests().length, 0, 'Le choix du format précède le chargement');
  // Même si des champs avaient été remplis, ils ne doivent pas partir avec Zoom.
  el['recommendation-country'].value = 'France';
  el['recommendation-city'].value = 'Paris';
  h.answer(async () => response(result([zoomClass], [inPersonClass])));
  await h.click('recommendation-presentiel-no');
  assert.equal(h.requests().length, 1);
  assert.deepEqual(JSON.parse(h.requests()[0].options.body), { niveau_lavi: '4', presentiel: false });
  assert.equal(el['recommendation-location-form'].hidden, true);
  assert.equal(cards(el['class-recommendations-list']).length, 1);
  assert.doesNotMatch(text(el['class-recommendations-list']), /Classe Paris 106/);
  assert.doesNotMatch(text(el['class-recommendations-list']), /Deux séances à rattraper/);
  const signup = links(el['class-recommendations-list'])[0];
  assert.equal(signup.href, zoomClass.lien);
  assert.match(signup.textContent, /S.inscrire à cette classe/);
  assert.equal(signup.target, '_blank');
  assert.match(signup.rel, /noopener/);

  // La localisation n'est demandée et transmise qu'après le choix du présentiel.
  await h.click('recommendation-change');
  await h.click('recommendation-presentiel-yes');
  assert.equal(el['recommendation-location-form'].hidden, false);
  const beforeValidation = h.requests().length;
  el['recommendation-country'].value = '';
  el['recommendation-city'].value = '';
  await h.submit();
  assert.equal(h.requests().length, beforeValidation);
  assert.equal(el['recommendation-location-error'].hidden, false);
  el['recommendation-country'].value = ' France ';
  el['recommendation-city'].value = ' 75019 ';
  h.answer(async () => response(result([zoomClass], [inPersonClass])));
  await h.submit();
  assert.deepEqual(JSON.parse(h.requests().at(-1).options.body), {
    niveau_lavi: '4', presentiel: true, localisation: { pays: 'France', ville: '75019' },
  });
  assert.equal(cards(el['class-recommendations-list']).length, 2);
  assert.match(text(el['class-recommendations-list']), /Sur Zoom/);
  assert.match(text(el['class-recommendations-list']), /présentiel/i);
  assert.match(text(el['class-recommendations-list']), /Paris 19e · Acting International/);
  assert.doesNotMatch(text(el['class-recommendations-list']), /55 rue des Alouettes|75019|Paris et petite couronne|Deux séances à rattraper/);
  assert.deepEqual(new Set(links(el['class-recommendations-list']).map(node => node.href)), new Set([zoomClass.lien, inPersonClass.lien]));

  // Pas de présentiel compatible : les classes Zoom restent visibles.
  await h.click('recommendation-change');
  await h.click('recommendation-presentiel-yes');
  h.answer(async () => response(result([zoomClass], [])));
  await h.submit();
  assert.equal(cards(el['class-recommendations-list']).length, 1);
  assert.match(text(el['class-recommendations-list']) + el['class-recommendations-status'].textContent, /aucune.*présentiel|présentiel.*aucune/i);

  // Annuler le lieu revient à Zoom et supprime le lieu du corps envoyé.
  await h.click('recommendation-change');
  await h.click('recommendation-presentiel-yes');
  await h.click('recommendation-location-cancel');
  assert.deepEqual(JSON.parse(h.requests().at(-1).options.body), { niveau_lavi: '4', presentiel: false });

  // Un échec réseau conserve le bilan et laisse relancer le même choix.
  await h.click('recommendation-change');
  h.answer(async () => { throw new Error('Panne réseau'); });
  await h.click('recommendation-presentiel-no');
  assert.equal(el.results.hidden, false);
  assert.equal(el['recommendation-retry'].hidden, false);
  h.answer(async () => response(result()));
  await h.click('recommendation-retry');
  assert.equal(el['recommendation-retry'].hidden, true);
  assert.equal(cards(el['class-recommendations-list']).length, 1);

  // Le texte Airtable reste du texte, sans créer d'élément HTML.
  await h.click('recommendation-change');
  h.answer(async () => response(result([{ ...zoomClass, nom: '<img src=x onerror=alert(1)>' }])));
  await h.click('recommendation-presentiel-no');
  assert.equal(descendants(el['class-recommendations-list']).some(node => node.tag === 'img'), false);
  assert.match(text(el['class-recommendations-list']), /<img src=x onerror=alert\(1\)>/);
  // Une classe sans lien d'inscription HTTPS n'est pas proposée.
  await h.click('recommendation-change');
  h.answer(async () => response(result([{ ...zoomClass, lien: 'javascript:alert(1)' }])));
  await h.click('recommendation-presentiel-no');
  assert.equal(links(el['class-recommendations-list']).length, 0);
  assert.equal(cards(el['class-recommendations-list']).length, 0);

  // Une réponse ancienne ne remplace pas la recherche plus récente.
  const old = deferred();
  await h.click('recommendation-change');
  h.answer(() => old.promise);
  await h.click('recommendation-presentiel-no');
  const oldRequest = h.requests().at(-1);
  await h.click('recommendation-change');
  assert.equal(oldRequest.options.signal?.aborted, true);
  await h.click('recommendation-presentiel-yes');
  h.answer(async () => response(result([], [inPersonClass])));
  await h.submit();
  old.resolve(response(result([{ ...zoomClass, nom: 'Réponse obsolète' }])));
  await tick();
  assert.doesNotMatch(text(el['class-recommendations-list']), /Réponse obsolète/);
  assert.match(text(el['class-recommendations-list']), /Classe Paris 106/);

  // Recommencer invalide la requête et efface les choix et le lieu.
  const pending = deferred();
  await h.click('recommendation-change');
  h.answer(() => pending.promise);
  await h.click('recommendation-presentiel-no');
  const pendingRequest = h.requests().at(-1);
  await h.click('restart');
  assert.equal(pendingRequest.options.signal?.aborted, true);
  assert.equal(el.results.hidden, true);
  assert.equal(el['recommendation-country'].value, '');
  assert.equal(el['recommendation-city'].value, '');
  assert.equal(cards(el['class-recommendations-list']).length, 0);
  pending.resolve(response(result()));
  await tick();
  assert.equal(cards(el['class-recommendations-list']).length, 0);
  await h.show();
  assert.equal(el['recommendation-optin'].hidden, false);
  assert.equal(el['recommendation-format'].hidden, true);
  assert.equal(el['recommendation-location-form'].hidden, true);
  console.log('OK : recommandations facultatives, lieu conditionnel, inscription, erreurs et réponses périmées.');
})().catch(error => { console.error(error); process.exitCode = 1; });
