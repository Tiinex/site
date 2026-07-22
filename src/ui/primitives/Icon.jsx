import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faArrowRight,
  faArrowUpFromBracket,
  faCircleNodes,
  faCircleCheck,
  faCirclePlus,
  faCloudArrowUp,
  faCodeBranch,
  faCompass,
  faFileArrowUp,
  faFolder,
  faFolderOpen,
  faFolderPlus,
  faHandPointer,
  faHouse,
  faLink,
  faMagnifyingGlass,
  faQuestion,
  faQuoteRight,
  faShareNodes,
  faSitemap,
  faTriangleExclamation,
  faXmark
} from '@fortawesome/free-solid-svg-icons';
import { faCircle, faFileLines } from '@fortawesome/free-regular-svg-icons';

const ICONS = {
  add: faCirclePlus,
  archive: faFolder,
  check: faCircleCheck,
  asset: faFileLines,
  close: faXmark,
  continue: faCodeBranch,
  create: faCirclePlus,
  drop: faCloudArrowUp,
  faCodeBranch,
  fileUpload: faFileArrowUp,
  folderOpen: faFolderOpen,
  folderPlus: faFolderPlus,
  github: faCircleNodes,
  handPointer: faHandPointer,
  help: faQuestion,
  faQuoteRight,
  home: faHouse,
  lineage: faCodeBranch,
  local: faFolder,
  manualFiles: faFileLines,
  multiverse: faCompass,
  next: faArrowRight,
  noNodes: faCircle,
  open: faFileLines,
  previous: faArrowLeft,
  reference: faQuoteRight,
  search: faMagnifyingGlass,
  share: faShareNodes,
  shareNodes: faShareNodes,
  source: faLink,
  tree: faSitemap,
  upload: faArrowUpFromBracket,
  warning: faTriangleExclamation,
  workspace: faCircleNodes
};

export function Icon({ name, className = '', ...props }) {
  const icon = ICONS[name] || faCircle;
  return <FontAwesomeIcon className={`tx-icon ${className}`.trim()} icon={icon} aria-hidden="true" {...props} />;
}
