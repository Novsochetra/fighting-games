import { CLASSIC } from './classic.js';

export const SKINS = { classic: CLASSIC };

export function skinLayout(orientation) {
  return SKINS.classic.layouts[orientation];
}
