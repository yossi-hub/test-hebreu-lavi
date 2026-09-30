const adminToken = document.getElementById('admin-token');
const status = document.getElementById('admin-status');
const errors = document.getElementById('admin-errors');
const check = document.getElementById('check-draft');
const preview = document.getElementById('open-preview');
const publish = document.getElementById('publish-draft');

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
  publish.disabled = true;
  preview.hidden = true;
  showErrors([]);
  status.textContent = 'Vérification des questions Airtable…';
  try {
    const data = await requestQuestions('GET', '?preview=1');
    sessionStorage.setItem('quizAdminToken', adminToken.value.trim());
    status.textContent = `${data.summary.testQuestions} questions du test et ${data.summary.profileQuestions} questions de profil prêtes à tester.`;
    preview.hidden = false;
    publish.disabled = false;
  } catch (error) {
    status.textContent = error.message;
    showErrors(error.details || []);
  }
});

publish.addEventListener('click', async () => {
  publish.disabled = true;
  showErrors([]);
  status.textContent = 'Publication de la version validée…';
  try {
    const data = await requestQuestions('POST');
    status.textContent = `Version publiée sur DEV : ${data.summary.testQuestions} questions du test, le ${new Date(data.publishedAt).toLocaleString('fr-FR')}.`;
  } catch (error) {
    status.textContent = error.message;
    showErrors(error.details || []);
  } finally {
    publish.disabled = false;
  }
});
