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
  jeu_concours_hanouka INTEGER NOT NULL DEFAULT 0,
  webhook_status TEXT NOT NULL DEFAULT 'pending'
)`;

async function ensureContestColumn(db) {
  const hasColumn = async () => {
    const { results } = await db.prepare('PRAGMA table_info(test_participations)').all();
    return results.some(column => column.name === 'jeu_concours_hanouka');
  };
  if (await hasColumn()) return;
  try {
    await db.prepare('ALTER TABLE test_participations ADD COLUMN jeu_concours_hanouka INTEGER NOT NULL DEFAULT 0').run();
  } catch (error) {
    // Une requête simultanée peut avoir déjà ajouté la colonne.
    if (!await hasColumn()) throw error;
  }
}

export async function saveParticipation(db, payload) {
  if (!db) return false; // No Cloudflare binding in a plain local server.
  try {
    await db.prepare(PARTICIPATIONS_SCHEMA).run();
    await ensureContestColumn(db);
    const { location } = payload;
    await db.prepare(`INSERT INTO test_participations (
      id, date_test, prenom, nom, email, telephone, niveau_lavi, score,
      points_possibles, questions_evaluees, raison_fin, source,
      country, country_code, region, city, postal_code, timezone, jeu_concours_hanouka
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(payload.participation_id, payload.date_test, payload.prenom, payload.nom,
        payload.email, payload.telephone, payload.niveau_lavi, payload.score,
        payload.points_possibles, payload.questions_evaluees, payload.raison_fin, payload.source,
        location.country, location.countryCode, location.region, location.city,
        location.postalCode, location.timezone, payload.jeu_concours_hanouka === true ? 1 : 0).run();
    if (payload.format_cours) {
      await db.prepare("CREATE TABLE IF NOT EXISTS test_contact_preferences (participation_id TEXT PRIMARY KEY, format_cours TEXT NOT NULL CHECK (format_cours IN ('presentiel', 'distanciel')))").run();
      await db.prepare('INSERT INTO test_contact_preferences (participation_id, format_cours) VALUES (?, ?)')
        .bind(payload.participation_id, payload.format_cours).run();
    }
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
