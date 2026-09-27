import { cp, mkdir, rm } from 'node:fs/promises';

const files = ['index.html', 'style.css', 'questions.js', 'engine.js', 'app.js'];

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
for (const file of files) await cp(file, `dist/${file}`);
