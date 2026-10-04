// Vérification facultative, payante : jamais exécutée par la suite automatisée.
// Fixtures synthétiques locales ; aucune voix ni coordonnée d’élève.
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { analyzeAudio } from '../lib/audio-response.js';
import { audioDemo } from '../lib/audio-dev.js';
process.loadEnvFile('.env.local');
if (!process.env.OPENAI_API_KEY) throw new Error('Clé serveur absente.');
if (!process.argv.includes('--live')) throw new Error('Ajouter --live pour autoriser les appels OpenAI de ces cinq essais.');
const directory = await mkdtemp(join(tmpdir(), 'lavi-audio-'));
const cases = [
  ['correcte', 'אתמול בערב ראיתי סרט', 'correct'],
  ['formulation différente', 'אתמול בערב ביקרתי אצל אחותי ודיברנו', 'correct'],
  ['fausse (futur)', 'מחר בערב אלך למסעדה', 'incorrect'],
  ['hors sujet', 'הצבע האהוב עליי הוא כחול', 'incorrect'],
  ['très courte', 'עבדתי', 'correct'],
];
let failed = false;
try {
  const filter = process.argv.find(value => value.startsWith('--case='))?.slice(7);
  for (const [label, text, expected] of cases.filter(item => !filter || item[0] === filter)) {
    const aiff = join(directory, 'fixture.aiff'); const wav = join(directory, 'fixture.wav');
    execFileSync('/usr/bin/say', ['-v', 'Carmit', '-r', '140', '-o', aiff, text]);
    execFileSync('/usr/bin/afconvert', ['-f', 'WAVE', '-d', 'LEI16@16000', '-c', '1', aiff, wav]);
    const result = await analyzeAudio(process.env, audioDemo, new Blob([await readFile(wav)], { type: 'audio/wav' }));
    console.log(JSON.stringify({ case: label, expected, ...result }));
    if (result.status !== expected) failed = true;
    if (result.status === 'uncertain' && !result.transcription) break;
  }
} finally { await rm(directory, { recursive: true, force: true }); }
if (failed) process.exitCode = 1;
