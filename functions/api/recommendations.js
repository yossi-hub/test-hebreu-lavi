import { sessionDistance } from '../../lib/class-progression.js';
import { filterNearbyClasses, getLocalArea, publicAddress, venueName } from '../../lib/class-geography.js';

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  },
});

const AIRTABLE_DEFAULTS = {
  baseId: 'appNbwmEyVQsXA25U',
  tableId: 'tblTs7XeOJbkEcSf1',
};

const FIELDS = {
  number: 'fldcKQPOroEmSYmwE',
  type: 'fldCuRG3sEcLnT5fK',
  level: 'fld2E7XYUsEBuPBPx',
  currentChapter: 'fldedo3AHC5u6o7pZ',
  hours: 'fldOT7CUfWymgpt6x',
  status: 'fldwfIvxjy0RU9ske',
  remaining: 'fld6xVGS673ouP1j6',
  remainingCourses: 'fld7GpJgDkoIdSANr',
  signupUrl: 'fldPprJbrWEGOt1CT',
  teacher: 'fldd9vTjn64p5GdWb',
  day: 'fldBQEy5J44zTUtbJ',
  address: 'fldzLmZHGT3ZrJpuB',
  place: 'fldaewXOB571FRk08',
  calendar: 'fldF0hUIJ16Oj6B03',
  startDate: 'fldRD4iUQikjM9IqI',
  nextDate: 'fldYhtsc0XJUen2L4',
  endDate: 'fldUWJz3lDU0ig83t',
};

const textValue = (value) => {
  if (value == null) return '';
  if (Array.isArray(value)) return value.map(textValue).filter(Boolean).join(', ');
  if (typeof value === 'object') return String(value.name ?? value.value ?? '').trim();
  return String(value).trim();
};

const validHttpsUrl = (value) => {
  try {
    const url = new URL(String(value));
    return url.protocol === 'https:' && !url.username && !url.password ? url.toString() : '';
  } catch {
    return '';
  }
};

const numericValue = (value) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const text = textValue(value).replace(',', '.');
  if (!/^-?\d+(?:\.\d+)?$/.test(text)) return null;
  return Number(text);
};

const dateValue = (value) => {
  const raw = Array.isArray(value) ? value[0] : value;
  return typeof raw === 'string' && /^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(raw) && Number.isFinite(Date.parse(raw))
    ? raw : '';
};

export function normalizeClass(record) {
  const fields = record.fields || {};
  const endroitIds = Array.isArray(fields[FIELDS.place])
    ? fields[FIELDS.place].map(value => typeof value === 'string' ? value : value?.id).filter(Boolean) : [];
  return {
    id: record.id,
    nom: `Classe ${textValue(fields[FIELDS.number])}`,
    niveau: textValue(fields[FIELDS.level]),
    chapitre_en_cours: textValue(fields[FIELDS.currentChapter]).replace(',', '.'),
    format: textValue(fields[FIELDS.type]),
    statut: textValue(fields[FIELDS.status]),
    jour: textValue(fields[FIELDS.day]),
    horaires: textValue(fields[FIELDS.hours]),
    professeur: textValue(fields[FIELDS.teacher]),
    adresse: publicAddress(textValue(fields[FIELDS.address])),
    endroit_ids: endroitIds,
    lieu: venueName({ endroit_ids: endroitIds }),
    calendrier: textValue(fields[FIELDS.calendar]),
    places_restantes: numericValue(fields[FIELDS.remaining]),
    nombre_cours_restants: numericValue(fields[FIELDS.remainingCourses]),
    date_debut: dateValue(fields[FIELDS.startDate]),
    date_prochain_cours: dateValue(fields[FIELDS.nextDate]),
    date_fin: dateValue(fields[FIELDS.endDate]),
    lien: validHttpsUrl(fields[FIELDS.signupUrl]),
  };
}

export function selectEligible(records, niveauLavi) {
  return records
    .map(normalizeClass)
    .filter(item => item.id && item.lien
      && ['zoom', 'présentiel'].includes(item.format.toLocaleLowerCase('fr'))
      && ['in progress', 'upcoming'].includes(item.statut.toLowerCase()))
    .filter(item => item.statut.toLowerCase() === 'in progress'
      ? item.places_restantes != null && item.places_restantes > 0
        && item.nombre_cours_restants != null && item.nombre_cours_restants >= 5
      : item.places_restantes == null || item.places_restantes > 0)
    .map(item => {
      const distance = sessionDistance(item.chapitre_en_cours, niveauLavi);
      return distance ? { ...item, ...distance } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a.distance_seances - b.distance_seances
      || a.ecart_seances - b.ecart_seances
      || Number(b.places_restantes != null) - Number(a.places_restantes != null)
      || a.id.localeCompare(b.id));
}

async function fetchAirtableRecords(env) {
  const baseId = env.AIRTABLE_BASE_ID || AIRTABLE_DEFAULTS.baseId;
  const tableId = env.AIRTABLE_CLASSES_TABLE_ID || AIRTABLE_DEFAULTS.tableId;
  const records = [];
  const seenOffsets = new Set();
  let offset = '';
  do {
    const url = new URL(`https://api.airtable.com/v0/${baseId}/${tableId}`);
    url.searchParams.set('pageSize', '100');
    url.searchParams.set('returnFieldsByFieldId', 'true');
    // Only an optimisation: the same status whitelist is enforced after retrieval.
    url.searchParams.set('filterByFormula', 'OR({Status}="In Progress",{Status}="Upcoming")');
    for (const fieldId of Object.values(FIELDS)) url.searchParams.append('fields[]', fieldId);
    if (offset) url.searchParams.set('offset', offset);
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${env.AIRTABLE_TOKEN}` },
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      let upstreamType = '';
      try {
        const errorBody = await response.json();
        upstreamType = String(errorBody?.error?.type || errorBody?.error || '').slice(0, 80);
      } catch { /* The HTTP status is enough if Airtable does not return JSON. */ }
      const error = new Error(`Airtable returned ${response.status}`);
      error.upstreamStatus = response.status;
      error.upstreamType = upstreamType;
      throw error;
    }
    const data = await response.json();
    if (!Array.isArray(data.records)) throw new Error('Invalid Airtable records response');
    records.push(...data.records);
    offset = typeof data.offset === 'string' ? data.offset : '';
    if (offset && seenOffsets.has(offset)) throw new Error('Repeated Airtable pagination cursor');
    if (offset) seenOffsets.add(offset);
  } while (offset);
  return records;
}

function recommendationReason(item) {
  if (item.ecart_seances === 0) return `Le prochain cours commence à la séance ${item.prochaine_seance}, exactement à ton point de départ conseillé.`;
  const count = item.distance_seances;
  const sessions = `${count} séance${count > 1 ? 's' : ''}`;
  return item.ecart_seances < 0
    ? `Le prochain cours se situe ${sessions} avant ton point de départ conseillé : tu pourras revoir ces notions.`
    : `Le prochain cours se situe ${sessions} après ton point de départ conseillé : ${count === 1 ? 'cette séance sera' : 'ces séances seront'} à rattraper.`;
}

function validatedInput(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  const level = typeof input.niveau_lavi === 'string' && /^\d{1,2}$/.test(input.niveau_lavi)
    ? Number(input.niveau_lavi) : input.niveau_lavi;
  if (!Number.isInteger(level) || level < 1 || level > 10) return null;
  if (input.presentiel !== undefined && typeof input.presentiel !== 'boolean') return null;
  const presentiel = input.presentiel === true;
  if (!presentiel) return { level, presentiel, localisation: null };
  const location = input.localisation;
  if (!location || typeof location !== 'object' || Array.isArray(location)) return null;
  const pays = typeof location.pays === 'string' ? location.pays.trim() : '';
  const ville = typeof location.ville === 'string' ? location.ville.trim() : '';
  if (!pays || pays.length > 100 || !ville || ville.length > 160) return null;
  return { level, presentiel, localisation: { pays, ville } };
}

export async function onRequestPost({ request, env }) {
  let input;
  try { input = await request.json(); }
  catch { return json({ ok: false, error: 'Corps JSON invalide' }, 400); }
  const parsed = validatedInput(input);
  if (!parsed) return json({ ok: false, error: 'Niveau ou localisation invalide' }, 400);
  if (!env.AIRTABLE_TOKEN) return json({ ok: false, error: 'Classes temporairement indisponibles' }, 503);

  try {
    const candidates = selectEligible(await fetchAirtableRecords(env), parsed.level);
    const zoom = candidates.filter(item => item.format.toLowerCase() === 'zoom').slice(0, 3);
    const presentiel = parsed.presentiel
      ? filterNearbyClasses(candidates.filter(item => item.format.toLocaleLowerCase('fr') === 'présentiel'), parsed.localisation).slice(0, 3)
      : [];
    const enrich = item => ({ ...item, raison: recommendationReason(item) });
    const groups = { zoom: zoom.map(enrich), presentiel: presentiel.map(enrich) };
    return json({
      ok: true,
      source: 'rules',
      niveau_lavi: parsed.level,
      chapitre_cible: parsed.level,
      recommendations: [...groups.zoom, ...groups.presentiel],
      groups,
      localisation_reconnue: parsed.presentiel ? Boolean(getLocalArea(parsed.localisation)) : null,
      zone_presentiel: parsed.presentiel ? getLocalArea(parsed.localisation)?.label || null : null,
    });
  } catch (error) {
    console.error('Unable to load Airtable class recommendations', error);
    return json({
      ok: false,
      error: 'Classes temporairement indisponibles',
      diagnostic: {
        service: 'airtable',
        status: Number(error?.upstreamStatus) || null,
        type: String(error?.upstreamType || '').slice(0, 80) || null,
      },
    }, 502);
  }
}

export function onRequestGet() {
  return json({ ok: false, error: 'Méthode non autorisée' }, 405);
}
