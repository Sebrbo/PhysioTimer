/* Copyright (c) 2026 Sebrbo and contributors. Code: PolyForm Noncommercial 1.0.0; see LICENCE. */
/* Shared, testable timer math. No date-based or interval-based drift. */
(function (root, factory) {
  const core = factory();
  if (typeof module === 'object' && module.exports) module.exports = core;
  root.PhysioTimerCore = core;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  function parseTime(value) {
    const str = String(value ?? '').trim();
    if (!/^\d{1,4}(?::\d{1,2}){0,2}$/.test(str)) return NaN;
    const units = str.split(':').map(Number);
    if (units.some(n => !Number.isSafeInteger(n))) return NaN;
    if (units.length > 1 && units.slice(1).some(n => n >= 60)) return NaN;
    return units.reduce((acc, n) => acc * 60 + n, 0);
  }
  function formatTime(seconds) {
    const value = Math.max(0, Math.ceil(seconds));
    const h = Math.floor(value / 3600), m = Math.floor(value % 3600 / 60), s = value % 60;
    if (h) return [h, m, s].map((x, i) => i ? String(x).padStart(2, '0') : String(x)).join(':');
    return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
  }
  function validateConfig(input, mode) {
    const c = { ...input, cycles: mode === 'rounds' ? 1 : Number(input.cycles), rounds: Number(input.rounds) };
    if (!Number.isInteger(c.rounds) || c.rounds < 1 || c.rounds > 99) throw Error('Le nombre de rounds doit être entre 1 et 99.');
    if (!Number.isInteger(c.cycles) || c.cycles < 1 || c.cycles > 20) throw Error('Le nombre de cycles doit être entre 1 et 20.');
    for (const field of ['prep', 'work', 'rest', 'cycleRest', 'cooldown']) {
      if (!Number.isInteger(c[field]) || c[field] < 0 || c[field] > 36000) throw Error('Durée incorrecte pour « ' + field + ' ».');
    }
    if (c.work === 0) throw Error('La durée d’exercice doit être supérieure à 0 seconde.');
    if (c.rounds * c.cycles > 1000) throw Error('Le nombre total de rounds est trop élevé.');
    return c;
  }
  function buildSegments(input, mode) {
    const c = validateConfig(input, mode);
    let time = 0, completedWorks = 0;
    const segments = [];
    function add(kind, seconds, round, cycle) {
      if (!seconds) return;
      const durationMs = seconds * 1000;
      const seg = { index: segments.length, kind, durationMs, startMs: time, endMs: time + durationMs, round, cycle, completedWorksAtStart: completedWorks };
      segments.push(seg);
      time += durationMs;
    }
    add('prep', c.prep, 0, 0);
    for (let cycle = 1; cycle <= c.cycles; cycle++) {
      for (let round = 1; round <= c.rounds; round++) {
        add('work', c.work, round, cycle);
        completedWorks++;
        if (round < c.rounds) add('rest', c.rest, round, cycle);
      }
      if (cycle < c.cycles) add('cycleRest', c.cycleRest, c.rounds, cycle);
    }
    add('cooldown', c.cooldown, c.rounds, c.cycles);
    return { segments, totalMs: time, config: c, totalWorks: c.rounds * c.cycles };
  }
  function locate(plan, elapsedMs) {
    const elapsed = Math.max(0, Math.min(plan.totalMs, elapsedMs));
    if (elapsed >= plan.totalMs) return { done: true, index: plan.segments.length, remainingMs: 0, totalRemainingMs: 0, roundsLeft: 0, cyclesLeft: 0, progress: 1, segment: null };
    const segment = plan.segments.find(s => elapsed < s.endMs);
    if (!segment) throw Error('Plan de minuterie invalide.');
    const remainingMs = segment.endMs - elapsed;
    const roundsLeft = segment.kind === 'prep' ? plan.config.rounds :
      segment.kind === 'cycleRest' || segment.kind === 'cooldown' ? 0 :
      Math.max(0, plan.config.rounds - segment.round + (segment.kind === 'work' ? 1 : 0));
    const cyclesLeft = segment.kind === 'cooldown' ? 0 : segment.kind === 'prep' ? plan.config.cycles : segment.kind === 'cycleRest' ? plan.config.cycles - segment.cycle : plan.config.cycles - segment.cycle + 1;
    return { done: false, index: segment.index, segment, remainingMs, totalRemainingMs: plan.totalMs - elapsed, roundsLeft, cyclesLeft, progress: 1 - remainingMs / segment.durationMs };
  }
  return { parseTime, formatTime, validateConfig, buildSegments, locate };
});
