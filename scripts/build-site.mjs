
/* PhysioTimer — Static release builder */

import {
  cpSync,
  readFileSync,
  writeFileSync,
  mkdirSync,
  rmSync
} from 'node:fs';

import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(process.env.OUTPUT_DIR || join(repo, '_site'));

// Application version: manually maintained
const { version } = JSON.parse(
  readFileSync(join(repo, 'version.json'), 'utf8')
);

if (typeof version !== 'string' ||
    !/^\d+\.\d+\.\d+$/.test(version)) {
  throw new Error('Invalid version.json');
}

// Deployment identifier: automatically generated
const buildId = String(
  process.env.BUILD_ID ||
  `${process.env.GITHUB_RUN_ID || 'local'}-${process.env.GITHUB_RUN_ATTEMPT || '1'}`
);

if (!/^[a-zA-Z0-9_-]+$/.test(buildId)) {
  throw new Error('Invalid build identifier');
}

if (out === repo) {
  throw new Error('Output must not overwrite repository');
}

const assetVersion = `${version}-${buildId}`;

// Prepare deployment directory
rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });

for (const item of [
  'index.html',
  'css',
  'js',
  'icons',
  'manifest.webmanifest',
  'service-worker.js',
  'version.json'
]) {
  cpSync(join(repo, item), join(out, item), {
    recursive: true
  });
}

writeFileSync(join(out, '.nojekyll'), '');

// Refresh asset URLs on each deployment
const updateAssets = text =>
  text.replace(/\?v=[a-zA-Z0-9._-]+/g, `?v=${assetVersion}`);

// Update HTML
let html = updateAssets(
  readFileSync(join(out, 'index.html'), 'utf8')
);

html = html.replace(
  /(<meta name="app-version" content=")[^"]+(")/,
  (_, start, end) => `${start}${version}${end}`
);

html = html.replace(
  /(<strong id="appVersion">)[^<]*(<\/strong>)/,
  (_, start, end) => `${start}${version}${end}`
);

writeFileSync(join(out, 'index.html'), html);

// Update PWA cache
let sw = updateAssets(
  readFileSync(join(out, 'service-worker.js'), 'utf8')
);

sw = sw.replace(
  /const CACHE_NAME = '[^']+';/,
  `const CACHE_NAME = 'physiotimer-v${assetVersion}';`
);

writeFileSync(join(out, 'service-worker.js'), sw);

console.log(`PhysioTimer v${version} — build ${buildId}`);
