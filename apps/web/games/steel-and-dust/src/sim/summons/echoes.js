import { FX_COLORS } from '../../art/fx-colors.js';
import { POUNDING_LION } from '../../data/ultimates/pounding-lion.js';
import { shake } from '../fx/camera-fx.js';
import { addSparks } from '../fx/particles.js';
import { groundAt } from '../stage/terrain.js';
import { addBurst } from './bursts.js';
import { strikeTarget } from './strike.js';

const { echoDelay, echo: ECHO_HIT } = POUNDING_LION;
// ticks a woken echo takes to flare into gold before the lion takes its place
export const ECHO_FLARE_TICKS = 4;
// an echo nothing wakes melts away after this long
const ECHO_LIFE = 600;

// a gold echo of the hero left where a blow landed, holding the blow; it strikes the same raider
// again `echoDelay` ticks later, then waits for the ultimate to wake it
export function leaveEcho(game, { x, y, facing, sprite, target }) {
  game.summons.push({
    kind: 'echo',
    hero: game.settings.hero,
    x,
    y,
    direction: facing,
    sprite,
    target,
    side: 'player',
    time: 0,
    strikeAt: echoDelay,
    wakeAt: null,
  });
}

function strikeAgain(game, echo) {
  const { target } = echo;
  const x = echo.x + echo.direction * 16;
  const y = echo.y - 22;
  if (target && strikeTarget(game, echo, { target, move: ECHO_HIT })) {
    addBurst(game, { sprite: 'strike', x: target.x, y: target.y - 18, scale: 0.6 });
  } else {
    addSparks(game, { x, y, count: 5, color: FX_COLORS.lionGold, speed: 2.2 });
  }
  shake(game, 1, 4);
  game.io.sfx('echo', false, { x: echo.x });
}

// the echo flares and bursts into gold as the lion rises out of it
function burstIntoGold(game, echo) {
  addSparks(game, { x: echo.x, y: echo.y - 20, count: 12, color: FX_COLORS.lionGold, speed: 3 });
  addBurst(game, { sprite: 'awaken', x: echo.x, y: groundAt(game.terrain, echo.x), scale: 0.8 });
}

// it wakes in step with a lion released now with `delay`, on the tick that lion starts to rise
export function wakeEcho(echo, delay) {
  echo.wakeAt = echo.time + delay + 1;
}

export function updateEcho(game, echo) {
  if (echo.time === echo.strikeAt) {
    strikeAgain(game, echo);
  }
  if (echo.wakeAt !== null && echo.time === echo.wakeAt) {
    burstIntoGold(game, echo);
  }
  const flared = echo.wakeAt !== null && echo.time >= echo.wakeAt + ECHO_FLARE_TICKS;
  echo.done = flared || echo.time >= ECHO_LIFE;
}
