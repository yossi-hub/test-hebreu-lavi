const adminToken = document.getElementById('admin-token');
const status = document.getElementById('admin-status');
const errors = document.getElementById('admin-errors');
const check = document.getElementById('check-draft');
const preview = document.getElementById('open-preview');
const publish = document.getElementById('publish-draft');
const publishedLink = document.getElementById('open-published');
let busy = false;
let configurationReady = true;
adminToken.value = sessionStorage.getItem('quizAdminToken') || '';

function updateButtons() {
  check.disabled = busy || !configurationReady || adminToken.value.trim().length < 24;
  publish.disabled = check.disabled;
}
adminToken.addEventListener('input', () => { preview.hidden = true; publishedLink.hidden = true; updateButtons(); });
updateButtons();
fetch('/api/question-set?configuration=1').then(async response => {
  if (!response.ok) return;
  const data = await response.json();
  configurationReady = data.ready !== false;
  if (!configurationReady) status.textContent = `${data.missing.join(', ')} ${data.missing.length > 1 ? 'restent' : 'reste'} à configurer sur cet environnement. Les champs Airtable sont prêts.`;
  updateButtons();
}).catch(() => { status.textContent = 'Connexion au serveur indisponible. Recharge cette page.'; });

function counts(summary) {
  return `${summary.testQuestions} questions du test, ${summary.profileQuestions} de profil et ${summary.audioQuestions || 0} questions audio DEV`;
}

function showErrors(items) {
  errors.replaceChildren();
  for (const message of items) {
    const item = document.createElement('li');
    item.textContent = message;
    errors.append(item);
  }
}

async function requestQuestions(method, suffix = '') {
  const response = await fetch(`/api/question-set${suffix}`, {
    method,
    headers: { Authorization: `Bearer ${adminToken.value.trim()}`, Accept: 'application/json' },
  });
  const data = await response.json();
  if (!response.ok) {
    const error = new Error(data.error || 'Le brouillon contient des erreurs.');
    error.details = data.errors || [];
    throw error;
  }
  return data;
}

check.addEventListener('click', async () => {
  if (busy) return;
  busy = true; updateButtons();
  preview.hidden = true;
  showErrors([]);
  status.textContent = 'Vérification des questions Airtable…';
  try {
    const data = await requestQuestions('GET', '?preview=1');
    sessionStorage.setItem('quizAdminToken', adminToken.value.trim());
    status.textContent = `${counts(data.summary)} prêtes à tester.${data.summary.audioDrafts ? ` ${data.summary.audioDrafts} brouillon(s) audio non inclus.` : ''}`;
    preview.hidden = false;
  } catch (error) {
    status.textContent = error.message;
    showErrors(error.details || []);
  } finally {
    busy = false; updateButtons();
  }
});

publish.addEventListener('click', async () => {
  if (busy) return;
  busy = true; updateButtons(); publishedLink.hidden = true;
  showErrors([]);
  status.textContent = 'Vérification Airtable et copie des fichiers audio…';
  try {
    const data = await requestQuestions('POST');
    sessionStorage.setItem('quizAdminToken', adminToken.value.trim());
    status.textContent = `Application DEV mise à jour : ${counts(data.summary)}, le ${new Date(data.publishedAt).toLocaleString('fr-FR')}.${data.summary.audioDrafts ? ` ${data.summary.audioDrafts} brouillon(s) audio non inclus.` : ''} Recharge l’application pour utiliser cette version.`;
    publishedLink.hidden = false;
  } catch (error) {
    status.textContent = error.message;
    showErrors(error.details || []);
  } finally {
    busy = false; updateButtons();
  }
});
