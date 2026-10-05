import { publicAudioQuestion } from './audio-dev.js';

export const QUESTION_LAB_TABLE = 'CREATE TABLE IF NOT EXISTS quiz_question_lab (id INTEGER PRIMARY KEY CHECK (id = 1), snapshot TEXT NOT NULL, version TEXT NOT NULL, expires_at INTEGER NOT NULL)';
export const LAB_DURATION_MS = 30 * 60 * 1000;

export async function labQuestionSet(env) {
  if (!env.QUIZ_DB) return null;
  try {
    const row = await env.QUIZ_DB.prepare('SELECT snapshot, version, expires_at FROM quiz_question_lab WHERE id = 1').first();
    return row && row.expires_at > Date.now() ? row : null;
  } catch (error) {
    if (/no such table/i.test(String(error))) return null;
    throw error;
  }
}

export function publicLab(row) {
  const snapshot = JSON.parse(row.snapshot);
  return { ok: true, version: row.version, expiresAt: row.expires_at,
    questions: snapshot.questions.map(publicAudioQuestion), draftQuestions: snapshot.draftQuestions };
}
