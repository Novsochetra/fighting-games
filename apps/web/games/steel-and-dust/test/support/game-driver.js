import { defaultSettings } from '../../src/data/settings.js';
import { canAffordHeavy } from '../../src/sim/combat/ult-bar.js';
import { createGame } from '../../src/sim/create-game.js';
import { isFlat } from '../../src/sim/fighters/terrain-motion.js';
import { continueRun, resumePlay, selectMission, startPlay } from '../../src/sim/stage/flow.js';
import { spawnEnemy } from '../../src/sim/stage/spawn-enemy.js';
import { isWall, waterAt } from '../../src/sim/stage/terrain.js';
import { tick } from '../../src/sim/tick.js';
import { snapshotGame } from './snapshot.js';

const ACTION_FOR_KEY = {
  L: 'light',
  K: 'heavy',
  w1: 'weapon1',
  w2: 'weapon2',
  w3: 'weapon3',
  w4: 'weapon4',
  fill: 'fillUlt',
};
const MENU_ACTIONS = { play: startPlay, resume: resumePlay, continue: continueRun };
const LOOK_AHEAD = 6;

// the hero is on his feet at the face of a rise too tall to walk up, or at the edge of a moat;
// never on a flat road
function wallAhead(game) {
  const { player, terrain } = game;
  if (isFlat(terrain) || player.airborne) {
    return false;
  }
  const aheadX = player.x + player.facing * LOOK_AHEAD;

  return isWall(terrain, aheadX, player.y) || waterAt(terrain, aheadX) !== null;
}

export function createScenarioGame(hero, mission = 0) {
  const game = createGame({
    settings: { ...defaultSettings(false), training: true, aim: true, ...(hero && { hero }) },
    device: { coarsePointer: false, touchUsed: false },
    records: { bestCombo: 0, bestScore: 0 },
    hintsSeen: {},
    io: {},
  });
  selectMission(game, mission);
  return game;
}

export function createGameDriver(game, renderFrame) {
  const { held, pressed } = game.input;
  const tapped = [];
  const action = (key) => ACTION_FOR_KEY[key] ?? key;
  return {
    press(key) {
      pressed[action(key)] = true;
      held[action(key)] = true;
    },
    release(key) {
      held[action(key)] = false;
    },
    tap(key) {
      this.press(key);
      tapped.push(key);
    },
    act: (name) => MENU_ACTIONS[name](game),
    spawn: (kind, side) => spawnEnemy(game, kind, side),
    tick: () => tick(game),
    afterTick() {
      for (const key of tapped.splice(0)) {
        held[action(key)] = false;
      }
    },
    observe: () => ({
      mode: game.mode,
      meter: game.ultMeter,
      canHeavy: canAffordHeavy(game),
      player: { x: game.player.x, y: game.player.y, state: game.player.state },
      enemies: game.fighters
        .filter((fighter) => fighter.side === 'enemy')
        .map((fighter) => ({ x: fighter.x, state: fighter.state })),
      wallAhead: wallAhead(game),
    }),
    snapshot: () => snapshotGame(game),
    render: () => (renderFrame ? renderFrame(game) : null),
  };
}
