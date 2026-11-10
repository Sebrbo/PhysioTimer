/* PhysioTimer static release builder — no external dependencies.
 * Each GitHub Actions run publishes 0.4.<GITHUB_RUN_NUMBER>.
 * First deployment from this workflow = 0.4.1.
 */
import { cpSync, readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(process.env.OUTPUT_DIR || join(repo, '_site'));
const run = Number(process.env.BUILD_NUMBER ?? process.env.GITHUB_RUN_NUMBER ?? '1');
if (!Number.isSafeInteger(run) || run < 1) throw new Error('Invalid GitHub Actions run number');
if (out === repo) throw new Error('Output must not overwrite the repository');
const version = `0.4.${run}`;

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
for (const item of ['index.html', 'css', 'js', 'icons', 'manifest.webmanifest', 'service-worker.js', '.nojekyll']) {
  cpSync(join(repo, item), join(out, item), { recursive: true });
}
const updateAssetQuery = text => text.replace(/\?v=\d+(?:\.\d+)*/g, `?v=${version}`);
let html = updateAssetQuery(readFileSync(join(out, 'index.html'), 'utf8'));
html = html.replace(/(<meta name="app-version" content=")[^"]+("\s*>)/, (_, first, last) => `${first}${version}${last}`);
html = html.replace(/(<strong id="appVersion">)[^<]*(<\/strong>)/, (_, first, last) => `${first}${version}${last}`);
writeFileSync(join(out, 'index.html'), html);
let sw = updateAssetQuery(readFileSync(join(out, 'service-worker.js'), 'utf8'));
sw = sw.replace(/const CACHE_NAME = '[^']+';/, `const CACHE_NAME = 'physiotimer-v${version}';`);
writeFileSync(join(out, 'service-worker.js'), sw);
console.log(`PhysioTimer ${version} generated in ${out}`);
