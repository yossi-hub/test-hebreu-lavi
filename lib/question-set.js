import { validateQuestionAttachment } from './question-audio.js';
import { validateQuestionCoherence } from '../engine.js';

const BASE_ID = 'appNbwmEyVQsXA25U';
const TABLE_ID = 'tblG7aWXPDkLCeNUz';

export const FIELDS = {
  id: 'fldhdR0ILko0G6270',
  text: 'fldILqWjr8qQoQdZj',
  type: 'fldF7a6A0qWLAfjh6',
  level: 'fldZfO03OV8pxqyHJ',
  points: 'fldZ4qu4OciclawIM',
  choices: 'fldjvDSpKVaBdbDWS',
  answer: 'fld9ASC4JCGFjoQjr',
  required: 'fldTzDMtssKZymYII',
  language: 'fldgpqZRoUCSdPN3Y',
  instruction: 'fld5v8rXTgWpv1FPK',
  mediaType: 'fld7N0ys6T1dBJCmy',
  mediaUrl: 'fldhS33iF5duPMYpn',
  blockId: 'fldJDaTkRngFPX7Gm',
  blockPosition: 'fldg0oy8w2jsWXKUw',
  globalPosition: 'fldmitvwI1CIFv2KF',
  editorialState: 'fldeVIheadHT7o8DI',
  multiple: 'fldJoj79UvP5E8vGs',
  random: 'fldLAvPqfRFbPeex9',
  yesNo: 'fldxcJYA4OA2UI6IW',
  conversational: 'fld2O6bD2r2l5tVYP',
  phase: 'fldJPChdGwNtqiGR2',
  profileInputType: 'fldSgzZjSqAWJDwF6',
  importedData: 'flddtBQsq1Abw3Q45',
  audioFile: 'fldUt7uohuKSxSPzc',
  audioPrompt: 'fld1YQmkzzvPO0I6R',
  audioExamples: 'fldHaqqleHf5aPkII',
  supportGroup: 'fld43YCo7pAFy0KBR',
  supportText: 'flduLdi5wY6UFgPSe',
};

const asText = value => String(value?.name ?? value ?? '').trim();
const asNumber = value => value == null || value === '' ? null : Number(value);
const field = (record, id) => record.fields?.[id];

function parseCell(value, fallback, label, errors) {
  if (value == null || value === '') return fallback;
  try { return JSON.parse(String(value)); }
  catch { errors.push(`${label} : JSON invalide.`); return fallback; }
}

export function parseBaseScript(source) {
  const start = source.indexOf('const questions = ');
  const middle = source.indexOf('\n\nconst parcours = ', start);
  if (start < 0 || middle < 0) throw new Error('Fichier de référence des questions introuvable.');
  const questions = JSON.parse(source.slice(start + 'const questions = '.length, middle).trim().replace(/;$/, ''));
  const parcours = JSON.parse(source.slice(middle + '\n\nconst parcours = '.length).trim().replace(/;$/, ''));
  return { questions, parcours };
}

function ruleQuestionIds(value, known, found) {
  if (!value || typeof value !== 'object') return;
  if (value.type === 'field' && known.has(value.value)) found.add(value.value);
  for (const child of Object.values(value)) ruleQuestionIds(child, known, found);
}

// Les groupes sont assemblés avant publication : le texte peut être saisi
// sur une seule ligne, et les questions restent ensemble malgré l’ordre global.
function prepareAudioGroups(rows, errors) {
  const units = [], groups = new Map();
  for (const row of rows) {
    const name = row.question.supportGroup;
    if (!name) { units.push([row]); continue; }
    if (!groups.has(name)) { const group = []; groups.set(name, group); units.push(group); }
    groups.get(name).push(row);
  }
  for (const [name, group] of groups) {
    const texts = [...new Set(group.map(row => row.question.supportText || '').filter(Boolean))];
    if (texts.length !== 1) errors.push(`Groupe ${name} : renseigner un seul texte commun dans « Texte support » (sur une ligne suffit).`);
    if (group.length < 3) errors.push(`Groupe ${name} : au moins 3 questions sont nécessaires.`);
    group.sort((a, b) => a.supportPosition - b.supportPosition);
    if (group.some((row, index) => row.supportPosition !== index + 1)) {
      errors.push(`Groupe ${name} : « Position dans le bloc » doit contenir 1, 2, 3, puis les positions suivantes sans doublon.`);
    }
    for (const row of group) row.question.supportText = texts[0] || '';
  }
  return units.flat().map(row => row.question);
}

export function compileQuestionSet(base, records, { requireReady = false, audioEnabled = false, includeAudioDrafts = false, labMode = false } = {}) {
  const errors = [];
  const adaptive = base.parcours.adaptive || null;
  const originalById = new Map(base.questions.map(question => [question.id, question]));
  const knownIds = new Set(originalById.keys());
  const ruleIds = new Set();
  if (!adaptive) ruleQuestionIds(base.parcours.regles, knownIds, ruleIds);
  const isExercise = record => asText(field(record, FIELDS.phase)) === 'Audio DEV'
    || audioEnabled && asText(field(record, FIELDS.phase)) === 'Test'
      && !originalById.has(asText(field(record, FIELDS.id))) && Boolean(asText(field(record, FIELDS.supportGroup)));
  const active = records.filter(record => {
    const state = asText(field(record, FIELDS.editorialState));
    const phase = asText(field(record, FIELDS.phase));
    if (isExercise(record)) return audioEnabled && state !== 'Archivée' && (state === 'Validée' || includeAudioDrafts || labMode);
    if (labMode) return false;
    return state !== 'Archivée' && (phase === 'Test' || phase === 'Profil'
      || audioEnabled && phase === 'Audio DEV' && (state === 'Validée' || includeAudioDrafts));
  });
  const usedIds = new Set();
  const blockIds = new Set(base.parcours.blocs.map(block => block.id));
  const blockById = new Map(base.parcours.blocs.map(block => [block.id, block]));
  const testRows = [];
  const profileRows = [];
  const audioRows = [];

  for (const record of active) {
    const cells = record.fields || {};
    const id = asText(cells[FIELDS.id]) || record.id;
    const phase = isExercise(record) ? 'Audio DEV' : asText(cells[FIELDS.phase]);
    if (!id || usedIds.has(id)) { errors.push(`Identifiant de question en double ou absent : ${id || 'vide'}.`); continue; }
    usedIds.add(id);
    if (requireReady && !['Importée', 'Validée'].includes(asText(cells[FIELDS.editorialState]))) {
      errors.push(`${id} : passe la question à « Validée » avant publication.`);
    }
    const texte = asText(cells[FIELDS.text]);
    const type = asText(cells[FIELDS.type]) || (phase === 'Audio DEV' ? 'audio_response' : '');
    const choix = parseCell(cells[FIELDS.choices], [], `${id}, choix`, errors);
    const bonneReponse = parseCell(cells[FIELDS.answer], null, `${id}, bonne réponse`, errors);
    const niveau = asNumber(cells[FIELDS.level]);
    const points = asNumber(cells[FIELDS.points]) ?? (phase === 'Audio DEV' ? 1 : 0);
    const langue = asText(cells[FIELDS.language]);
    const attachments = cells[FIELDS.audioFile] || [];
    const attachment = Array.isArray(attachments) && attachments.length === 1 ? attachments[0] : null;
    const mediaType = attachment && type === 'audio_response' ? 'audio' : asText(cells[FIELDS.mediaType]);
    const mediaUrl = attachment && type === 'audio_response' ? asText(attachment.url) : asText(cells[FIELDS.mediaUrl]);
    if (!texte) errors.push(`${id} : texte manquant.`);
    if (!['text', 'qcm', 'audio_response'].includes(type)) errors.push(`${id} : type invalide.`);
    if (type === 'audio_response' && !audioEnabled) errors.push(`${id} : les questions audio sont réservées à DEV.`);
    if (!Array.isArray(choix)) errors.push(`${id} : les choix doivent être une liste JSON.`);
    if (!Number.isInteger(points) || points < 0) errors.push(`${id} : points invalides.`);
    const maxLevel = phase === 'Audio DEV' ? 9 : 8;
    if (niveau != null && (!Number.isInteger(niveau) || niveau < 1 || niveau > maxLevel)) errors.push(`${id} : niveau invalide (entre 1 et ${maxLevel}).`);
    if (langue && !['fr', 'he'].includes(langue)) errors.push(`${id} : langue invalide.`);
    if (mediaType || mediaUrl) {
      const validAudioUrl = type === 'audio_response' && mediaType === 'audio'
        && (/^https:\/\//.test(mediaUrl) || /^\/audio\/[a-zA-Z0-9_./-]+$/.test(mediaUrl) && !mediaUrl.includes('..'));
      if (!validAudioUrl && (!['image', 'video'].includes(mediaType) || !/^https:\/\//.test(mediaUrl))) {
        errors.push(`${id} : média invalide (type et URL HTTPS requis).`);
      }
    }
    const q = {
      id, texte, type, choix, bonneReponse, points, niveau,
      obligatoire: Boolean(cells[FIELDS.required]),
      multiple: Boolean(cells[FIELDS.multiple]),
      aleatoire: Boolean(cells[FIELDS.random]),
    };
    const instruction = asText(cells[FIELDS.instruction]);
    if (langue) q.langue = langue;
    if (instruction) q.instruction = instruction;
    if (cells[FIELDS.yesNo]) q.reponseOuiNon = true;
    if (cells[FIELDS.conversational]) q.reponseConversationnelle = true;
    if (mediaType && mediaUrl) q.media = { type: mediaType, url: mediaUrl };
    // Un support commun peut enchaîner des réponses vocales et des QCM.
    const supportGroup = asText(cells[FIELDS.supportGroup]);
    const supportText = asText(cells[FIELDS.supportText]);
    if (supportGroup || supportText) {
      if (phase !== 'Audio DEV') errors.push(`${id} : les groupes de textes sont réservés à la phase Audio DEV.`);
      if (!supportGroup || supportGroup.length > 120) errors.push(`${id} : renseigner « Groupe support » (maximum 120 caractères).`);
      if (supportText.length > 12000) errors.push(`${id} : texte support supérieur à 12000 caractères.`);
      if (mediaType === 'video') errors.push(`${id} : un groupe texte utilise un texte commun, sans vidéo.`);
      q.supportGroup = supportGroup;
      if (supportText) q.supportText = supportText;
    }
    if (type === 'audio_response') {
      // Champs éditoriaux directs ; compatibilité avec les premiers essais JSON.
      const directPrompt = asText(cells[FIELDS.audioPrompt]);
      const data = directPrompt ? {} : parseCell(cells[FIELDS.importedData], {}, `${id}, configuration audio`, errors);
      q.evaluationCriteria = directPrompt || asText(data?.evaluationCriteria);
      q.acceptedExamples = cells[FIELDS.audioExamples] != null
        ? asText(cells[FIELDS.audioExamples]).split(/\r?\n/).map(line => line.trim()).filter(Boolean)
        : data?.acceptedExamples ?? [];
      if (!q.evaluationCriteria || q.evaluationCriteria.length > 4000) errors.push(`${id} : critères audio manquants ou trop longs.`);
      if (!Array.isArray(q.acceptedExamples) || q.acceptedExamples.length > 20
        || q.acceptedExamples.some(example => typeof example !== 'string' || example.length > 500)) errors.push(`${id} : exemples audio invalides.`);
      if (!Array.isArray(attachments) || attachments.length > 1) errors.push(`${id} : déposer un seul fichier dans « Fichier audio ».`);
      if (attachment) {
        try { validateQuestionAttachment(attachment); q.audioAttachment = attachment; }
        catch (error) { errors.push(`${id} : ${error.message}`); }
      }
      if (bonneReponse != null || !Array.isArray(choix) || choix.length || q.multiple || q.reponseOuiNon || q.reponseConversationnelle) errors.push(`${id} : une question audio utilise des critères, sans bonne réponse exacte ni choix.`);
      if (phase !== 'Audio DEV' && !adaptive) errors.push(`${id} : le type audio nécessite le parcours adaptatif.`);
      if (phase !== 'Audio DEV' && adaptive && !Object.values(adaptive.tests).some(test => [...test.primary, test.tiebreaker].includes(id))) {
        errors.push(`${id} : la question audio doit occuper une place dans un mini-test adaptatif.`);
      }
      if (points < 1) errors.push(`${id} : une question audio doit avoir au moins un point.`);
    }

    if (type === 'qcm' && (!Array.isArray(choix) || !choix.length)) errors.push(`${id} : QCM sans choix.`);
    if (Array.isArray(choix)) {
      const values = choix.map(choice => choice?.valeur);
      if (choix.some(choice => !asText(choice?.libelle) || choice?.valeur == null)
        || new Set(values.map(JSON.stringify)).size !== values.length) errors.push(`${id} : choix incomplets ou en double.`);
      if (bonneReponse != null && type === 'qcm' && !values.some(value => value === bonneReponse)) {
        errors.push(`${id} : la bonne réponse ne figure pas parmi les choix.`);
      }
    }
    if (points > 0 && bonneReponse == null && type !== 'audio_response') errors.push(`${id} : question notée sans bonne réponse.`);
    if (phase === 'Audio DEV') {
      if (!['audio_response', 'qcm'].includes(type)) errors.push(`${id} : choisir le type audio_response ou qcm pour cet exercice.`);
      audioRows.push({ question: q, position: asNumber(cells[FIELDS.globalPosition]) ?? 0, supportPosition: asNumber(cells[FIELDS.blockPosition]) });
      continue;
    }

    if (phase === 'Profil') {
      if (type === 'audio_response') errors.push(`${id} : le profil ne peut pas être une question audio.`);
      const source = parseCell(cells[FIELDS.importedData], {}, `${id}, données importées`, errors);
      const key = id.replace(/^profil-/, '');
      if (!['identite', 'email', 'telephone'].includes(key)) errors.push(`${id} : étape de profil inconnue.`);
      profileRows.push({
        key, label: asText(source.label) || key, question: texte,
        type: asText(cells[FIELDS.profileInputType]) || asText(source.type) || 'text',
        autocomplete: asText(source.autocomplete),
        position: asNumber(cells[FIELDS.blockPosition]),
      });
      continue;
    }

    const blockId = asText(cells[FIELDS.blockId]);
    const position = asNumber(cells[FIELDS.blockPosition]);
    if (!blockIds.has(blockId)) errors.push(`${id} : bloc de parcours inconnu ou absent.`);
    if (!Number.isInteger(position) || position < 1) errors.push(`${id} : position dans le bloc invalide.`);
    if (blockById.get(blockId)?.niveau != null && niveau !== blockById.get(blockId).niveau) {
      errors.push(`${id} : le niveau doit correspondre à celui du bloc.`);
    }
    if (points > 0 && !originalById.has(id)) {
      errors.push(`${id} : une nouvelle question notée exige aussi une règle de calcul du niveau ; publication bloquée.`);
    }
    if (ruleIds.has(id) && originalById.has(id) && originalById.get(id).bonneReponse !== bonneReponse) {
      errors.push(`${id} : la bonne réponse intervient dans les règles du parcours ; elle ne peut pas changer sans mise à jour de ces règles.`);
    }
    if (ruleIds.has(id) && originalById.has(id)
      && (originalById.get(id).type !== type || originalById.get(id).points !== points)) {
      errors.push(`${id} : type ou points utilisés par les règles du parcours ; modification non publiable.`);
    }
    if (ruleIds.has(id) && originalById.has(id) && Array.isArray(choix)) {
      const currentValues = new Set(choix.map(choice => JSON.stringify(choice.valeur)));
      if (originalById.get(id).choix.some(choice => !currentValues.has(JSON.stringify(choice.valeur)))) {
        errors.push(`${id} : un identifiant de choix utilisé par le parcours a été supprimé.`);
      }
    }
    testRows.push({ question: q, blockId, position, globalPosition: asNumber(cells[FIELDS.globalPosition]) ?? 0 });
  }

  if (labMode) {
    audioRows.sort((a, b) => a.position - b.position);
    const devAudioQuestions = prepareAudioGroups(audioRows, errors);
    return {
      snapshot: { devAudioQuestions }, errors,
      summary: { audioQuestions: audioRows.length, audioDrafts: active.filter(record => !['Validée', 'Importée'].includes(asText(field(record, FIELDS.editorialState)))).length },
    };
  }

  for (const id of ruleIds) if (!usedIds.has(id)) errors.push(`${id} : question utilisée par une règle mais absente ou archivée.`);
  const startupIds = adaptive?.selfAssessmentIds || [
    'bfff1062-27eb-455c-bb6b-ae72d17c0495',
    '283a501f-c840-4b74-9e88-545152769ef9',
    '547b1f37-9fc4-4f7b-8d47-73297c1dd2aa',
    '1933dae8-da62-464c-a72d-63141c72873b',
    'ce09c281-36db-4e76-ba69-778b64eb6172',
  ];
  for (const id of startupIds) {
    if (!usedIds.has(id)) errors.push(`${id} : question nécessaire au démarrage du parcours.`);
  }
  for (const key of ['identite', 'email', 'telephone']) {
    if (!profileRows.some(row => row.key === key)) errors.push(`Profil : question « ${key} » absente.`);
  }
  if (profileRows.length !== 3) errors.push('Le profil doit contenir exactement trois questions.');
  if (new Set(profileRows.map(row => row.position)).size !== profileRows.length
    || profileRows.some(row => !Number.isInteger(row.position) || row.position < 1)) {
    errors.push('Profil : positions manquantes ou en double.');
  }

  const parcours = JSON.parse(JSON.stringify(base.parcours));
  if (adaptive) {
    parcours.regles = {};
    const activeBlockIds = new Set(testRows.map(row => row.blockId));
    parcours.blocs = parcours.blocs.filter(block => activeBlockIds.has(block.id));
  }
  const rowsByBlock = new Map(parcours.blocs.map(block => [block.id, []]));
  for (const row of testRows) rowsByBlock.get(row.blockId)?.push(row);
  for (const block of parcours.blocs) {
    const rows = rowsByBlock.get(block.id).sort((a, b) => a.position - b.position || a.globalPosition - b.globalPosition);
    if (!rows.length) errors.push(`Bloc ${block.id} : aucune question active.`);
    if (new Set(rows.map(row => row.position)).size !== rows.length) errors.push(`Bloc ${block.id} : positions en double.`);
    block.questions = rows.map(row => row.question.id);
  }
  profileRows.sort((a, b) => a.position - b.position);
  const byId = new Map(testRows.map(row => [row.question.id, row.question]));
  if (adaptive) {
    const adaptiveIds = [
      ...adaptive.selfAssessmentIds,
      ...Object.values(adaptive.tests).flatMap(test => [...test.primary, test.tiebreaker].filter(Boolean)),
    ];
    for (const id of adaptiveIds) {
      if (!byId.has(id)) errors.push(`${id} : question nécessaire au parcours adaptatif absente ou archivée.`);
    }
  }
  const questions = parcours.blocs.flatMap(block => block.questions.map(id => byId.get(id)));
  if (adaptive && questions.every(Boolean)) errors.push(...validateQuestionCoherence(questions, parcours));
  audioRows.sort((a, b) => a.position - b.position);
  const devAudioQuestions = prepareAudioGroups(audioRows, errors);
  return {
    snapshot: { questions, parcours, profileQuestions: profileRows.map(({ position, ...row }) => row),
      ...(audioEnabled ? { devAudioQuestions } : {}) },
    errors,
    summary: { testQuestions: questions.length, scoredQuestions: questions.filter(q => q.bonneReponse != null || q.type === 'audio_response' && q.points > 0).length, profileQuestions: profileRows.length,
      ...(audioEnabled ? { audioQuestions: audioRows.length, audioDrafts: records.filter(record => isExercise(record) && !['Validée', 'Archivée'].includes(asText(field(record, FIELDS.editorialState)))).length } : {}) },
  };
}

export async function fetchAirtableQuestions(env) {
  if (!env.AIRTABLE_TOKEN) throw new Error('AIRTABLE_TOKEN manquant.');
  const records = [];
  let offset = '';
  for (let page = 0; page < 3; page += 1) {
    const url = new URL(`https://api.airtable.com/v0/${env.AIRTABLE_BASE_ID || BASE_ID}/${env.AIRTABLE_QUESTIONS_TABLE_ID || TABLE_ID}`);
    url.searchParams.set('pageSize', '100');
    url.searchParams.set('returnFieldsByFieldId', 'true');
    if (offset) url.searchParams.set('offset', offset);
    const response = await fetch(url, { headers: { Authorization: `Bearer ${env.AIRTABLE_TOKEN}` } });
    if (!response.ok) throw new Error(`Airtable ${response.status}`);
    const data = await response.json();
    records.push(...(Array.isArray(data.records) ? data.records : []));
    offset = data.offset || '';
    if (!offset) return records;
  }
  if (offset) throw new Error('Trop de pages de questions Airtable.');
  return records;
}
