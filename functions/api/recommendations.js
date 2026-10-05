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
  signupUrl: 'fldPprJbrWEGOt1CT',
  teacher: 'fldd9vTjn64p5GdWb',
  day: 'fldBQEy5J44zTUtbJ',
  address: 'fldzLmZHGT3ZrJpuB',
  calendar: 'fldF0hUIJ16Oj6',
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
    chapitre_en_cours: numericValue(fields[FIELDS.currentChapter]),
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
  return records
    .map(normalizeClass)
    .filter(item => item.id
      && item.chapitre_en_cours != null
      && item.format.toLowerCase() === 'zoom'
      && item.statut.toLowerCase() === 'upcoming')
    .filter(item => item.lien && (item.places_restantes == null || item.places_restantes > 0))
    .map(item => ({ ...item, ecart_chapitre: Math.abs(item.chapitre_en_cours - niveauLavi) }))
    .filter(item => item.ecart_chapitre <= 1)
    .sort((a, b) => a.ecart_chapitre - b.ecart_chapitre)
    .slice(0, 20);
}

async function fetchAirtableRecords(env) {
  const baseId = env.AIRTABLE_BASE_ID || AIRTABLE_DEFAULTS.baseId;
  const tableId = env.AIRTABLE_CLASSES_TABLE_ID || AIRTABLE_DEFAULTS.tableId;
  const records = [];
  let offset = '';
  for (let page = 0; page < 3; page += 1) {
    const url = new URL(`https://api.airtable.com/v0/${baseId}/${tableId}`);
    url.searchParams.set('pageSize', '100');
    url.searchParams.set('returnFieldsByFieldId', 'true');
    if (offset) url.searchParams.set('offset', offset);
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${env.AIRTABLE_TOKEN}` },
    });
    if (!response.ok) {
      let upstreamType = '';
      try {
        const errorBody = await response.json();
        upstreamType = String(errorBody?.error?.type || errorBody?.error || '').slice(0, 80);
      } catch {
        // Le statut HTTP suffit si Airtable ne renvoie pas de JSON.
      }
      const error = new Error(`Airtable returned ${response.status}`);
      error.upstreamStatus = response.status;
      error.upstreamType = upstreamType;
      throw error;
    }
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
        'Le niveau Lavi calculé correspond au chapitre cible du participant.',
        'Classe d’abord les options dont le chapitre_en_cours est le plus proche du niveau_lavi et utilise ecart_chapitre pour les comparer.',
        'Les classes fournies sont Zoom et Upcoming, avec un écart maximal de 1 chapitre par rapport au chapitre cible, bornes incluses.',
        'À écart comparable, privilégie les classes dont la disponibilité des places est confirmée.',
        'Rédige chaque raison en français, chaleureuse, concrète et en une phrase.',
        'Ne mentionne pas de donnée absente et ne promets pas une inscription.',
      ].join(' '),
      input: JSON.stringify({
        niveau_lavi: niveauLavi,
        chapitre_cible: niveauLavi,
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
  ? `Cette prochaine classe, actuellement au chapitre ${item.chapitre_en_cours}, est proche du chapitre conseillé à l’issue de ton test.`
  : `Cette classe en cours, actuellement au chapitre ${item.chapitre_en_cours}, est proche du chapitre conseillé à l’issue de ton test.`;

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
  if (!Number.isInteger(niveauLavi) || niveauLavi < 1 || niveauLavi > 10) {
    return json({ ok: false, error: 'Niveau invalide' }, 400);
  }

  try {
    const candidates = selectEligible(await fetchAirtableRecords(env), niveauLavi);
    if (!candidates.length) {
      return json({ ok: true, niveau_lavi: niveauLavi, chapitre_cible: niveauLavi, recommendations: [] });
    }
    try {
      const result = await rankWithOpenAI(env, niveauLavi, candidates);
      const recommendations = enrichRecommendations(candidates, result.recommandations);
      if (recommendations.length) {
        return json({ ok: true, source: 'ai', niveau_lavi: niveauLavi, chapitre_cible: niveauLavi, recommendations });
      }
    } catch (error) {
      console.error('Unable to rank classes with OpenAI', error);
    }
    const recommendations = candidates.slice(0, 3).map(item => ({ ...item, raison: fallbackReason(item) }));
    return json({ ok: true, source: 'rules', niveau_lavi: niveauLavi, chapitre_cible: niveauLavi, recommendations });
  } catch (error) {
    console.error('Unable to load Airtable classes', error);
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
