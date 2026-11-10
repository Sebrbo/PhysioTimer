
const test = require('node:test');
const assert = require('node:assert/strict');

const {
  mkdtempSync,
  readFileSync,
  rmSync,
  existsSync
} = require('node:fs');

const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { execFileSync } = require('node:child_process');

const root = join(__dirname, '..');

const { version } = JSON.parse(
  readFileSync(join(root, 'version.json'), 'utf8')
);

function build(buildId) {
  const folder = mkdtempSync(
    join(tmpdir(), 'physiotimer-build-')
  );

  const site = join(folder, 'site');

  execFileSync(
    process.execPath,
    ['scripts/build-site.mjs'],
    {
      cwd: root,
      env: {
        ...process.env,
        BUILD_ID: buildId,
        OUTPUT_DIR: site
      }
    }
  );

  return {
    folder,
    site,
    html: readFileSync(join(site, 'index.html'), 'utf8'),
    sw: readFileSync(join(site, 'service-worker.js'), 'utf8')
  };
}

test('Product version is read from version.json', () => {
  const result = build('test-1');

  try {
    assert.ok(
      result.html.includes(
        `name="app-version" content="${version}"`
      )
    );

    assert.ok(
      result.html.includes(
        `id="appVersion">${version}</strong>`
      )
    );

    assert.ok(existsSync(join(result.site, '.nojekyll')));
    assert.ok(existsSync(join(result.site, 'js/qr.js')));
  } finally {
    rmSync(result.folder, { recursive: true, force: true });
  }
});

test('New deployments refresh cache without changing version', () => {
  const first = build('test-1');
  const second = build('test-2');

  try {
    assert.ok(
      first.html.includes(`style.css?v=${version}-test-1`)
    );

    assert.ok(
      second.html.includes(`style.css?v=${version}-test-2`)
    );

    assert.ok(
      first.sw.includes(
        `CACHE_NAME = 'physiotimer-v${version}-test-1'`
      )
    );

    assert.ok(
      second.sw.includes(
        `CACHE_NAME = 'physiotimer-v${version}-test-2'`
      )
    );

    assert.ok(
      second.html.includes(
        `name="app-version" content="${version}"`
      )
    );
  } finally {
    rmSync(first.folder, { recursive: true, force: true });
    rmSync(second.folder, { recursive: true, force: true });
  }
});
