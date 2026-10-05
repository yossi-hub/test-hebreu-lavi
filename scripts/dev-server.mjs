// Adaptateur local des mêmes Pages Functions, sans envoi de mails ni déploiement.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { onRequestGet as getAudio, onRequestPost as postAudio } from '../functions/api/audio-response.js';
import { onRequestGet as getQuestions, onRequestPost as publishQuestions } from '../functions/api/question-set.js';
import { onRequestGet as getQuestionAudio } from '../functions/api/question-audio.js';
import { onRequestGet as getSync, onRequestPost as syncQuestions } from '../functions/api/question-sync.js';
import { onRequestGet as getLab, onRequestPost as loadLab } from '../functions/api/question-lab.js';

try { process.loadEnvFile('.env.local'); } catch (error) { if (error.code !== 'ENOENT') throw new Error('Impossible de charger la configuration locale.'); }
const database = new DatabaseSync(':memory:');
const QUIZ_DB = {
  prepare(sql) {
    const statement = database.prepare(sql);
    const bound = values => {
      const args = values.map(value => value instanceof ArrayBuffer ? new Uint8Array(value) : value);
      return {
      run: async () => { const result = statement.run(...args); return { success: true, meta: { changes: Number(result.changes) } }; },
      first: async () => statement.get(...args) || null,
      all: async () => ({ results: statement.all(...args), success: true }),
    }; };
    return { ...bound([]), bind: (...args) => bound(args) };
  },
  async batch(statements) {
    database.exec('BEGIN');
    try {
      const results = [];
      for (const statement of statements) results.push(await statement.run());
      database.exec('COMMIT'); return results;
    } catch (error) { database.exec('ROLLBACK'); throw error; }
  },
};
const root = resolve('dist');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4' };
async function asset(request) {
  const url = new URL(request.url);
  let path;
  try { path = resolve(root, `.${decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname)}`); }
  catch { return new Response('Adresse invalide', { status: 400 }); }
  if (!path.startsWith(root + sep) || !mime[extname(path)]) return new Response('Introuvable', { status: 404 });
  try { return new Response(await readFile(path), { headers: { 'Content-Type': mime[extname(path)], 'Cache-Control': 'no-store' } }); }
  catch { return new Response('Introuvable', { status: 404 }); }
}
const env = { ...process.env, APP_ENV: 'development', QUIZ_AUDIO_ENABLED: 'true', QUIZ_AUDIO_LOCAL_DEBUG: 'true', QUIZ_DB, ASSETS: { fetch: asset } };
const portArg = process.argv.find(value => value.startsWith('--port='));
const port = Number(portArg?.slice(7) || 8788);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Port invalide.');
const server = http.createServer(async (incoming, outgoing) => {
  try {
    const base = `http://localhost:${port}`;
    const headers = new Headers();
    for (const [name, value] of Object.entries(incoming.headers)) if (value) headers.set(name, Array.isArray(value) ? value.join(', ') : value);
    const request = new Request(new URL(incoming.url, base), { method: incoming.method, headers,
      ...(incoming.method === 'POST' ? { body: incoming, duplex: 'half' } : {}),
    });
    const path = new URL(request.url).pathname;
    const handler = path === '/api/audio-response' ? (request.method === 'POST' ? postAudio : getAudio)
      : path === '/api/question-set' ? (request.method === 'POST' ? publishQuestions : getQuestions)
      : path === '/api/question-lab' ? (request.method === 'POST' ? loadLab : getLab)
      : path === '/api/question-sync' ? (request.method === 'POST' ? syncQuestions : getSync)
      : path === '/api/question-audio' && request.method === 'GET' ? getQuestionAudio : null;
    const response = handler ? await handler({ request, env }) : path.startsWith('/api/')
      ? new Response(JSON.stringify({ error: 'Cette route est désactivée dans le serveur local d’essai audio.' }), { status: 503, headers: { 'Content-Type': 'application/json' } })
      : await asset(request);
    outgoing.writeHead(response.status, Object.fromEntries(response.headers));
    outgoing.end(Buffer.from(await response.arrayBuffer()));
  } catch { outgoing.writeHead(500); outgoing.end('Erreur DEV'); }
});
server.listen(port, '127.0.0.1', () => console.log(`Essai audio DEV : http://localhost:${port} (debug local, stockage en mémoire, aucun déploiement)`));
