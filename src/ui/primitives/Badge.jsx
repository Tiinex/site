import React from 'react';

export function Badge({ children, tone = 'default', className = '', ...props }) {
  return <span {...props} className={`tx-badge tx-badge-${tone} ${className}`.trim()}>{children}</span>;
}
