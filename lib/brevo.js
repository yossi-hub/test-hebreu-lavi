const CONTACTS_URL = 'https://api.brevo.com/v3/contacts';
const PHONE_ATTRIBUTES = ['SMS', 'LANDLINE_NUMBER', 'WHATSAPP'];

const DEFAULT_ATTRIBUTES = {
  prenom: 'PRENOM',
  nom: 'NOM',
  telephone: 'SMS',
  niveau_lavi: 'NIVEAU_LAVI',
  score: null,
  points_possibles: null,
  date_test: null,
  source: null,
};

export function internationalPhone(value) {
  const compact = String(value ?? '').trim().replace(/[\s().-]/g, '').replace(/^00/, '+');
  // Never infer a country from an IP location or a local phone number.
  return /^\+[1-9]\d{6,14}$/.test(compact) ? compact : null;
}

export function brevoContact(payload, env) {
  const overrides = env.BREVO_ATTRIBUTE_MAP ? JSON.parse(env.BREVO_ATTRIBUTE_MAP) : {};
  if (!overrides || typeof overrides !== 'object' || Array.isArray(overrides)) {
    throw new Error('Invalid attribute configuration');
  }
  for (const [field, attribute] of Object.entries(overrides)) {
    if (!Object.hasOwn(DEFAULT_ATTRIBUTES, field)
        || (attribute !== null && (typeof attribute !== 'string' || !/^[A-Z][A-Z0-9_]*$/.test(attribute)))) {
      throw new Error('Invalid attribute configuration');
    }
  }
  const attributes = {};
  for (const [field, attribute] of Object.entries({ ...DEFAULT_ATTRIBUTES, ...overrides })) {
    if (attribute === null) continue;
    if (Object.hasOwn(attributes, attribute)) throw new Error('Duplicate attribute configuration');
    if (['LANDLINE', 'EMAIL'].includes(attribute)
        || (PHONE_ATTRIBUTES.includes(attribute) && field !== 'telephone')) {
      throw new Error('Reserved contact identifier');
    }
    if (PHONE_ATTRIBUTES.includes(attribute)) {
      const phone = internationalPhone(payload.telephone);
      // Omit an ambiguous phone rather than rejecting the contact or overwriting its phone fields.
      if (phone) for (const name of PHONE_ATTRIBUTES) attributes[name] = phone;
      continue;
    }
    attributes[attribute] = field === 'date_test' ? payload.date_test.slice(0, 10) : payload[field];
  }
  const contact = { email: payload.email, attributes, updateEnabled: true };
  if (env.BREVO_LIST_ID !== undefined && env.BREVO_LIST_ID !== '') {
    const raw = String(env.BREVO_LIST_ID);
    const id = Number(raw);
    if (!/^\d+$/.test(raw) || !Number.isSafeInteger(id) || id <= 0) throw new Error('Invalid list configuration');
    contact.listIds = [id];
  }
  return contact;
}

async function recordSync(db, id, result) {
  if (!db) return;
  try {
    await db.prepare(`CREATE TABLE IF NOT EXISTS brevo_sync (
      participation_id TEXT PRIMARY KEY,
      status TEXT NOT NULL,
      http_status INTEGER,
      updated_at TEXT NOT NULL
    )`).run();
    await db.prepare(`INSERT INTO brevo_sync (participation_id, status, http_status, updated_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(participation_id) DO UPDATE SET
        status = excluded.status, http_status = excluded.http_status, updated_at = excluded.updated_at`)
      .bind(id, result.status, result.httpStatus ?? null, new Date().toISOString()).run();
  } catch {
    console.error('Unable to record Brevo sync status in D1');
  }
}

export async function syncBrevoContact(env, payload, db) {
  let result;
  if (!env.BREVO_API_KEY) {
    result = { status: 'not_configured' };
  } else {
    let contact;
    try {
      contact = brevoContact(payload, env);
    } catch {
      result = { status: 'configuration_error' };
      console.error('Invalid Brevo configuration');
    }
    if (contact) {
      await recordSync(db, payload.participation_id, { status: 'pending' });
      try {
        const response = await fetch(CONTACTS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'api-key': env.BREVO_API_KEY },
          body: JSON.stringify(contact),
          signal: AbortSignal.timeout(8000),
        });
        result = { status: response.ok ? 'accepted' : 'failed', httpStatus: response.status };
        if (!response.ok) console.error(`Brevo contact sync returned ${response.status}`);
      } catch {
        result = { status: 'failed' };
        // Responses and exceptions can contain personal data or credentials.
        console.error('Unable to reach Brevo contacts API');
      }
    }
  }
  await recordSync(db, payload.participation_id, result);
  return result;
}
