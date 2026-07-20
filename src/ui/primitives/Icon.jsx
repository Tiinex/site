import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faArrowRight,
  faArrowUpFromBracket,
  faCircleNodes,
  faCirclePlus,
  faCloudArrowUp,
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
  faShareNodes,
  faSitemap,
  faXmark
} from '@fortawesome/free-solid-svg-icons';
import { faCircle, faFileLines } from '@fortawesome/free-regular-svg-icons';

const ICONS = {
  add: faCirclePlus,
  close: faXmark,
  create: faCirclePlus,
  drop: faCloudArrowUp,
  fileUpload: faFileArrowUp,
  folderOpen: faFolderOpen,
  folderPlus: faFolderPlus,
  github: faCircleNodes,
  handPointer: faHandPointer,
  help: faQuestion,
  home: faHouse,
  local: faFolder,
  manualFiles: faFileLines,
  multiverse: faCompass,
  next: faArrowRight,
  noNodes: faCircle,
  open: faFileLines,
  previous: faArrowLeft,
  search: faMagnifyingGlass,
  share: faShareNodes,
  source: faLink,
  tree: faSitemap,
  upload: faArrowUpFromBracket,
  workspace: faCircleNodes
};

export function Icon({ name, className = '', ...props }) {
  const icon = ICONS[name] || faCircle;
  return <FontAwesomeIcon className={`tx-icon ${className}`.trim()} icon={icon} aria-hidden="true" {...props} />;
}
