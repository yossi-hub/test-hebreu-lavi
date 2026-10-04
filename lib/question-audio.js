// Copie des fichiers de QUESTION lors de la publication. Les réponses vocales
// des élèves ne passent jamais par ce stockage.
export const MAX_QUESTION_AUDIO_BYTES = 5 * 1024 * 1024;
const MAX_PUBLICATION_AUDIO_BYTES = 20 * 1024 * 1024;
const CHUNK_BYTES = 512 * 1024;
const mimeByExtension = { wav: 'audio/wav', mp3: 'audio/mpeg', m4a: 'audio/mp4' };

export function validateQuestionAttachment(attachment) {
  let url;
  try { url = new URL(attachment.url); } catch { throw new Error('URL du fichier Airtable invalide.'); }
  const extension = String(attachment.filename || '').split('.').pop().toLowerCase();
  if (url.protocol !== 'https:' || !url.hostname.endsWith('.airtableusercontent.com') || url.username || url.password) {
    throw new Error('Le fichier doit être une pièce jointe Airtable.');
  }
  if (!mimeByExtension[extension]) throw new Error('Fichier question : MP3, M4A ou WAV requis.');
  if (!Number.isInteger(attachment.size) || attachment.size <= 0 || attachment.size > MAX_QUESTION_AUDIO_BYTES) {
    throw new Error('Le fichier question doit faire au maximum 5 Mo.');
  }
  return mimeByExtension[extension];
}

function validSignature(bytes, mime) {
  const tag = (start, end) => String.fromCharCode(...bytes.slice(start, end));
  if (mime === 'audio/wav') return bytes.length >= 44 && tag(0, 4) === 'RIFF' && tag(8, 12) === 'WAVE';
  if (mime === 'audio/mp4') return bytes.length >= 12 && tag(4, 8) === 'ftyp';
  return bytes.length >= 4 && (tag(0, 3) === 'ID3' || bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0);
}

async function downloadQuestionAudio(attachment) {
  const mime = validateQuestionAttachment(attachment);
  const response = await fetch(attachment.url, { redirect: 'error', signal: AbortSignal.timeout(20000) });
  if (!response.ok || !response.body) throw new Error('Téléchargement du fichier audio impossible.');
  if (Number(response.headers.get('Content-Length')) > MAX_QUESTION_AUDIO_BYTES) throw new Error('Fichier audio trop volumineux.');
  const reader = response.body.getReader();
  const chunks = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_QUESTION_AUDIO_BYTES) { await reader.cancel(); throw new Error('Fichier audio trop volumineux.'); }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  if (!validSignature(bytes, mime)) throw new Error('Le contenu du fichier ne correspond pas à un audio MP3, M4A ou WAV.');
  return { bytes, mime };
}

export async function prepareQuestionAudio(snapshot, env, version, publishedAt) {
  const questions = [...snapshot.questions, ...(snapshot.devAudioQuestions || [])];
  const attachments = questions.filter(q => q.type === 'audio_response' && q.audioAttachment);
  const total = attachments.reduce((size, q) => size + q.audioAttachment.size, 0);
  if (total > MAX_PUBLICATION_AUDIO_BYTES) throw new Error('Les fichiers audio dépassent 20 Mo pour une publication.');
  if (!attachments.length) return [];
  const statements = [];
  let downloadedBytes = 0;
  for (const question of attachments) {
    const { bytes, mime } = await downloadQuestionAudio(question.audioAttachment);
    downloadedBytes += bytes.byteLength;
    if (downloadedBytes > MAX_PUBLICATION_AUDIO_BYTES) throw new Error('Les fichiers audio dépassent 20 Mo pour une publication.');
    for (let offset = 0; offset < bytes.length; offset += CHUNK_BYTES) {
      statements.push(env.QUIZ_DB.prepare('INSERT INTO quiz_question_audio (version, question_id, chunk_index, mime, content, published_at) VALUES (?, ?, ?, ?, ?, ?)')
        .bind(version, question.id, offset / CHUNK_BYTES, mime, bytes.slice(offset, offset + CHUNK_BYTES).buffer, publishedAt));
    }
    question.media = { type: 'audio', url: `/api/question-audio?questionId=${encodeURIComponent(question.id)}&version=${encodeURIComponent(version)}` };
    delete question.audioAttachment;
  }
  return statements;
}

export const QUESTION_AUDIO_TABLE = 'CREATE TABLE IF NOT EXISTS quiz_question_audio (version TEXT NOT NULL, question_id TEXT NOT NULL, chunk_index INTEGER NOT NULL, mime TEXT NOT NULL, content BLOB NOT NULL, published_at TEXT NOT NULL, PRIMARY KEY (version, question_id, chunk_index))';

export function audioFileResponse(rows, range) {
  if (!rows.length) return new Response('Fichier audio introuvable.', { status: 404 });
  const chunks = rows.map(row => new Uint8Array(row.content));
  const size = chunks.reduce((total, chunk) => total + chunk.byteLength, 0);
  if (!size || size > MAX_QUESTION_AUDIO_BYTES) return new Response('Fichier audio indisponible.', { status: 503 });
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  const headers = { 'Content-Type': rows[0].mime, 'Accept-Ranges': 'bytes', 'Cache-Control': 'public, max-age=86400', 'X-Content-Type-Options': 'nosniff' };
  if (!range) return new Response(bytes, { headers: { ...headers, 'Content-Length': String(size) } });
  const match = /^bytes=(\d*)-(\d*)$/.exec(range);
  const start = match?.[1] ? Number(match[1]) : Math.max(0, size - Number(match?.[2]));
  const end = match?.[1] && match?.[2] ? Math.min(size - 1, Number(match[2])) : size - 1;
  if (!match || !match[1] && (!match[2] || Number(match[2]) === 0) || !Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= size) {
    return new Response(null, { status: 416, headers: { ...headers, 'Content-Range': `bytes */${size}` } });
  }
  return new Response(bytes.slice(start, end + 1), { status: 206, headers: { ...headers, 'Content-Length': String(end - start + 1), 'Content-Range': `bytes ${start}-${end}/${size}` } });
}
