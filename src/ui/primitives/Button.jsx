import React from 'react';
import { Icon } from './Icon.jsx';

export function Button({ children, icon, variant = 'default', shape = '', className = '', type = 'button', ...props }) {
  const classes = ['tx-button', `tx-button-${variant}`, shape ? `tx-button-${shape}` : '', className].filter(Boolean).join(' ');
  return (
    <button type={type} className={classes} {...props}>
      {icon ? <Icon name={icon} /> : null}
      {children ? <span>{children}</span> : null}
    </button>
  );
}
