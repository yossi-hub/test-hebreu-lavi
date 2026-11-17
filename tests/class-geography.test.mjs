import assert from 'node:assert/strict';
import { filterNearbyClasses, getLocalArea, publicAddress, venueName } from '../lib/class-geography.js';

for (const ville of ['Paris', 'PARIS 19ème', 'Paris 19', '75012', '75012 Paris', 'Saint-Mandé', 'Levallois-Perret', '94210']) {
  assert.equal(getLocalArea({ pays: 'France', ville })?.id, 'paris', ville);
}
assert.equal(getLocalArea({ pays: 'FR', ville: '69100' })?.id, 'lyon');
assert.equal(getLocalArea({ pays: 'FR', ville: 'Lyon 6e' })?.id, 'lyon');
assert.equal(getLocalArea({ pays: 'Israël', ville: 'תל אביב' })?.id, 'tel-aviv');
assert.equal(getLocalArea({ pays: 'IL', ville: 'Jérusalem' })?.id, 'jerusalem');
for (const localisation of [{ pays: 'Canada', ville: 'Paris' }, { pays: 'France', ville: 'Tel Aviv' },
  { pays: 'Israël', ville: '75012' }, { pays: 'FR', ville: 'Rennes' }, {}, null]) {
  assert.equal(getLocalArea(localisation), null);
}

const candidates = [
  { id: 'best', endroit_ids: ['recM68jp7wX76qcfy'] },
  { id: 'nice', endroit_ids: ['recgCk89palpnbtMC'] },
  { id: 'paris-no-address', endroit_ids: ['rec4JfbyOmwLcLRln'] },
  { id: 'future-venue', adresse: '12 rue du Centre, 75012 Paris' },
  { id: 'lyon-street-paris', adresse: '12 rue de Paris, 69003 Lyon' },
  { id: 'unknown', endroit_ids: ['recUnknown'] },
];
assert.deepEqual(filterNearbyClasses(candidates, { pays: 'FR', ville: 'Paris' }).map(item => item.id),
  ['best', 'paris-no-address', 'future-venue']);
assert.ok(filterNearbyClasses(candidates, { pays: 'FR', ville: '75001' }).every(item => item.zone_presentiel === 'Paris et petite couronne'));
assert.deepEqual(filterNearbyClasses(candidates, { pays: 'IL', ville: 'Paris' }), []);
assert.equal(venueName({ endroit_ids: ['rec4JfbyOmwLcLRln'] }), 'Fontenay-aux-Roses');
assert.equal(venueName({ endroit_ids: ['recgCk89palpnbtMC'] }), 'Nice');
assert.equal(publicAddress('23 bis rue Dufrenoy\n75016 Paris\nCode : ⏹️A1328🔽'), '23 bis rue Dufrenoy, 75016 Paris');
assert.equal(publicAddress('30 Rue Saint-Hilaire, 94210 Saint-Maur-des-Fossés\n\nCode 2678'), '30 Rue Saint-Hilaire, 94210 Saint-Maur-des-Fossés');
assert.equal(publicAddress('CRESCO\n4 avenue Pasteur\n94160 Saint mandé\nMétro Saint mandé sortie rue du Parc\nSalle Yvette Guilbert'), '4 avenue Pasteur, 94160 Saint mandé');
assert.equal(publicAddress('5 rue Paul Dukas, 75012\nSonnez à Association Alors'), '5 rue Paul Dukas, 75012');
assert.equal(publicAddress('code 1234'), '');
assert.equal(publicAddress('12 rue du Centre 75012 Paris Code 9876'), '12 rue du Centre 75012 Paris');
console.log('OK : secteurs de présentiel, pays, codes postaux, ordre préservé et adresses publiques.');
