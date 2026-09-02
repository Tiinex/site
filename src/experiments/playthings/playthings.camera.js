export function fitPlaythingsCamera(worldWidth = 1, worldHeight = 1) {
  const width = Math.max(1, Number(worldWidth || 1));
  const height = Math.max(1, Number(worldHeight || 1));
  return Object.freeze({ worldWidth: width, worldHeight: height, x: 0, y: 0, width, height, zoom: 1 });
}

export function fitPlaythingsCameraToBounds(camera = {}, bounds = null, viewportWidth = 1, viewportHeight = 1) {
  const current = normalizeCamera(camera);
  if (!bounds) return fitPlaythingsCamera(current.worldWidth, current.worldHeight);
  const bw = clamp(Number(bounds.width || 1), 1, current.worldWidth);
  const bh = clamp(Number(bounds.height || 1), 1, current.worldHeight);
  const vw = Math.max(1, Number(viewportWidth || 1));
  const vh = Math.max(1, Number(viewportHeight || 1));
  const aspect = vw / vh;
  let width = bw;
  let height = bh;
  if (width / height < aspect) width = height * aspect;
  else height = width / aspect;
  width = Math.min(current.worldWidth, Math.max(1, width));
  height = Math.min(current.worldHeight, Math.max(1, height));
  const centerX = Number(bounds.x || 0) + bw / 2;
  const centerY = Number(bounds.y || 0) + bh / 2;
  const zoom = Math.min(8, Math.max(1, Math.min(current.worldWidth / width, current.worldHeight / height)));
  return clampCamera({ ...current, width, height, zoom, x: centerX - width / 2, y: centerY - height / 2 });
}

export function centerPlaythingsCamera(camera = {}, point = null) {
  const current = normalizeCamera(camera);
  if (!point) return current;
  return clampCamera({ ...current, x: Number(point.x || 0) - current.width / 2, y: Number(point.y || 0) - current.height / 2 });
}

export function panPlaythingsCamera(camera = {}, deltaX = 0, deltaY = 0) {
  const next = normalizeCamera(camera);
  return clampCamera({ ...next, x: next.x + Number(deltaX || 0), y: next.y + Number(deltaY || 0) });
}

export function zoomPlaythingsCamera(camera = {}, factor = 1, anchorX = 0.5, anchorY = 0.5) {
  const current = normalizeCamera(camera);
  const nextZoom = clamp(Number(current.zoom || 1) * Number(factor || 1), 1, 8);
  const nextWidth = current.worldWidth / nextZoom;
  const nextHeight = current.worldHeight / nextZoom;
  const ax = clamp(Number(anchorX || 0), 0, 1);
  const ay = clamp(Number(anchorY || 0), 0, 1);
  const worldAnchorX = current.x + current.width * ax;
  const worldAnchorY = current.y + current.height * ay;
  return clampCamera({ ...current, width: nextWidth, height: nextHeight, zoom: nextZoom, x: worldAnchorX - nextWidth * ax, y: worldAnchorY - nextHeight * ay });
}

export function playthingsCameraViewBox(camera = {}) {
  const next = normalizeCamera(camera);
  return `${round(next.x)} ${round(next.y)} ${round(next.width)} ${round(next.height)}`;
}

export function playthingsCameraKeyboardDelta(camera = {}, key = '') {
  const next = normalizeCamera(camera);
  const stepX = next.width * 0.075;
  const stepY = next.height * 0.075;
  if (String(key).toLowerCase() === 'a') return { x: -stepX, y: 0 };
  if (String(key).toLowerCase() === 'd') return { x: stepX, y: 0 };
  if (String(key).toLowerCase() === 'w') return { x: 0, y: -stepY };
  if (String(key).toLowerCase() === 's') return { x: 0, y: stepY };
  return { x: 0, y: 0 };
}

function normalizeCamera(camera = {}) {
  const worldWidth = Math.max(1, Number(camera.worldWidth || camera.width || 1));
  const worldHeight = Math.max(1, Number(camera.worldHeight || camera.height || 1));
  const width = Math.min(worldWidth, Math.max(1, Number(camera.width || worldWidth)));
  const height = Math.min(worldHeight, Math.max(1, Number(camera.height || worldHeight)));
  const zoom = clamp(Number(camera.zoom || worldWidth / width), 1, 8);
  return { worldWidth, worldHeight, zoom, width, height, x: Number(camera.x || 0), y: Number(camera.y || 0) };
}
function clampCamera(camera) {
  const x = clamp(camera.x, 0, Math.max(0, camera.worldWidth - camera.width));
  const y = clamp(camera.y, 0, Math.max(0, camera.worldHeight - camera.height));
  return Object.freeze({ ...camera, x, y });
}
function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
function round(value) { return Math.round(Number(value || 0) * 100) / 100; }
