const assert = require('node:assert/strict');
const { test } = require('node:test');
const C = require('../js/core.js');

test('Tabata : 12x10/10 avec préparation 5 sec = 3:55', () => {
  const plan = C.buildSegments({prep:5,work:10,rest:10,rounds:12,cycles:1,cycleRest:30,cooldown:0},'tabata');
  assert.equal(plan.totalMs,235000);
  assert.equal(plan.segments.filter(s=>s.kind==='work').length,12);
  assert.equal(plan.segments.filter(s=>s.kind==='rest').length,11);
  assert.equal(C.locate(plan,5000).segment.kind,'work');
  assert.equal(C.locate(plan,15000).segment.kind,'rest');
  assert.equal(C.locate(plan,235000).done,true);
});
test('Rounds : 5x10/10 avec préparation 5 sec = 1:35', () => {
  const plan = C.buildSegments({prep:5,work:10,rest:10,rounds:5,cycles:1,cycleRest:0,cooldown:0},'rounds');
  assert.equal(plan.totalMs,95000);
  assert.equal(plan.segments.at(-1).kind,'work');
});
test('Cycle : repos inter-cycle remplace le repos après le dernier round', () => {
  const plan=C.buildSegments({prep:0,work:20,rest:10,rounds:2,cycles:2,cycleRest:30,cooldown:0},'tabata');
  assert.deepEqual(plan.segments.map(s=>s.kind),['work','rest','work','cycleRest','work','rest','work']);
  assert.equal(plan.totalMs,130000);
  assert.equal(C.locate(plan,5000).roundsLeft,2);
  assert.equal(C.locate(plan,20000).roundsLeft,1);
  assert.equal(C.locate(plan,60000).cyclesLeft,1);
  assert.equal(C.locate(plan,60000).roundsLeft,0);
  assert.equal(C.locate(plan,80000).roundsLeft,2);
});
test('Durées saisies : valider secondes simples, mm:ss et h:mm:ss', () => {
  assert.equal(C.parseTime('05'),5);
  assert.equal(C.parseTime('03:15'),195);
  assert.equal(C.parseTime('1:02:30'),3750);
  assert.ok(Number.isNaN(C.parseTime('02:80')));
  assert.equal(C.formatTime(3750),'1:02:30');
});
test('Validation de programme', () => {
  assert.throws(()=>C.buildSegments({prep:0,work:0,rest:10,rounds:2,cycles:1,cycleRest:0,cooldown:0},'tabata'));
});
