import { AXE } from './axe/index.js';
import { FISTS } from './fists/index.js';
import { SPEAR } from './spear/index.js';
import { SWORD } from './sword/index.js';

export const WEAPONS = { fists: FISTS, sword: SWORD, spear: SPEAR, axe: AXE };

export const WEAPON_IDS = Object.keys(WEAPONS);
