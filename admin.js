const status = document.getElementById('admin-status');
const errors = document.getElementById('admin-errors');
const publish = document.getElementById('publish-draft');
const publishedLink = document.getElementById('open-published');
let busy = false;
let configurationReady = false;

function updateButtons() {
  publish.disabled = busy || !configurationReady;
}
updateButtons();
fetch('/api/question-sync').then(async response => {
  const data = await response.json();
  configurationReady = response.ok && data.ready === true;
  if (!configurationReady) status.textContent = data.error || `${data.missing.join(', ')} ${data.missing.length > 1 ? 'restent' : 'reste'} à configurer sur cet environnement.`;
  else status.textContent = 'Les changements sont repris depuis Airtable quand tu cliques sur Actualiser.';
  updateButtons();
}).catch(() => { status.textContent = 'Connexion au serveur indisponible. Recharge cette page.'; });

function counts(summary) {
  const audio = (summary.audioQuestions || 0) + (summary.testAudioQuestions || 0);
  const placement = summary.textMiniTests?.map(test => `Mini-test du niveau ${test.level} : ${test.total} questions, seuil ${test.minCorrect}/${test.total}. Niveau conseillé jusqu’à ${summary.placementMaxLevel}.`).join(" ") || "";
  return `${summary.testQuestions} questions du test, ${summary.profileQuestions} de profil et ${audio} question${audio > 1 ? 's' : ''} audio${placement ? '. ' + placement : ''}`;
}

function showErrors(items) {
  errors.replaceChildren();
  for (const message of items) {
    const item = document.createElement('li');
    item.textContent = message;
    errors.append(item);
  }
}

publish.addEventListener('click', async () => {
  if (busy || !configurationReady) return;
  busy = true; updateButtons(); publishedLink.hidden = true;
  showErrors([]);
  status.textContent = 'Vérification Airtable et mise à jour des questions…';
  try {
    const response = await fetch('/api/question-sync', { method: 'POST', headers: { Accept: 'application/json' } });
    const data = await response.json();
    if (!response.ok) {
      showErrors(data.errors || []);
      throw new Error(data.error || 'Actualisation impossible. Réessaie.');
    }
    status.textContent = data.updated
      ? `Application mise à jour : ${counts(data.summary)}, le ${new Date(data.publishedAt).toLocaleString('fr-FR')}. Recharge l’application pour utiliser cette version.`
      : `L’application est déjà à jour : ${counts(data.summary)}.`;
    if (data.summary.audioDrafts) status.textContent += ` ${data.summary.audioDrafts} brouillon(s) audio non inclus.`;
    publishedLink.hidden = false;
  } catch (error) {
    status.textContent = error.message;
  } finally {
    busy = false; updateButtons();
  }
});
