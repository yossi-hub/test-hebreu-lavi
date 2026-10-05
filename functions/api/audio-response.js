import { audioDevEnabled, audioDemo, publicAudioQuestion } from '../../lib/audio-dev.js';
import { analyzeAudio, MAX_AUDIO_BYTES, saveAudioAttempt, uncertain } from '../../lib/audio-response.js';
import { authorized, draft, published } from './question-set.js';
import { labQuestionSet } from '../../lib/question-lab.js';

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
});
const debugAllowed = (request, env) => authorized(request, env)
  || env.QUIZ_AUDIO_LOCAL_DEBUG === 'true' && ['localhost', '127.0.0.1', '[::1]'].includes(new URL(request.url).hostname);

export async function onRequestGet({ request, env }) {
  if (!audioDevEnabled(request, env)) return json({ enabled: false }, 404);
  return json({ enabled: true, debug: debugAllowed(request, env), demo: publicAudioQuestion(audioDemo) });
}

async function questionFor(context, form) {
  const id = form.get('questionId');
  if (id === audioDemo.id) return audioDemo;
  const preview = new URL(context.request.url).searchParams.get('preview') === '1';
  let snapshot;
  if (form.get('lab') === '1') {
    const row = await labQuestionSet(context.env);
    if (!row || row.version !== form.get('version')) throw new Error('Questions de test modifiées ou expirées. Recharge l’espace de test.');
    const data = JSON.parse(row.snapshot);
    snapshot = { questions: data.questions };
  } else if (preview) {
    if (!authorized(context.request, context.env)) throw new Error('Aperçu non autorisé.');
    const result = await draft(context);
    if (result.errors.length) throw new Error('Brouillon invalide.');
    snapshot = result.snapshot;
  } else {
    const row = await published(context.env);
    if (!row || row.version !== form.get('version')) throw new Error('Version des questions modifiée. Recharge le test.');
    snapshot = JSON.parse(row.snapshot);
  }
  const question = [...snapshot.questions, ...(snapshot.devAudioQuestions || [])].find(q => q.id === id && q.type === 'audio_response');
  if (!question || typeof question.evaluationCriteria !== 'string' || !question.evaluationCriteria.trim()) throw new Error('Question audio introuvable.');
  return question;
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!audioDevEnabled(request, env)) return json({ enabled: false }, 404);
  const origin = request.headers.get('Origin');
  if (origin && origin !== new URL(request.url).origin) return json({ status: 'uncertain', confidence: 0 }, 403);
  let question, result;
  try {
    if (!request.headers.get('Content-Type')?.startsWith('multipart/form-data')) throw new Error('Formulaire audio requis.');
    const size = Number(request.headers.get('Content-Length'));
    if (size > MAX_AUDIO_BYTES + 16384) throw new Error('Requête trop volumineuse.');
    // Limite également les corps sans Content-Length avant de les parser.
    const reader = request.body?.getReader();
    if (!reader) throw new Error('Audio vide.');
    const chunks = [];
    let bytes = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_AUDIO_BYTES + 16384) { await reader.cancel(); throw new Error('Requête trop volumineuse.'); }
      chunks.push(value);
    }
    const form = await new Response(new Blob(chunks), { headers: { 'Content-Type': request.headers.get('Content-Type') } }).formData();
    question = await questionFor(context, form);
    const audio = form.get('audio');
    if (!audio || typeof audio.arrayBuffer !== 'function' || audio.type !== 'audio/wav' || audio.size > MAX_AUDIO_BYTES) throw new Error('Fichier WAV requis.');
    result = await analyzeAudio(env, question, audio);
  } catch { result = { ...uncertain('Fichier, question ou version invalide. Recharge le test si nécessaire.'), transcription: '' }; }
  const attempt = {
    id: crypto.randomUUID(), questionId: question?.id || '', question: question?.texte || '',
    ...result, answeredAt: new Date().toISOString(),
  };
  const stored = question ? await saveAudioAttempt(env, attempt) : false;
  // Le navigateur de l’élève reçoit uniquement le verdict ; le texte transcrit
  // et la raison sont réservés à l’administration DEV.
  return json({ status: result.status, confidence: result.confidence,
    ...(debugAllowed(request, env) ? { debug: { ...attempt, stored } } : {}) });
}
