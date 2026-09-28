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
  hours: 'fldOT7CUfWymgpt6x',
  status: 'fldwfIvxjy0RU9ske',
  remaining: 'fld6xVGS673ouP1j6',
  signupUrl: 'fldPprJbrWEGOt1CT',
  teacher: 'fldd9vTjn64p5GdWb',
  day: 'fldBQEy5J44zTUtbJ',
  address: 'fldzLmZHGT3ZrJpuB',
  calendar: 'fldF0hUIJ16Oj6',
};

export const LEVEL_LABELS = Object.freeze({
  1: 'Débutant',
  2: 'Débutant+',
  3: 'débutant ++',
  4: 'Intermédiaire',
  5: 'Intermédiaire+',
  6: 'Avancés 1',
  7: 'Avancés 2',
  8: 'Avancé 3',
  9: 'Avancé 3',
});

const textValue = (value) => {
  if (value == null) return '';
  if (Array.isArray(value)) return value.map(textValue).filter(Boolean).join(', ');
  if (typeof value === 'object') return String(value.name ?? value.value ?? '').trim();
  return String(value).trim();
};

const validHttpsUrl = (value) => {
  try {
    const url = new URL(String(value));
    return url.protocol === 'https:' ? url.toString() : '';
  } catch {
    return '';
  }
};

const numericValue = (value) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  const match = textValue(value).replace(',', '.').match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
};

export function normalizeClass(record) {
  const fields = record.fields || {};
  return {
    id: record.id,
    nom: `Classe ${textValue(fields[FIELDS.number])}`,
    niveau: textValue(fields[FIELDS.level]),
    format: textValue(fields[FIELDS.type]),
    statut: textValue(fields[FIELDS.status]),
    jour: textValue(fields[FIELDS.day]),
    horaires: textValue(fields[FIELDS.hours]),
    professeur: textValue(fields[FIELDS.teacher]),
    adresse: textValue(fields[FIELDS.address]),
    calendrier: textValue(fields[FIELDS.calendar]),
    places_restantes: numericValue(fields[FIELDS.remaining]),
    lien: validHttpsUrl(fields[FIELDS.signupUrl]),
  };
}

export function selectEligible(records, niveauLavi) {
  const targetLevel = LEVEL_LABELS[niveauLavi];
  if (!targetLevel) return [];
  const activeStatuses = new Set(['Upcoming', 'In Progress']);
  return records
    .map(normalizeClass)
    .filter(item => item.id && item.niveau === targetLevel && activeStatuses.has(item.statut))
    .filter(item => item.lien && (item.places_restantes == null || item.places_restantes > 0))
    .sort((a, b) => Number(b.statut === 'Upcoming') - Number(a.statut === 'Upcoming'))
    .slice(0, 20);
}

async function fetchAirtableRecords(env) {
  const baseId = env.AIRTABLE_BASE_ID || AIRTABLE_DEFAULTS.baseId;
  const tableId = env.AIRTABLE_CLASSES_TABLE_ID || AIRTABLE_DEFAULTS.tableId;
  const fields = Object.values(FIELDS);
  const records = [];
  let offset = '';
  for (let page = 0; page < 3; page += 1) {
    const url = new URL(`https://api.airtable.com/v0/${baseId}/${tableId}`);
    url.searchParams.set('pageSize', '100');
    url.searchParams.set('returnFieldsByFieldId', 'true');
    fields.forEach(field => url.searchParams.append('fields[]', field));
    if (offset) url.searchParams.set('offset', offset);
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${env.AIRTABLE_TOKEN}` },
    });
    if (!response.ok) throw new Error(`Airtable returned ${response.status}`);
    const data = await response.json();
    records.push(...(Array.isArray(data.records) ? data.records : []));
    offset = data.offset || '';
    if (!offset) break;
  }
  return records;
}

const recommendationSchema = (candidateIds) => ({
  type: 'object',
  properties: {
    recommandations: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          classe_id: { type: 'string', enum: candidateIds },
          raison: { type: 'string' },
        },
        required: ['classe_id', 'raison'],
        additionalProperties: false,
      },
    },
  },
  required: ['recommandations'],
  additionalProperties: false,
});

export function parseOpenAIResponse(data) {
  for (const item of data?.output || []) {
    for (const content of item?.content || []) {
      if (content?.type === 'output_text' && content.text) return JSON.parse(content.text);
    }
  }
  throw new Error('OpenAI response has no output text');
}

async function rankWithOpenAI(env, niveauLavi, candidates) {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: env.OPENAI_MODEL || 'gpt-6-luna',
      store: false,
      reasoning: { effort: 'low' },
      instructions: [
        'Tu conseilles des classes d’hébreu à un adulte après un test de niveau.',
        'Choisis au maximum trois classes parmi la liste fournie, sans jamais inventer un identifiant ni une information.',
        'Privilégie une classe Upcoming, avec des places, puis une classe In Progress pertinente.',
        'Rédige chaque raison en français, chaleureuse, concrète et en une phrase.',
        'Ne mentionne pas de donnée absente et ne promets pas une inscription.',
      ].join(' '),
      input: JSON.stringify({
        niveau_lavi: niveauLavi,
        niveau_airtable: LEVEL_LABELS[niveauLavi],
        classes_eligibles: candidates,
      }),
      text: {
        format: {
          type: 'json_schema',
          name: 'class_recommendations',
          strict: true,
          schema: recommendationSchema(candidates.map(item => item.id)),
        },
      },
    }),
  });
  if (!response.ok) throw new Error(`OpenAI returned ${response.status}`);
  return parseOpenAIResponse(await response.json());
}

const fallbackReason = (item) => item.statut === 'Upcoming'
  ? `Cette prochaine classe correspond au niveau ${item.niveau} conseillé à l’issue de ton test.`
  : `Cette classe en cours correspond au niveau ${item.niveau} conseillé à l’issue de ton test.`;

const enrichRecommendations = (candidates, selections) => {
  const byId = new Map(candidates.map(item => [item.id, item]));
  const seen = new Set();
  const enriched = [];
  for (const selection of selections || []) {
    const item = byId.get(selection?.classe_id);
    if (!item || seen.has(item.id)) continue;
    seen.add(item.id);
    enriched.push({ ...item, raison: String(selection.raison || fallbackReason(item)).slice(0, 240) });
    if (enriched.length === 3) break;
  }
  return enriched;
};

export async function onRequestPost({ request, env }) {
  if (!env.AIRTABLE_TOKEN || !env.OPENAI_API_KEY) {
    return json({ ok: false, error: 'Configuration DEV incomplète' }, 503);
  }
  let input;
  try {
    input = await request.json();
  } catch {
    return json({ ok: false, error: 'Corps JSON invalide' }, 400);
  }
  const niveauLavi = Number(input.niveau_lavi);
  if (!Number.isInteger(niveauLavi) || niveauLavi < 1 || niveauLavi > 9) {
    return json({ ok: false, error: 'Niveau invalide' }, 400);
  }

  try {
    const candidates = selectEligible(await fetchAirtableRecords(env), niveauLavi);
    if (!candidates.length) {
      return json({ ok: true, niveau_lavi: niveauLavi, niveau_airtable: LEVEL_LABELS[niveauLavi], recommendations: [] });
    }
    try {
      const result = await rankWithOpenAI(env, niveauLavi, candidates);
      const recommendations = enrichRecommendations(candidates, result.recommandations);
      if (recommendations.length) {
        return json({ ok: true, source: 'ai', niveau_lavi: niveauLavi, niveau_airtable: LEVEL_LABELS[niveauLavi], recommendations });
      }
    } catch (error) {
      console.error('Unable to rank classes with OpenAI', error);
    }
    const recommendations = candidates.slice(0, 3).map(item => ({ ...item, raison: fallbackReason(item) }));
    return json({ ok: true, source: 'rules', niveau_lavi: niveauLavi, niveau_airtable: LEVEL_LABELS[niveauLavi], recommendations });
  } catch (error) {
    console.error('Unable to load Airtable classes', error);
    return json({ ok: false, error: 'Classes temporairement indisponibles' }, 502);
  }
}

export function onRequestGet() {
  return json({ ok: false, error: 'Méthode non autorisée' }, 405);
}
