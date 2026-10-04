import { audioDevEnabled } from './audio-dev.js';

// Ce chemin ne reçoit aucun contenu éditorial : seule la table Airtable
// configurée côté serveur fournit les questions à synchroniser.
export function questionSyncEnabled(request, env) {
  return audioDevEnabled(request, env) && env.QUIZ_PUBLISH_ENABLED === 'true';
}

export const QUESTION_SYNC_TABLE = 'CREATE TABLE IF NOT EXISTS quiz_dev_sync (id INTEGER PRIMARY KEY CHECK (id = 1), lock_until INTEGER NOT NULL DEFAULT 0, source_hash TEXT NOT NULL DEFAULT \'\', version TEXT NOT NULL DEFAULT \'\')';
export const SYNC_LEASE_MS = 120000;
export const SYNC_COOLDOWN_MS = 10000;

export async function questionSetFingerprint(snapshot) {
  const stable = structuredClone(snapshot);
  for (const question of [...stable.questions, ...(stable.devAudioQuestions || [])]) {
    if (!question.audioAttachment) continue;
    const { id, filename, size } = question.audioAttachment;
    question.audioAttachment = { id, filename, size };
    // Les URL signées Airtable changent sans modification du fichier.
    delete question.media;
  }
  const canonical = value => Array.isArray(value) ? value.map(canonical)
    : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])])) : value;
  const bytes = new TextEncoder().encode(JSON.stringify(canonical(stable)));
  const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
  return Array.from(hash, byte => byte.toString(16).padStart(2, '0')).join('');
}
