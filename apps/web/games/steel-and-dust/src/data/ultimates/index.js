import { heroById } from '../heroes.js';
import { ABSOLUTE_ZERO } from './absolute-zero.js';
import { MARCH_OF_THE_BAYON } from './march-of-the-bayon.js';
import { PHOENIX_PYRE } from './phoenix-pyre.js';
import { POUNDING_LION } from './pounding-lion.js';
import { STAMPEDE } from './stampede.js';
import { SWARM_NOVA } from './swarm-nova.js';
import { THORNWOOD } from './thornwood.js';

export const ULTIMATES = {
  moss: THORNWOOD,
  firefly: SWARM_NOVA,
  antler: STAMPEDE,
  blue: ABSOLUTE_ZERO,
  ember: PHOENIX_PYRE,
  bokator: POUNDING_LION,
  angkor: MARCH_OF_THE_BAYON,
};

export const ULT_START_STATES = new Set([
  'idle',
  'walk',
  'attack',
  'air',
  'dash',
  'charge',
  'squat',
]);

export function ultimateOf(heroId) {
  return ULTIMATES[heroById(heroId).id];
}
