import test from 'node:test';
import assert from 'node:assert/strict';
import {
  initial,
  refresh,
  deposit,
  collect,
  plan,
  routeLength,
  sortMaterial,
  status,
  distance,
  restore
} from '../src/model.js';

test('critical level generates one alert, collection resolves it', () => {
  const state = refresh(initial());
  const bin = state.bins[0];

  assert.equal(deposit(state, bin.id, 25, 10), true);
  assert.equal(bin.fill, 100);
  assert.equal(bin.weight, 43.8);
  assert.equal(status(bin.fill), 'Crítico');
  refresh(state);
  assert.equal(state.alerts.filter(alert => alert.bin === bin.id && !alert.done).length, 1);
  assert.equal(collect(state, bin.id), true);
  assert.equal(bin.fill, 0);
  assert.equal(state.alerts.filter(alert => alert.bin === bin.id && !alert.done).length, 0);
  assert.equal(state.collections, 1);
});

test('disconnected sensors and full containers reject deposits without mutation', () => {
  const state = initial();
  const bin = state.bins[0];
  bin.online = false;
  assert.equal(deposit(state, bin.id), false);
  assert.equal(bin.fill, 78);

  bin.online = true;
  bin.fill = 100;
  const before = { weight: bin.weight, updated: bin.updated };
  assert.equal(deposit(state, bin.id), false);
  assert.deepEqual({ weight: bin.weight, updated: bin.updated }, before);
});

test('invalid deposits cannot reduce fill or corrupt weight', () => {
  const state = initial();
  const bin = state.bins[0];

  assert.equal(deposit(state, bin.id, -10, 5), false);
  assert.equal(deposit(state, bin.id, 0, 5), false);
  assert.equal(deposit(state, bin.id, 10, 0), false);
  assert.equal(deposit(state, bin.id, Number.NaN, 5), false);
  assert.equal(bin.fill, 78);
  assert.equal(bin.weight, 35);
});

test('deposit scales weight to the accepted capacity', () => {
  const state = initial();
  const bin = state.bins[0];

  assert.equal(deposit(state, bin.id, 40, 20), true);
  assert.equal(bin.fill, 100);
  assert.equal(bin.weight, 46);
});

test('optimized route contains only valid connected priority stops and never exceeds baseline', () => {
  const state = initial();
  const offline = state.bins[1];
  offline.online = false;
  const empty = { ...state.bins[0], id: 'empty', fill: 99, weight: 0 };
  const invalidLocation = { ...state.bins[0], id: 'invalid', lat: Number.NaN };
  const result = plan([...state.bins, empty, invalidLocation]);

  assert.equal(result.optimized.length, 1);
  assert.deepEqual(result.optimized.map(bin => bin.id), ['SD-004']);
  assert.deepEqual(
    result.optimized.map(bin => bin.id).sort(),
    result.traditional.map(bin => bin.id).sort()
  );
  assert.ok(routeLength(result.optimized) <= routeLength(result.traditional));
  assert.deepEqual(plan([]), { traditional: [], optimized: [] });
});

test('route distance is finite for valid locations and rejects invalid points', () => {
  assert.equal(distance({ lat: 18, lon: -70 }, { lat: 18, lon: -70 }), 0);
  assert.throws(() => distance({ lat: Number.NaN, lon: 0 }, { lat: 0, lon: 0 }), TypeError);
  assert.throws(() => routeLength(null), TypeError);
});

test('collection records material once and conserves mass through classification', () => {
  const state = initial();
  const bin = state.bins[0];
  const collectedWeight = bin.weight;

  assert.equal(collect(state, bin.id), true);
  assert.equal(collect(state, bin.id), false);
  assert.equal(state.stock, collectedWeight);
  assert.equal(state.collected, collectedWeight);
  assert.equal(state.collections, 1);

  const pet = sortMaterial(state, 'PET', 10);
  const hdpe = sortMaterial(state, 'HDPE', 100);
  assert.equal(pet + hdpe, collectedWeight);
  assert.equal(state.stock, 0);
  assert.equal(state.sorted.PET + state.sorted.HDPE, collectedWeight);
});

test('classification rejects invalid materials and quantities without changing stock', () => {
  const state = initial();
  state.stock = 5;

  assert.equal(sortMaterial(state, 'unknown', 1), 0);
  assert.equal(sortMaterial(state, 'PET', -2), 0);
  assert.equal(sortMaterial(state, 'PET', 0), 0);
  assert.equal(sortMaterial(state, 'PET', Number.NaN), 0);
  assert.equal(state.stock, 5);
  assert.equal(state.sorted.PET, 0);
});

test('very small valid deposits and classifications conserve material without rounding it up', () => {
  const state = initial();
  const bin = state.bins[0];
  bin.fill = 0;
  bin.weight = 0;

  assert.equal(deposit(state, bin.id, 0.1, 0.003), true);
  assert.equal(bin.weight, 0.003);
  assert.equal(collect(state, bin.id), true);
  assert.equal(sortMaterial(state, 'PET', 1), 0.003);
  assert.equal(state.stock, 0);
  assert.equal(state.sorted.PET, 0.003);
});

test('restored local state drops invalid records and repairs unsafe counters', () => {
  const saved = initial();
  saved.bins[0].fill = 101;
  saved.bins.push({ ...saved.bins[1], name: 'Duplicado' });
  saved.stock = -5;
  saved.sorted.PET = Number.NaN;
  saved.route = ['missing-bin', 'SD-002', 'SD-002'];
  saved.selected = 'missing-bin';

  const state = restore(saved);
  assert.equal(state.bins.length, 5);
  assert.equal(state.bins[1].id, 'SD-003');
  assert.equal(state.stock, 0);
  assert.equal(state.sorted.PET, 0);
  assert.deepEqual(state.route, ['SD-002']);
  assert.equal(state.selected, 'SD-002');
  assert.equal(restore({ bins: null }).bins.length, initial().bins.length);
});

test('acknowledged alerts do not regenerate until their condition clears', () => {
  const state = refresh(initial());
  const alert = state.alerts[0];
  alert.done = true;

  refresh(state);
  assert.equal(state.alerts.length, 1);
  assert.equal(collect(state, alert.bin), true);
  assert.equal(deposit(state, alert.bin, 100, 40), true);
  assert.equal(state.alerts.filter(item => !item.done).length, 1);
});
