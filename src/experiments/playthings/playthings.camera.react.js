import { useCallback, useEffect, useRef, useState } from 'react';
import { centerPlaythingsCamera, fitPlaythingsCamera, fitPlaythingsCameraToBounds, panPlaythingsCamera, playthingsCameraKeyboardDelta, playthingsCameraViewBox, zoomPlaythingsCamera } from './playthings.camera.js';

export function usePlaythingsCamera(worldWidth, worldHeight, { locked = false } = {}) {
  const [camera, setCamera] = useState(() => fitPlaythingsCamera(worldWidth, worldHeight));
  const dragRef = useRef(null);
  const viewportRef = useRef(null);

  useEffect(() => { setCamera(fitPlaythingsCamera(worldWidth, worldHeight)); }, [worldWidth, worldHeight]);
  useEffect(() => {
    const onKeyDown = (event) => {
      if (locked || event.altKey || event.ctrlKey || event.metaKey) return;
      const tag = String(event.target?.tagName || '').toLowerCase();
      if (['input', 'textarea', 'select', 'button'].includes(tag)) return;
      const delta = playthingsCameraKeyboardDelta(camera, event.key);
      if (!delta.x && !delta.y) return;
      event.preventDefault();
      setCamera((current) => panPlaythingsCamera(current, delta.x, delta.y));
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [camera, locked]);

  const setViewport = useCallback((node) => { viewportRef.current = node; }, []);

  function onPointerDown(event) {
    if (locked || event.button !== 0) return;
    dragRef.current = { x: event.clientX, y: event.clientY, width: event.currentTarget.clientWidth || 1, height: event.currentTarget.clientHeight || 1 };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }
  function onPointerMove(event) {
    if (locked) return;
    const drag = dragRef.current;
    if (!drag) return;
    const dx = event.clientX - drag.x, dy = event.clientY - drag.y;
    dragRef.current = { ...drag, x: event.clientX, y: event.clientY };
    setCamera((current) => panPlaythingsCamera(current, -(dx / Math.max(1, drag.width)) * current.width, -(dy / Math.max(1, drag.height)) * current.height));
  }
  function onPointerUp(event) { dragRef.current = null; event.currentTarget.releasePointerCapture?.(event.pointerId); }
  function onWheel(event) {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const anchorX = locked ? .5 : (event.clientX - rect.left) / Math.max(1, rect.width);
    const anchorY = locked ? .5 : (event.clientY - rect.top) / Math.max(1, rect.height);
    const factor = event.deltaY < 0 ? 1.16 : 1 / 1.16;
    setCamera((current) => zoomPlaythingsCamera(current, factor, anchorX, anchorY));
  }
  function fit(bounds = null) {
    const node = viewportRef.current;
    setCamera((current) => fitPlaythingsCameraToBounds(current, bounds, node?.clientWidth || 1, node?.clientHeight || 1));
  }
  function follow(point) { setCamera((current) => centerPlaythingsCamera(current, point)); }

  return Object.freeze({ camera, viewBox: playthingsCameraViewBox(camera), setViewport, handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp, onWheel }, fit, follow });
}
