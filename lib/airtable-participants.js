const BASE_ID = 'appNbwmEyVQsXA25U';
const TABLE_ID = 'tbl2K2rz483T9kP6X';
export const PARTICIPANT_FIELDS = {
  name: 'fldeHGh6cMlasdzNV', email: 'fldboihCUNCDVAezp', date: 'fldCYyviOGOlTtHvk',
  status: 'fldcyDW1A2hvG4Upa', score: 'fldNYHobfZIXHwWwO', level: 'fldxcPfKIi8ElX2a7',
  contest: 'fldedVpop9MZR0XL0', mistakes: 'fldzHr4TbwOiGLtQd', details: 'fldQ2bbMbsONrP0aX',
};
const clean = (value, limit) => typeof value === 'string' ? value.trim().slice(0, limit) : '';

export function normalizeMistakes(value) {
  if (value == null) return null; // An older browser does not know the errors: keep them unknown.
  if (!Array.isArray(value) || value.length > 150) throw new Error('Invalid mistakes');
  return value.map(item => {
    if (!item || typeof item !== 'object' || Array.isArray(item)
      || typeof item.question !== 'string' || typeof item.answer !== 'string' || typeof item.expected !== 'string') {
      throw new Error('Invalid mistake');
    }
    return {
      question_id: clean(item.question_id, 100), question: clean(item.question, 4000),
      answer: clean(item.answer, 2000), expected: clean(item.expected, 2000), skipped: item.skipped === true,
    };
  });
}

export function participantFields(payload, started = false) {
  const f = PARTICIPANT_FIELDS;
  const fields = {
    [f.name]: `${payload.prenom} ${payload.nom}`.trim(), [f.email]: payload.email,
    [f.date]: payload.date_test.slice(0, 10), [f.status]: started ? 'Commencé' : 'Terminé',
    [f.contest]: payload.jeu_concours_hanouka === true,
  };
  if (!started) {
    fields[f.score] = payload.score;
    fields[f.level] = String(payload.niveau_lavi);
    if (Array.isArray(payload.erreurs)) {
      fields[f.mistakes] = payload.erreurs.length;
      fields[f.details] = (payload.erreurs.length ? payload.erreurs.map((item, i) =>
        `${i + 1}. ${item.question}${item.question_id ? ` [${item.question_id}]` : ''}\nRéponse donnée : ${item.skipped ? 'Question passée' : item.answer}\nBonne réponse : ${item.expected}`
      ).join('\n\n') : 'Aucune faute.').slice(0, 95000);
    }
  }
  return fields;
}

async function recordSync(db, payload, fields, result) {
  if (!db) return;
  try {
    await db.prepare(`CREATE TABLE IF NOT EXISTS airtable_sync (
      participation_id TEXT PRIMARY KEY, email TEXT NOT NULL, fields_json TEXT NOT NULL,
      status TEXT NOT NULL, http_status INTEGER, record_id TEXT, updated_at TEXT NOT NULL
    )`).run();
    await db.prepare(`INSERT INTO airtable_sync
      (participation_id, email, fields_json, status, http_status, record_id, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(participation_id) DO UPDATE SET status = excluded.status,
        http_status = excluded.http_status, record_id = excluded.record_id, updated_at = excluded.updated_at`)
      .bind(payload.participation_id, payload.email, JSON.stringify(fields), result.status,
        result.httpStatus ?? null, result.recordId ?? null, new Date().toISOString()).run();
  } catch { console.error('Unable to record Airtable sync status in D1'); }
}

export async function syncAirtableParticipant(env, payload, db, { started = false } = {}) {
  if (env.AIRTABLE_PARTICIPANTS_ENABLED !== 'true') return { status: 'disabled' };
  const fields = participantFields(payload, started);
  let result;
  if (!env.AIRTABLE_TOKEN) result = { status: 'not_configured' };
  else {
    await recordSync(db, payload, fields, { status: 'pending' });
    try {
      const url = `https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`;
      const headers = { Authorization: `Bearer ${env.AIRTABLE_TOKEN}`, 'Content-Type': 'application/json' };
      // A restart must not erase a previous completed test or its mistakes.
      if (started) {
        const query = new URL(url);
        const email = payload.email.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        query.searchParams.set('filterByFormula', `{E-mail}='${email}'`);
        query.searchParams.set('maxRecords', '1');
        const existing = await fetch(query, { headers, signal: AbortSignal.timeout(8000) });
        if (!existing.ok) throw { httpStatus: existing.status };
        const data = await existing.json();
        if (data.records?.length) result = { status: 'accepted', httpStatus: existing.status, recordId: data.records[0].id };
      }
      if (!result) {
        const response = await fetch(url, {
          method: 'PATCH', headers, signal: AbortSignal.timeout(8000),
          body: JSON.stringify({ performUpsert: { fieldsToMergeOn: [PARTICIPANT_FIELDS.email] }, records: [{ fields }] }),
        });
        if (!response.ok) throw { httpStatus: response.status };
        const data = await response.json();
        if (!data.records?.[0]?.id) throw new Error('Missing record receipt');
        result = { status: 'accepted', httpStatus: response.status, recordId: data.records[0].id };
      }
    } catch (error) {
      result = { status: 'failed', ...(Number.isInteger(error?.httpStatus) ? { httpStatus: error.httpStatus } : {}) };
      // Never log the token, email, answers or API error body.
      console.error('Unable to sync Airtable participant', result.httpStatus || 'network');
    }
  }
  await recordSync(db, payload, fields, result);
  return result;
}
