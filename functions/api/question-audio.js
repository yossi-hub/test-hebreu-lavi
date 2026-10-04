import { audioDevEnabled } from '../../lib/audio-dev.js';
import { audioFileResponse } from '../../lib/question-audio.js';
import { published } from './question-set.js';

export async function onRequestGet({ request, env }) {
  if (!audioDevEnabled(request, env)) return new Response('Introuvable.', { status: 404 });
  try {
    const url = new URL(request.url);
    const row = await published(env);
    const version = url.searchParams.get('version');
    const id = url.searchParams.get('questionId');
    if (!row || row.version !== version) return new Response('Recharge le test pour écouter cette version.', { status: 409 });
    const snapshot = JSON.parse(row.snapshot);
    const question = [...snapshot.questions, ...(snapshot.devAudioQuestions || [])].find(q => q.id === id && q.type === 'audio_response');
    if (!question || !question.media?.url?.startsWith('/api/question-audio?')) return new Response('Introuvable.', { status: 404 });
    const result = await env.QUIZ_DB.prepare('SELECT mime, content FROM quiz_question_audio WHERE version = ? AND question_id = ? ORDER BY chunk_index')
      .bind(version, id).all();
    return audioFileResponse(result.results, request.headers.get('Range'));
  } catch {
    return new Response('Fichier audio indisponible.', { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
