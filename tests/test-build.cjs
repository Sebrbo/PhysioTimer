/* Build output: version is generated from the Actions run number. */
const test = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, readFileSync, rmSync, existsSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { execFileSync } = require('node:child_process');
const root = join(__dirname, '..');

test('initial deployment exposes 0.4.1 and an isolated PWA cache', () => {
  const output = mkdtempSync(join(tmpdir(), 'physiotimer-build-'));
  try {
    execFileSync(process.execPath, ['scripts/build-site.mjs'], { cwd: root, env: { ...process.env, BUILD_NUMBER: '1', OUTPUT_DIR: join(output, 'site') } });
    const html = readFileSync(join(output, 'site/index.html'), 'utf8');
    const sw = readFileSync(join(output, 'site/service-worker.js'), 'utf8');
    assert.match(html, /name="app-version" content="0\.4\.1"/);
    assert.match(html, /id="appVersion">0\.4\.1<\/strong>/);
    assert.match(html, /style\.css\?v=0\.4\.1/);
    assert.match(sw, /CACHE_NAME = 'physiotimer-v0\.4\.1'/);
    assert.match(sw, /app\.js\?v=0\.4\.1/);
    assert.ok(existsSync(join(output,'site/js/qr.js')));
    assert.ok(existsSync(join(output,'site/icons/icon-192.png')));
  } finally { rmSync(output, { recursive: true, force: true }); }
});

test('later deployment automatically increments version and asset cache', () => {
  const output = mkdtempSync(join(tmpdir(), 'physiotimer-build-'));
  try {
    execFileSync(process.execPath, ['scripts/build-site.mjs'], { cwd: root, env: { ...process.env, BUILD_NUMBER: '3', OUTPUT_DIR: join(output, 'site') } });
    const html = readFileSync(join(output, 'site/index.html'), 'utf8');
    const sw = readFileSync(join(output, 'site/service-worker.js'), 'utf8');
    assert.match(html, /name="app-version" content="0\.4\.3"/);
    assert.match(sw, /CACHE_NAME = 'physiotimer-v0\.4\.3'/);
    assert.doesNotMatch(html, /\?v=0\.4\.1/);
  } finally { rmSync(output, { recursive: true, force: true }); }
});
