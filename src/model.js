export const materials = ['PET', 'HDPE', 'Cartón', 'No reciclable'];

const roundTenth = value => Math.round((value + Number.EPSILON) * 10) / 10;
const roundKilograms = value => Math.round((value + Number.EPSILON) * 10000) / 10000;
const isFiniteNumber = value => Number.isFinite(value);
const validCoordinates = point =>
  point &&
  isFiniteNumber(point.lat) &&
  point.lat >= -90 &&
  point.lat <= 90 &&
  isFiniteNumber(point.lon) &&
  point.lon >= -180 &&
  point.lon <= 180;

export const status = fill =>
  fill >= 95 ? 'Crítico' : fill >= 80 ? 'Prioritario' : fill >= 50 ? 'Atención' : 'Normal';

export const color = fill =>
  fill >= 95 ? '#dc2626' : fill >= 80 ? '#ea580c' : fill >= 50 ? '#d99a10' : '#059669';

export const initial = () => ({
  bins: [
    ['Zona Colonial', 18.474, -69.884, 78, 35],
    ['Ciudad Nueva', 18.465, -69.895, 91, 48],
    ['Gazcue', 18.471, -69.909, 44, 19],
    ['Villa Juana', 18.494, -69.914, 96, 53],
    ['Los Mina', 18.502, -69.858, 64, 29],
    ['Ensanche Ozama', 18.486, -69.866, 22, 9]
  ].map(([name, lat, lon, fill, weight], index) => ({
    id: `SD-${String(index + 1).padStart(3, '0')}`,
    name,
    lat,
    lon,
    fill,
    weight,
    online: true,
    battery: 90 - index * 7,
    updated: new Date().toISOString()
  })),
  alerts: [],
  logs: [],
  stock: 0,
  sorted: Object.fromEntries(materials.map(material => [material, 0])),
  collected: 0,
  collections: 0,
  km: 0,
  routes: 0,
  route: [],
  selected: 'SD-001'
});

export function restore(saved) {
  if (!saved || typeof saved !== 'object' || !Array.isArray(saved.bins) || !saved.bins.length) {
    return initial();
  }

  const seenIds = new Set();
  const bins = saved.bins.filter(bin => {
    if (
      !bin ||
      typeof bin.id !== 'string' ||
      !bin.id ||
      seenIds.has(bin.id) ||
      typeof bin.name !== 'string' ||
      !bin.name.trim() ||
      !validCoordinates(bin) ||
      bin.lat < -90 ||
      bin.lat > 90 ||
      bin.lon < -180 ||
      bin.lon > 180 ||
      !isFiniteNumber(bin.fill) ||
      bin.fill < 0 ||
      bin.fill > 100 ||
      !isFiniteNumber(bin.weight) ||
      bin.weight < 0 ||
      typeof bin.online !== 'boolean' ||
      !isFiniteNumber(bin.battery) ||
      bin.battery < 0 ||
      bin.battery > 100
    ) {
      return false;
    }

    seenIds.add(bin.id);
    return true;
  });

  if (!bins.length) return initial();

  const ids = new Set(bins.map(bin => bin.id));
  const nonNegative = value => isFiniteNumber(value) && value >= 0 ? value : 0;
  const sorted = Object.fromEntries(
    materials.map(material => [material, nonNegative(saved.sorted?.[material])])
  );

  return {
    bins,
    alerts: Array.isArray(saved.alerts)
      ? saved.alerts.filter(alert =>
          alert &&
          ids.has(alert.bin) &&
          typeof alert.id === 'string' &&
          typeof alert.type === 'string' &&
          typeof alert.done === 'boolean'
        )
      : [],
    logs: Array.isArray(saved.logs)
      ? saved.logs.filter(log =>
          log &&
          typeof log.name === 'string' &&
          isFiniteNumber(log.kg) &&
          log.kg >= 0 &&
          typeof log.date === 'string'
        )
      : [],
    stock: nonNegative(saved.stock),
    sorted,
    collected: nonNegative(saved.collected),
    collections: Number.isInteger(saved.collections) && saved.collections >= 0
      ? saved.collections
      : 0,
    km: nonNegative(saved.km),
    routes: Number.isInteger(saved.routes) && saved.routes >= 0 ? saved.routes : 0,
    route: Array.isArray(saved.route) ? [...new Set(saved.route.filter(id => ids.has(id)))] : [],
    selected: ids.has(saved.selected) ? saved.selected : bins[0].id
  };
}

export function distance(a, b) {
  if (!validCoordinates(a) || !validCoordinates(b)) {
    throw new TypeError('Distance requires valid latitude and longitude coordinates.');
  }

  const radians = Math.PI / 180;
  const deltaLat = (b.lat - a.lat) * radians;
  const deltaLon = (b.lon - a.lon) * radians;
  const haversine =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(a.lat * radians) * Math.cos(b.lat * radians) * Math.sin(deltaLon / 2) ** 2;

  return 6371 * 2 * Math.asin(Math.sqrt(Math.min(1, haversine)));
}

export const depot = { lat: 18.48, lon: -69.895, name: 'Base municipal' };

export function routeLength(points) {
  if (!Array.isArray(points)) {
    throw new TypeError('Route points must be an array.');
  }

  let previous = depot;
  let total = 0;
  for (const point of points) {
    total += distance(previous, point);
    previous = point;
  }
  return total + distance(previous, depot);
}

export function plan(bins) {
  if (!Array.isArray(bins)) {
    throw new TypeError('Bins must be an array.');
  }

  const eligible = bins.filter(bin =>
    bin.online === true &&
    isFiniteNumber(bin.fill) &&
    bin.fill >= 80 &&
    isFiniteNumber(bin.weight) &&
    bin.weight > 0 &&
    validCoordinates(bin)
  );
  const traditional = [...eligible];
  const remaining = [...eligible];
  const optimized = [];
  let current = depot;

  while (remaining.length) {
    remaining.sort((a, b) => distance(current, a) - distance(current, b));
    current = remaining.shift();
    optimized.push(current);
  }

  return {
    traditional,
    optimized: routeLength(optimized) <= routeLength(traditional) ? optimized : traditional
  };
}

export function refresh(state) {
  if (!state || !Array.isArray(state.bins) || !Array.isArray(state.alerts)) {
    throw new TypeError('State must contain bins and alerts arrays.');
  }

  for (const bin of state.bins) {
    const conditions = [
      ['Llenado crítico', bin.fill >= 95, 'Alta'],
      ['Sensor desconectado', !bin.online, 'Alta'],
      ['Batería baja', bin.battery < 20, 'Media']
    ];

    for (const [type, condition, priority] of conditions) {
      const active = state.alerts.find(
        alert => alert.bin === bin.id && alert.type === type && !alert.cleared
      );

      if (condition && !active) {
        state.alerts.unshift({
          id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`,
          bin: bin.id,
          type,
          priority,
          done: false,
          time: new Date().toISOString()
        });
      } else if (!condition && active) {
        active.done = true;
        active.cleared = true;
      }
    }
  }

  return state;
}

export function deposit(state, id, fill = 12, weight = 6) {
  if (!state || !Array.isArray(state.bins) || !Array.isArray(state.alerts)) return false;
  if (!isFiniteNumber(fill) || fill <= 0 || !isFiniteNumber(weight) || weight <= 0) return false;

  const bin = state.bins.find(item => item.id === id);
  if (
    !bin ||
    bin.online !== true ||
    !isFiniteNumber(bin.fill) ||
    bin.fill < 0 ||
    bin.fill >= 100 ||
    !isFiniteNumber(bin.weight) ||
    bin.weight < 0
  ) {
    return false;
  }

  const requestedFill = roundTenth(fill);
  if (requestedFill <= 0) return false;

  const acceptedFill = roundTenth(Math.min(requestedFill, 100 - bin.fill));
  const acceptedWeight = roundKilograms(weight * (acceptedFill / requestedFill));
  if (acceptedWeight <= 0) return false;
  bin.fill = Math.min(100, roundTenth(bin.fill + acceptedFill));
  bin.weight = roundKilograms(bin.weight + acceptedWeight);
  bin.updated = new Date().toISOString();
  refresh(state);
  return true;
}

export function collect(state, id) {
  if (
    !state ||
    !Array.isArray(state.bins) ||
    !Array.isArray(state.alerts) ||
    !Array.isArray(state.logs)
  ) {
    return false;
  }

  const bin = state.bins.find(item => item.id === id);
  if (
    !bin ||
    !isFiniteNumber(bin.weight) ||
    bin.weight <= 0 ||
    !isFiniteNumber(bin.fill) ||
    bin.fill <= 0 ||
    bin.fill > 100 ||
    !isFiniteNumber(state.stock) ||
    state.stock < 0 ||
    !isFiniteNumber(state.collected) ||
    state.collected < 0 ||
    !Number.isInteger(state.collections) ||
    state.collections < 0
  ) {
    return false;
  }

  const weight = roundKilograms(bin.weight);
  if (weight <= 0) return false;
  state.stock = roundKilograms(state.stock + weight);
  state.collected = roundKilograms(state.collected + weight);
  state.collections++;
  state.logs.unshift({ name: bin.name, kg: weight, date: new Date().toISOString() });
  bin.fill = 0;
  bin.weight = 0;
  bin.updated = new Date().toISOString();
  refresh(state);
  return true;
}

export function sortMaterial(state, material, amount = 3) {
  if (
    !state ||
    !state.sorted ||
    !materials.includes(material) ||
    !isFiniteNumber(amount) ||
    amount <= 0 ||
    !isFiniteNumber(state.stock) ||
    state.stock <= 0 ||
    !isFiniteNumber(state.sorted[material]) ||
    state.sorted[material] < 0
  ) {
    return 0;
  }

  const kilograms = roundKilograms(Math.min(state.stock, amount));
  if (kilograms <= 0) return 0;

  state.stock = Math.max(0, roundKilograms(state.stock - kilograms));
  state.sorted[material] = roundKilograms(state.sorted[material] + kilograms);
  return kilograms;
}
