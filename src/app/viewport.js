import { useEffect, useState } from 'react';

export function useViewportWidth() {
  const readWidth = () => {
    if (typeof window === 'undefined') return 0;
    return Math.floor(window.visualViewport?.width || window.innerWidth || 0);
  };
  const [width, setWidth] = useState(readWidth);
  useEffect(() => {
    const update = () => setWidth(readWidth());
    window.addEventListener('resize', update);
    window.visualViewport?.addEventListener?.('resize', update);
    return () => {
      window.removeEventListener('resize', update);
      window.visualViewport?.removeEventListener?.('resize', update);
    };
  }, []);
  return width;
}

export function shouldPageWorkspaces(workspaceCount, viewportWidth) {
  const count = Number(workspaceCount || 0);
  if (count <= 1) return false;
  const width = Number(viewportWidth || 0) || 1280;
  const minimumColumnWidth = width <= 760 ? 320 : 540;
  const workspaceGap = width <= 760 ? 10 : 16;
  const safeViewportPadding = width <= 760 ? 18 : 32;
  const required = (count * minimumColumnWidth) + ((count - 1) * workspaceGap) + safeViewportPadding;
  return required > width;
}
