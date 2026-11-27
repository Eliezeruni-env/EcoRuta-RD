const shapes = {
  brand: '<path d="M12 20v-7"/><path d="M12 14c-4.5 0-7-2.5-7-6 4.5 0 7 2 7 6Z"/><path d="M12 12c0-4 2.5-6 7-6 0 3.5-2.5 6-7 6Z"/>',
  dashboard: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="4" rx="1.5"/><rect x="13.5" y="10.5" width="7" height="10" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/>',
  container: '<path d="M5 5.5 12 3l7 2.5v13L12 21l-7-2.5z"/><path d="M5 5.5 12 8l7-2.5M12 8v13M8.5 6.8v13m7-13v13"/>',
  sensor: '<circle cx="12" cy="12" r="2.5"/><path d="M7.8 7.8a6 6 0 0 0 0 8.4m8.4 0a6 6 0 0 0 0-8.4M4.9 4.9a10 10 0 0 0 0 14.2m14.2 0a10 10 0 0 0 0-14.2"/>',
  route: '<circle cx="5" cy="18" r="2"/><circle cx="19" cy="6" r="2"/><path d="M7 18h3a3 3 0 0 0 3-3v-2a3 3 0 0 1 3-3h1"/>',
  sort: '<path d="M4 7h15m0 0-3-3m3 3-3 3M20 17H5m0 0 3-3m-3 3 3 3"/>',
  bell: '<path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',
  recycle: '<path d="M8 5h4.2a2 2 0 0 1 1.8 1l1.6 2.8"/><path d="m12.2 8.2 3.8.9.9-3.8"/><path d="m18 11.5-2.1 3.7a2 2 0 0 1-1.7 1h-3.1"/><path d="m13.2 13.5.1 3.9 3.7-1"/><path d="M9.8 17H7.7a2 2 0 0 1-1.7-3l1.5-2.6"/><path d="m9 13-2.8-2.7-2 3.3"/>',
  leaf: '<path d="M20 4c-8.5 0-14 3.5-14 10a6 6 0 0 0 6 6c6.5 0 9-5.5 8-16Z"/><path d="M4 21c3-5 7-8 12-11"/>',
  report: '<path d="M5 3.5h9l5 5v12H5z"/><path d="M14 3.5v5h5M8.5 17v-3m3.5 3v-6m3.5 6v-4"/>',
  settings: '<path d="M12 3.5v2m0 13v2m8.5-8.5h-2m-13 0h-2m14.5-6-1.4 1.4m-9.2 9.2L6 18m12 0-1.4-1.4m-9.2-9.2L6 6"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
  water: '<path d="M12 3s-6 7-6 11a6 6 0 0 0 12 0c0-4-6-11-6-11Z"/><path d="M9 15a3 3 0 0 0 3 3"/>',
  waves: '<path d="M3 8c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 3 2M3 13c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 3 2M3 18c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 3 2"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18"/>',
  scale: '<path d="M12 4v16m-7 0h14M7 7h10M7 7l-3 6h6L7 7Zm10 0-3 6h6l-3-6Z"/>',
  camera: '<path d="M4.5 7.5h3l2-3h5l2 3h3A2.5 2.5 0 0 1 22 10v9H2v-9a2.5 2.5 0 0 1 2.5-2.5Z"/><circle cx="12" cy="13" r="3.5"/>',
  box: '<path d="m12 3 8.5 4.5L12 12 3.5 7.5 12 3Z"/><path d="M3.5 7.5v9L12 21l8.5-4.5v-9M12 12v9"/>',
  package: '<path d="m12 3 8 4v10l-8 4-8-4V7l8-4Z"/><path d="m4 7 8 4 8-4m-8 4v10"/>',
  ban: '<circle cx="12" cy="12" r="8.5"/><path d="m6 6 12 12"/>',
  check: '<path d="m5 12 4.5 4.5L19 7"/>',
  play: '<path d="m9 6 10 6-10 6V6Z" fill="currentColor" stroke="none"/>'
};

export function icon(name, className = 'icon') {
  const shape = shapes[name];
  if (!shape) throw new Error(`Unknown icon: ${name}`);
  return `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${shape}</svg>`;
}
