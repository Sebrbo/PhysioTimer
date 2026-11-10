/* Copyright (c) 2026 Sebrbo and contributors.
 * Code: PolyForm Noncommercial 1.0.0; see LICENCE.
 * Shared links intentionally contain ONLY session timing parameters (no patient data).
 */
(function (root, factory) {
  const share = factory(root.PhysioTimerCore || (typeof module === 'object' && module.exports ? require('./core.js') : null));
  if (typeof module === 'object' && module.exports) module.exports = share;
  root.PhysioTimerShare = share;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (Core) {
  'use strict';
  const FIELDS = ['prep', 'work', 'rest', 'rounds', 'cycles', 'cycleRest', 'cooldown'];
  const VERSION = '1';

  function encode(mode, config) {
    if (mode !== 'tabata' && mode !== 'rounds') throw Error('Unsupported session mode.');
    const c = Core.validateConfig(config, mode);
    if (FIELDS.some(field => !Number.isSafeInteger(c[field]))) throw Error('Invalid timing.');
    // Numeric, deterministic and short enough for an easily scannable QR code.
    return [VERSION, mode === 'tabata' ? 't' : 'r', ...FIELDS.map(field => c[field])].join('.');
  }

  function decode(token) {
    if (typeof token !== 'string' || token.length > 110 || !/^1\.[tr](?:\.\d{1,5}){7}$/.test(token)) return null;
    const [version, modeCode, ...values] = token.split('.');
    if (version !== VERSION) return null;
    const mode = modeCode === 't' ? 'tabata' : 'rounds';
    const config = Object.fromEntries(FIELDS.map((field, index) => [field, Number(values[index])]));
    if (mode === 'rounds' && config.cycles !== 1) return null;
    try {
      const validated = Core.validateConfig(config, mode);
      if (mode === 'rounds' && validated.cycles !== 1) return null;
      // Strictly enforce expected input types and limits, including the round count cap.
      return { mode, config: validated };
    } catch { return null; }
  }

  function makeUrl(mode, config, baseUrl) {
    const url = new URL('.', baseUrl);
    url.search = '';
    url.hash = '';
    url.searchParams.set('pt', encode(mode, config));
    return url.toString();
  }

  return { encode, decode, makeUrl };
});
