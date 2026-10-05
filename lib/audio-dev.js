import { deploymentBranch } from './deployment-context.js';

// La branche est injectée au build : CF_PAGES_BRANCH peut être absent du runtime.
// Activation explicite par environnement et contrôle de la branche/hôte. Un paramètre d’URL ne suffit pas.
export function audioDevEnabled(request, env) {
  if (env.QUIZ_AUDIO_ENABLED !== 'true') return false;
  const host = new URL(request.url).hostname;
  if (['localhost', '127.0.0.1', '[::1]'].includes(host)) return env.APP_ENV === 'development';
  const branch = String(env.CF_PAGES_BRANCH || deploymentBranch).toLowerCase();
  if (host === 'dev.test-hebreu-lavi.pages.dev') return branch === 'dev';
  return env.QUIZ_PRODUCTION_FEATURES_ENABLED === 'true' && branch === 'main'
    && ['test.oulpanlavi.com', 'test-hebreu-lavi.pages.dev'].includes(host);
}

export function publicAudioQuestion(question) {
  const { evaluationCriteria, acceptedExamples, audioAttachment, ...publicQuestion } = question;
  return publicQuestion;
}

export const audioDemo = {
  id: 'dev-audio-demo', type: 'audio_response',
  texte: 'מה עשית אתמול בערב?', langue: 'he', niveau: 1, points: 1,
  obligatoire: true, choix: [], bonneReponse: null,
  instruction: 'Écoute la question, puis réponds en hébreu avec une information cohérente. Tu peux réécouter et recommencer avant de valider.',
  media: { type: 'audio', url: '/audio/question-demo.wav' },
  evaluationCriteria: 'L’élève doit répondre en hébreu à une question simple en donnant une information cohérente correspondant à la question. Ici, il décrit au moins une activité réalisée hier soir, avec une forme au passé compréhensible.',
  acceptedExamples: ['הלכתי למסעדה', 'ראיתי סרט', 'אכלתי עם חברים', 'נשארתי בבית', 'עבדתי עד מאוחר'],
};
