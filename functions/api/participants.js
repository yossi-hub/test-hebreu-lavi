import { syncAirtableParticipant } from '../../lib/airtable-participants.js';
import { internationalPhone } from '../../lib/brevo.js';

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
});

// Intake capture only: no result email or Brevo contact before the test finishes.
export async function onRequestPost({ request, env }) {
  let input;
  try { input = await request.json(); } catch { return json({ ok: false }, 400); }
  if (!input || typeof input !== 'object' || Array.isArray(input)) return json({ ok: false }, 400);
  const clean = (value, limit) => typeof value === 'string' ? value.trim().slice(0, limit) : '';
  const payload = {
    prenom: clean(input.prenom, 80), nom: clean(input.nom, 80), email: clean(input.email, 160).toLowerCase(),
    jeu_concours_hanouka: input.jeu_concours_hanouka === true,
    date_test: new Date().toISOString(), participation_id: crypto.randomUUID(),
  };
  if (!payload.prenom || !payload.nom || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)
    || !internationalPhone(input.telephone)) return json({ ok: false }, 400);
  const result = await syncAirtableParticipant(env, payload, env.QUIZ_DB, { started: true });
  return json({ ok: result.status === 'accepted' || result.status === 'disabled' }, result.status === 'failed' ? 502 : 200);
}

export function onRequestGet() { return json({ ok: false }, 405); }
