import { heroById } from '../heroes.js';
import { ABSOLUTE_ZERO } from './absolute-zero.js';
import { STAMPEDE } from './stampede.js';
import { SWARM_NOVA } from './swarm-nova.js';
import { THORNWOOD } from './thornwood.js';

export const ULTIMATES = {
  moss: THORNWOOD,
  firefly: SWARM_NOVA,
  antler: STAMPEDE,
  blue: ABSOLUTE_ZERO,
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
