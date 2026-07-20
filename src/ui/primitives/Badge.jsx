import React from 'react';

export function Badge({ children, tone = 'default', className = '' }) {
  return <span className={`tx-badge tx-badge-${tone} ${className}`.trim()}>{children}</span>;
}
