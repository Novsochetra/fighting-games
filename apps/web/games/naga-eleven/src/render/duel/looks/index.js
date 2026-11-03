import { APSARA } from './apsara.js';
import { BAYON } from './bayon.js';
import { BELLY_LOOK } from './belly.js';
import { CHARGE } from './charge.js';
import { ECLIPSE } from './eclipse.js';
import { ELEPHANT } from './elephant.js';
import { FLYING_NAGA } from './flying-naga.js';
import { GARUDA } from './garuda.js';
import { HANUMAN } from './hanuman.js';
import { IRON } from './iron.js';
import { KITE } from './kite.js';
import { KOUPREY } from './kouprey.js';
import { LIGHTNING } from './lightning.js';
import { MEKONG } from './mekong.js';
import { MIRROR } from './mirror.js';
import { MOON_LOOK } from './moon.js';
import { MOUNTAIN } from './mountain.js';
import { NAGA } from './naga.js';
import { PANTHER } from './panther.js';
import { PLAIN } from './plain.js';
import { ROCKET } from './rocket.js';
import { SAMBA } from './samba.js';
import { SEVEN_NAGA } from './seven-naga.js';
import { STEEL } from './steel.js';
import { STORM_GARUDA } from './storm-garuda.js';
import { SWORD } from './sword.js';
import { TONLE_SAP } from './tonle-sap.js';
import { TWIN_NAGA } from './twin-naga.js';
import { WALL } from './wall.js';
import { WAVE } from './wave.js';

// each look draws in the layers it needs: `back` behind the figures, `behind` behind the
// defender, `figures` beside the attacker, `front` over them, `guard` at the defender, `attacker`
// and `ball` to move them, and `band` in its cut-in's band behind the name
const LOOKS = {
  naga: NAGA,
  'seven-naga': SEVEN_NAGA,
  'twin-naga': TWIN_NAGA,
  garuda: GARUDA,
  hanuman: HANUMAN,
  sword: SWORD,
  moon: MOON_LOOK,
  mirror: MIRROR,
  charge: CHARGE,
  mountain: MOUNTAIN,
  wall: WALL,
  iron: IRON,
  samba: SAMBA,
  rocket: ROCKET,
  plain: PLAIN,
  bayon: BAYON,
  elephant: ELEPHANT,
  apsara: APSARA,
  kite: KITE,
  kouprey: KOUPREY,
  panther: PANTHER,
  steel: STEEL,
  belly: BELLY_LOOK,
  mekong: MEKONG,
  'tonle-sap': TONLE_SAP,
  wave: WAVE,
  lightning: LIGHTNING,
  'flying-naga': FLYING_NAGA,
  'storm-garuda': STORM_GARUDA,
  eclipse: ECLIPSE,
};

export const LOOK_NAMES = Object.keys(LOOKS);

export const lookOf = (look) => LOOKS[look] ?? PLAIN;
