/* PhysioTimer share-link regression tests. Uses Node built-in test runner. */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const Share = require('../js/share.js');
const Core = require('../js/core.js');
const Qr = require('../js/qr.js');

const TABATA = { prep: 5, work: 20, rest: 10, rounds: 8, cycles: 1, cycleRest: 30, cooldown: 0 };
const ROUNDS = { prep: 5, work: 45, rest: 15, rounds: 5, cycles: 1, cycleRest: 0, cooldown: 0 };

test('Sharing Tabata and Rounds round-trips all numeric settings', () => {
  for (const [mode, config] of [['tabata', TABATA], ['rounds', ROUNDS]]) {
    assert.deepEqual(Share.decode(Share.encode(mode, config)), { mode, config });
  }
});

test('Share URL has no patient, preset name or other personal data', () => {
  const url = Share.makeUrl('tabata', TABATA, 'https://sebrbo.github.io/PhysioTimer/?old=value#top');
  const parsed = new URL(url);
  assert.equal(parsed.pathname, '/PhysioTimer/');
  assert.deepEqual([...parsed.searchParams.keys()], ['pt']);
  assert.equal(parsed.hash, '');
  assert.deepEqual(Share.decode(parsed.searchParams.get('pt')).config, TABATA);
});

test('Reject malformed, incompatible or overloaded links', () => {
  for (const token of [null, '', 'x', '2.t.5.20.10.8.1.30.0',
    '1.t.5.20.10.8.1.30', '1.t.5.20.10.8.1.30.0.5',
    '1.t.5.20.10.100.1.30.0', '1.t.5.0.10.8.1.30.0',
    '1.t.5.20.10.8.30.30.0', '1.r.5.20.10.8.2.30.0',
    '1.t.5.20.10.8.1.30.0?redirect=https://example.com',
    '1.t.5.20.10.8.1.30.NaN', '1.t.5.20.10.8.1.30.-1']) {
    assert.equal(Share.decode(token), null, String(token));
  }
});

test('Extreme but valid settings remain bounded by timer validation', () => {
  assert.throws(() => Share.encode('tabata', { ...TABATA, rounds: 200 }));
  assert.throws(() => Share.encode('rounds', { ...ROUNDS, work: 0 }));
  assert.throws(() => Share.encode('stopwatch', TABATA));
});

test('Shared calculations match original timer math', () => {
  const decoded = Share.decode(Share.encode('tabata', TABATA));
  assert.equal(Core.buildSegments(decoded.config,decoded.mode).totalMs, 235000);
});

test('Local generator returns an SVG QR code containing black modules and a quiet zone', () => {
  const svg=Qr.createSvg(Share.makeUrl('tabata',TABATA,'https://sebrbo.github.io/PhysioTimer/'));
  assert.match(svg, /xmlns="http:\/\/www.w3.org\/2000\/svg"/);
  assert.match(svg, /<rect[^>]*fill="#fff"/);
  assert.match(svg, /<path[^>]*fill="#071426"/);
  assert.ok(svg.length>1000);
});
