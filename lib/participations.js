export const PARTICIPATIONS_SCHEMA = `CREATE TABLE IF NOT EXISTS test_participations (
  id TEXT PRIMARY KEY,
  date_test TEXT NOT NULL,
  prenom TEXT NOT NULL,
  nom TEXT NOT NULL,
  email TEXT NOT NULL,
  telephone TEXT NOT NULL,
  niveau_lavi REAL NOT NULL,
  score REAL NOT NULL,
  points_possibles REAL NOT NULL,
  questions_evaluees REAL NOT NULL,
  raison_fin TEXT NOT NULL,
  source TEXT NOT NULL,
  country TEXT,
  country_code TEXT,
  region TEXT,
  city TEXT,
  postal_code TEXT,
  timezone TEXT,
  webhook_status TEXT NOT NULL DEFAULT 'pending'
)`;

export async function saveParticipation(db, payload) {
  if (!db) return false; // No Cloudflare binding in a plain local server.
  try {
    await db.prepare(PARTICIPATIONS_SCHEMA).run();
    const { location } = payload;
    await db.prepare(`INSERT INTO test_participations (
      id, date_test, prenom, nom, email, telephone, niveau_lavi, score,
      points_possibles, questions_evaluees, raison_fin, source,
      country, country_code, region, city, postal_code, timezone
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(payload.participation_id, payload.date_test, payload.prenom, payload.nom,
        payload.email, payload.telephone, payload.niveau_lavi, payload.score,
        payload.points_possibles, payload.questions_evaluees, payload.raison_fin, payload.source,
        location.country, location.countryCode, location.region, location.city,
        location.postalCode, location.timezone).run();
    return true;
  } catch {
    // Do not log participant data, request headers or Cloudflare's full metadata.
    console.error('Unable to store test participation in D1');
    return false;
  }
}

export async function markNotification(db, id, status) {
  try {
    await db.prepare('UPDATE test_participations SET webhook_status = ? WHERE id = ?')
      .bind(status, id).run();
  } catch {
    console.error('Unable to update participation notification status');
  }
}
