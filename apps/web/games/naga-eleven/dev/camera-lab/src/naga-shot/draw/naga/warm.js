import { MANIFEST } from '../../tracks/naga.js';
import { canBake } from '../bake.js';
import { auraBake } from './aura.js';
import { headBake } from './bakes.js';
import { LEVELS } from './dither.js';
import { GAPES } from './figure.js';
import { FLICKER_PHASES, flickerBake } from './flicker.js';
import { fadeInBake, revealBake, rimBake, silhouetteBake } from './looks.js';
import { lightBake, quantized } from './pour.js';

const [RISING, WHOLE] = GAPES.map((gape) => ({ size: MANIFEST.size, gape }));

const levels = Array.from({ length: LEVELS - 1 }, (_, i) => i + 1);

const phases = Array.from({ length: FLICKER_PHASES }, (_, i) => i);

const pourSizes = Array.from({ length: 7 }, (_, i) => quantized(MANIFEST.size) - i * 0.5);

const TASKS = [
  () => silhouetteBake(RISING),
  ...levels.map((level) => () => fadeInBake(RISING, level)),
  ...levels.map((level) => () => revealBake(RISING, level)),
  ...phases.map((phase) => () => flickerBake(RISING, phase)),
  ...phases.map((phase) => () => auraBake(RISING, phase)),
  ...phases.map((phase) => () => flickerBake(WHOLE, phase)),
  ...phases.map((phase) => () => auraBake(WHOLE, phase)),
  () => rimBake(WHOLE),
  ...pourSizes.map((size) => () => headBake({ size, gape: GAPES.at(-1) })),
  ...pourSizes.slice(-4).map((size) => () => lightBake({ size, gape: GAPES.at(-1) })),
];

let warmed = 0;

// what the manifestation needs is baked a piece a frame while the build-up plays before it, so
// the reveal never stalls on a bake
export function warmUp() {
  if (canBake() && warmed < TASKS.length) {
    TASKS[warmed]();
    warmed += 1;
  }
}
