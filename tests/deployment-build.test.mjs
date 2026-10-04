import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

test('Le build Pages transmet la branche au runtime sans exposer le contexte serveur', () => {
  const original = readFileSync('lib/deployment-context.js');
  try {
    for (const branch of ['DEV', 'main']) {
      const build = spawnSync(process.execPath, ['scripts/build-static.mjs'], { env: { ...process.env, CF_PAGES_BRANCH: branch }, encoding: 'utf8' });
      assert.equal(build.status, 0, build.stderr);
      const check = spawnSync(process.execPath, ['--input-type=module', '-e', `
        import assert from 'node:assert/strict';
        import { audioDevEnabled } from './lib/audio-dev.js';
        const env = { QUIZ_AUDIO_ENABLED: 'true' };
        assert.equal(audioDevEnabled(new Request('https://dev.test-hebreu-lavi.pages.dev/'), env), ${branch === 'DEV'});
        assert.equal(audioDevEnabled(new Request('https://test.oulpanlavi.com/'), env), false);
      `], { encoding: 'utf8' });
      assert.equal(check.status, 0, check.stderr);
      assert.equal(existsSync('dist/lib/deployment-context.js'), false);
      assert.equal(existsSync('dist/.env.local'), false);
    }
  } finally { writeFileSync('lib/deployment-context.js', original); }
});
