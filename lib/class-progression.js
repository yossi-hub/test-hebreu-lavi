// A position is a chapter/session label, never a decimal number: 4.10 is session 10.
export const CHAPTER_SESSIONS = Object.freeze([7, 5, 7, 13, 7, 14, 10, 18, 10]);

export function chapterStartIndex(chapter) {
  if (!Number.isInteger(chapter) || chapter < 1 || chapter > CHAPTER_SESSIONS.length + 1) return null;
  return CHAPTER_SESSIONS.slice(0, chapter - 1).reduce((sum, count) => sum + count, 0);
}

export function parseChapterSession(value) {
  // Airtable stores this as text. Preserve all digits after the separator.
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const match = String(value).trim().match(/^(\d{1,2})(?:[.,](\d{1,2}))?$/);
  if (!match) return null;
  const chapter = Number(match[1]);
  const session = Number(match[2] || 0);
  if (chapter < 1 || chapter > CHAPTER_SESSIONS.length || session > CHAPTER_SESSIONS[chapter - 1]) return null;
  return { chapter, session, label: `${chapter}.${session}` };
}

export function nextClassSession(value) {
  const current = parseChapterSession(value);
  if (!current) return null;
  const index = chapterStartIndex(current.chapter) + current.session;
  const next = current.session === CHAPTER_SESSIONS[current.chapter - 1]
    ? { chapter: current.chapter + 1, session: 1 }
    : { chapter: current.chapter, session: current.session + 1 };
  return { ...next, label: `${next.chapter}.${next.session}`, index };
}

export function sessionDistance(value, targetChapter) {
  const targetIndex = chapterStartIndex(targetChapter);
  const next = nextClassSession(value);
  if (targetIndex == null || !next) return null;
  return {
    prochaine_seance: next.label,
    ecart_seances: next.index - targetIndex,
    distance_seances: Math.abs(next.index - targetIndex),
  };
}
