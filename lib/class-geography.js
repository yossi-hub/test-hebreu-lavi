// Secteurs de la V1 : ils servent à filtrer les lieux, sans prétendre calculer
// une distance ou un temps de trajet. Les identifiants viennent d'Endroits.
const normalize = value => String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9\u0590-\u05ff]+/g, ' ').trim().replace(/\s+/g, ' ');

const areas = [
  {
    id: 'paris', label: 'Paris et petite couronne', country: 'FR',
    cities: ['Paris', 'Saint-Maur-des-Fossés', 'Saint-Mandé', 'Levallois', 'Levallois-Perret', 'Fontenay-aux-Roses',
      'Boulogne-Billancourt', 'Vincennes', 'Montreuil', 'Charenton-le-Pont', 'Saint-Maurice', 'Créteil',
      'Maisons-Alfort', 'Alfortville', 'Joinville-le-Pont', 'Nogent-sur-Marne', 'Fontenay-sous-Bois',
      'Neuilly-sur-Seine', 'Courbevoie', 'Puteaux', 'Suresnes', 'Nanterre', 'Asnières-sur-Seine', 'Clichy',
      'Colombes', 'Bois-Colombes', 'La Garenne-Colombes', 'Issy-les-Moulineaux', 'Vanves', 'Malakoff',
      'Montrouge', 'Châtillon', 'Bagneux', 'Clamart', 'Sceaux', 'Bourg-la-Reine', 'Antony',
      'Saint-Denis', 'Saint-Ouen', 'Saint-Ouen-sur-Seine', 'Aubervilliers', 'Pantin', 'Les Lilas',
      'Le Pré-Saint-Gervais', 'Bagnolet', 'Romainville', 'Bobigny', 'Drancy', 'Noisy-le-Sec',
      'Ivry-sur-Seine', 'Vitry-sur-Seine', 'Villejuif', 'Le Kremlin-Bicêtre', 'Gentilly', 'Cachan',
      'L’Haÿ-les-Roses', 'Chennevières-sur-Marne', 'Champigny-sur-Marne', 'Rosny-sous-Bois'],
    postal: /^(?:75|92|93|94)\d{3}$/,
    places: ['rec0jA0p0IxcIn59D', 'rec27b2rA5W6atfTZ', 'rec4FX2S956KmXkxk', 'rec4JfbyOmwLcLRln',
      'rec5SvhSLVXPsLAcb', 'rec6rHpXqsCYlpL5h', 'recDxuD5MxWzzgXR6', 'recESzrvnyPH8hYst',
      'recKvpYSkV7A8oiyL', 'recM68jp7wX76qcfy', 'recNpekc2Nb2drYcZ', 'recWaf9rBcqy120mi',
      'recZnC1gV0nAXx06O', 'reclDWJXvbyHOEl6h'],
  },
  { id: 'lyon', label: 'Lyon et Villeurbanne', country: 'FR', cities: ['Lyon', 'Villeurbanne'],
    postal: /^(?:6900[1-9]|69100)$/, places: ['recvQfzarGh6lBzli'] },
  { id: 'nice', label: 'Nice', country: 'FR', cities: ['Nice'], postal: /^06[0-3]00$/, places: ['recgCk89palpnbtMC'] },
  { id: 'lille', label: 'Lille', country: 'FR', cities: ['Lille'], postal: /^(?:59000|59800)$/, places: ['recHBDNqEifOUO0BL'] },
  { id: 'bordeaux', label: 'Bordeaux', country: 'FR', cities: ['Bordeaux'], postal: /^33[0-38]00$/, places: ['recLm4Z1FrfixBhXb'] },
  { id: 'toulouse', label: 'Toulouse', country: 'FR', cities: ['Toulouse'], postal: /^31[0-5]00$/, places: ['recPOZ2Kf4nNkCqVL'] },
  { id: 'marseille', label: 'Marseille', country: 'FR', cities: ['Marseille'], postal: /^130(?:0[1-9]|1[0-6])$/, places: ['recPSK5LlG1Jt7xtw'] },
  { id: 'jerusalem', label: 'Jérusalem', country: 'IL', cities: ['Jérusalem', 'Jerusalem', 'Yerushalayim', 'ירושלים'], places: ['recFm6xlv4yFT7sLe'] },
  { id: 'tel-aviv', label: 'Tel Aviv', country: 'IL', cities: ['Tel Aviv', 'Tel Aviv Yafo', 'Tel Aviv Jaffa', 'תל אביב', 'תל אביב יפו'], places: ['recOkcY3VeVablVFq'] },
];

const countryCode = value => {
  const text = normalize(value);
  if (['fr', 'fra', 'france'].includes(text)) return 'FR';
  if (['il', 'isr', 'israel', 'ישראל'].includes(text)) return 'IL';
  return null;
};

function areaFromText(value, country = null) {
  const text = normalize(value);
  const postal = text.match(/(?:^|\s)(\d{5})(?=\s|$)/)?.[1];
  if (postal && (!country || country === 'FR')) {
    // A postal code takes precedence over a street containing another city name.
    return areas.find(area => area.country === 'FR' && area.postal?.test(postal)) || null;
  }
  const withoutDistrict = text.replace(/\b\d{1,2}\s*(?:eme|e|er|arrondissement)?\b/g, '').trim();
  return areas.find(area => (!country || area.country === country) && area.cities.some(city => {
    const normalizedCity = normalize(city);
    return withoutDistrict === normalizedCity
      || withoutDistrict === `${normalizedCity} france`
      || withoutDistrict === `${normalizedCity} israel`;
  })) || null;
}

export function getLocalArea(localisation) {
  const country = countryCode(localisation?.pays);
  if (!country) return null;
  const area = areaFromText(localisation?.ville, country);
  return area ? { id: area.id, label: area.label, country: area.country } : null;
}

export function filterNearbyClasses(candidates, localisation) {
  const selected = getLocalArea(localisation);
  if (!selected) return [];
  return candidates.flatMap(item => {
    const ids = Array.isArray(item.endroit_ids) ? item.endroit_ids : [];
    const area = areas.find(candidate => candidate.places.some(id => ids.includes(id)))
      || areaFromText(item.adresse);
    return area?.id === selected.id && area.country === selected.country
      ? [{ ...item, zone_presentiel: area.label }] : [];
  });
}

const parisVenues = {
  rec0jA0p0IxcIn59D: 'Saint-Maur-des-Fossés', rec27b2rA5W6atfTZ: 'Paris 19e · Acting International',
  rec4FX2S956KmXkxk: 'Paris 16e', rec4JfbyOmwLcLRln: 'Fontenay-aux-Roses',
  rec5SvhSLVXPsLAcb: 'Paris 6e · Odéon', rec6rHpXqsCYlpL5h: 'Levallois',
  recDxuD5MxWzzgXR6: 'Paris 12e · Ganénou', recESzrvnyPH8hYst: 'Paris 4e',
  recKvpYSkV7A8oiyL: 'Paris 12e · Maison de Séniors et de la Culture', recM68jp7wX76qcfy: 'Saint-Mandé',
  recNpekc2Nb2drYcZ: 'Paris 12e · Salle Alors', recWaf9rBcqy120mi: 'Paris 2e · KKL',
  recZnC1gV0nAXx06O: 'Paris 17e · CEJ', reclDWJXvbyHOEl6h: 'Paris 6e · École Alsacienne',
};

export function venueName(item) {
  for (const id of item.endroit_ids || []) {
    if (parisVenues[id]) return parisVenues[id];
    const area = areas.find(candidate => candidate.places.includes(id));
    if (area) return area.cities[0];
  }
  return '';
}

// Les adresses Airtable contiennent parfois des codes de porte, des étages et
// des consignes d'accès internes. Seules les lignes d'adresse sont publiques.
export function publicAddress(value) {
  const values = Array.isArray(value) ? value : [value];
  return values.flatMap(part => String(part ?? '').replace(/\r/g, '').split('\n'))
    .map(line => line.trim()).filter(Boolean)
    .map(line => line.replace(/\b(?:code|digicode|sonnez|sonner|interphone|etage|étage|salle|m[eé]tro)\s*[:\-]?.*$/i, '').trim())
    .filter(line => /\b\d{5}\b/.test(line)
      || /\b(?:rue|avenue|av\.|boulevard|bd\.|place|chemin|route|impasse|all[eé]e|street|road|rehov)\b/i.test(line))
    .join(', ').slice(0, 300);
}
