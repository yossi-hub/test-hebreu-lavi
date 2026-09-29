import { internalLocationHtml, locationFromRequest } from '../../lib/location.js';
import { markNotification, saveParticipation } from '../../lib/participations.js';

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  },
});

const clean = (value, maxLength = 200) => String(value ?? '').trim().slice(0, maxLength);

export async function onRequestPost({ request, env }) {
  let input;
  try {
    input = await request.json();
  } catch {
    return json({ ok: false, error: 'Corps JSON invalide' }, 400);
  }
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return json({ ok: false, error: 'Corps JSON invalide' }, 400);
  }

  const payload = {
    prenom: clean(input.prenom, 80),
    nom: clean(input.nom, 80),
    email: clean(input.email, 160).toLowerCase(),
    telephone: clean(input.telephone, 40),
    niveau_lavi: Number(input.niveau_lavi),
    score: Number(input.score),
    points_possibles: Number(input.points_possibles),
    questions_evaluees: Number(input.questions_evaluees),
    raison_fin: clean(input.raison_fin, 40),
    date_test: new Date().toISOString(),
    source: 'Test Hébreu Lavi',
  };

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email);
  const validNumbers = [payload.niveau_lavi, payload.score, payload.points_possibles, payload.questions_evaluees]
    .every(Number.isFinite);
  if (!payload.prenom || !payload.nom || !validEmail || !payload.telephone || !validNumbers) {
    return json({ ok: false, error: 'Données manquantes ou invalides' }, 400);
  }

  payload.participation_id = crypto.randomUUID();
  payload.location = locationFromRequest(request);
  // This additional field is mapped only in Make's internal notification.
  payload.internal_location_html = internalLocationHtml(payload.location);
  const saved = await saveParticipation(env.QUIZ_DB, payload);
  const mark = status => saved ? markNotification(env.QUIZ_DB, payload.participation_id, status) : Promise.resolve();

  if (!env.MAKE_WEBHOOK_URL) {
    console.error('MAKE_WEBHOOK_URL is not configured');
    await mark('failed');
    return json({ ok: false, error: 'Configuration incomplète' }, 503);
  }

  try {
    const response = await fetch(env.MAKE_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      console.error(`Make webhook returned ${response.status}`);
      await mark('failed');
      return json({ ok: false, error: 'Transmission refusée' }, 502);
    }
    await mark('accepted');
    return json({ ok: true });
  } catch (error) {
    console.error('Unable to reach Make webhook');
    await mark('failed');
    return json({ ok: false, error: 'Service indisponible' }, 502);
  }
}

export function onRequestGet() {
  return json({ ok: false, error: 'Méthode non autorisée' }, 405);
}
