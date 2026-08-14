import { useEffect, useState } from 'react';

export { shouldPageWorkspaces } from './workspaceWindow.js';

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
