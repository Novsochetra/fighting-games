import { defaultSettings } from '../../src/data/settings.js';
import { createGame } from '../../src/sim/create-game.js';
import { continueRun, resumePlay, selectMission, startPlay } from '../../src/sim/stage/flow.js';
import { spawnEnemy } from '../../src/sim/stage/spawn-enemy.js';
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

export function createScenarioGame(hero, mission = 0) {
  const game = createGame({
    settings: { ...defaultSettings(false), training: true, aim: true, ...(hero && { hero }) },
    device: { coarsePointer: false, touchUsed: false },
    records: { bestCombo: 0, bestScore: 0, bestMission: 1 },
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
      player: { x: game.player.x, y: game.player.y, state: game.player.state },
      enemies: game.fighters
        .filter((fighter) => fighter.side === 'enemy')
        .map((fighter) => ({ x: fighter.x, state: fighter.state })),
    }),
    snapshot: () => snapshotGame(game),
    render: () => (renderFrame ? renderFrame(game) : null),
  };
}
