import { updateFighter } from './fighters/update-fighter.js';
import { updateEffects } from './fx/update-effects.js';
import { handleGlobalKeys } from './input/global-keys.js';
import { clearPressed } from './input/create-input.js';
import { readInput, repeatHeldAttack } from './input/read-input.js';
import { simulateStep } from './step.js';

const RUNNING_MODES = new Set(['play', 'over', 'clear']);

// slow motion runs one tick in three
function runWorld(game) {
  let run = true;
  if (game.slowMotion > 0) {
    game.slowMotion--;
    run = game.slowMotion % 3 === 0;
  }
  if (!run) {
    return;
  }
  simulateStep(game);
  const camera = game.camera;
  if (camera.shakeTime > 0 && --camera.shakeTime === 0) {
    camera.shakeAmount = 0;
  }
}

export function beginTick(game) {
  game.tickCount++;
}

export function runTick(game) {
  repeatHeldAttack(game);
  readInput(game);
  handleGlobalKeys(game);
  if (game.flashTime > 0) {
    game.flashTime--;
  }
  if (game.slashBandTime > 0) {
    game.slashBandTime--;
  }
  if (game.mode === 'title') {
    updateFighter(game, game.player);
    updateEffects(game);
  } else if (RUNNING_MODES.has(game.mode)) {
    runWorld(game);
  }
  clearPressed(game.input);
}

export function tick(game) {
  beginTick(game);
  runTick(game);
}
