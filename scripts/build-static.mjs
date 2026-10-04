import { cp, mkdir, rm, writeFile } from 'node:fs/promises';

const files = ['index.html', 'admin.html', 'admin.js', 'style.css', 'questions.js', 'engine.js', 'app.js', 'audio-recorder.js', 'audio-experiment.js', 'audio'];

// Métadonnée serveur, compilée avec les Pages Functions et jamais servie en statique.
await writeFile('lib/deployment-context.js', `export const deploymentBranch = ${JSON.stringify(process.env.CF_PAGES_BRANCH || '')};\n`);

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
for (const file of files) await cp(file, `dist/${file}`, { recursive: true });
