import { useEffect, useRef, useState } from 'react';
import { fitPlaythingsCamera, panPlaythingsCamera, playthingsCameraKeyboardDelta, playthingsCameraViewBox, zoomPlaythingsCamera } from './playthings.camera.js';

export function usePlaythingsCamera(worldWidth, worldHeight) {
  const [camera, setCamera] = useState(() => fitPlaythingsCamera(worldWidth, worldHeight));
  const dragRef = useRef(null);

  useEffect(() => { setCamera(fitPlaythingsCamera(worldWidth, worldHeight)); }, [worldWidth, worldHeight]);
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const tag = String(event.target?.tagName || '').toLowerCase();
      if (['input', 'textarea', 'select', 'button'].includes(tag)) return;
      const delta = playthingsCameraKeyboardDelta(camera, event.key);
      if (!delta.x && !delta.y) return;
      event.preventDefault();
      setCamera((current) => panPlaythingsCamera(current, delta.x, delta.y));
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [camera]);

  function onPointerDown(event) {
    if (event.button !== 0) return;
    dragRef.current = { x: event.clientX, y: event.clientY, width: event.currentTarget.clientWidth || 1, height: event.currentTarget.clientHeight || 1 };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }
  function onPointerMove(event) {
    const drag = dragRef.current;
    if (!drag) return;
    const dx = event.clientX - drag.x;
    const dy = event.clientY - drag.y;
    dragRef.current = { ...drag, x: event.clientX, y: event.clientY };
    setCamera((current) => panPlaythingsCamera(current, -(dx / Math.max(1, drag.width)) * current.width, -(dy / Math.max(1, drag.height)) * current.height));
  }
  function onPointerUp(event) {
    dragRef.current = null;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  }
  function onWheel(event) {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    const anchorX = (event.clientX - rect.left) / Math.max(1, rect.width);
    const anchorY = (event.clientY - rect.top) / Math.max(1, rect.height);
    const factor = event.deltaY < 0 ? 1.18 : 1 / 1.18;
    setCamera((current) => zoomPlaythingsCamera(current, factor, anchorX, anchorY));
  }
  function reset() { setCamera(fitPlaythingsCamera(worldWidth, worldHeight)); }

  return Object.freeze({
    camera,
    viewBox: playthingsCameraViewBox(camera),
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp, onWheel },
    reset
  });
}
