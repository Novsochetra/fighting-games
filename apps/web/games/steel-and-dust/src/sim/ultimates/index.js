import { heroById } from '../../data/heroes.js';
import { ultimateOf } from '../../data/ultimates/index.js';
import { themeOf } from '../fighters/hero-colors.js';
import { shake } from '../fx/camera-fx.js';
import { addSparks } from '../fx/particles.js';
import { runAbsoluteZero } from './absolute-zero.js';
import { runThousandCuts } from './thousand-cuts.js';
import { runPhoenixPyre } from './phoenix-pyre.js';
import { runPoundingLion } from './pounding-lion.js';
import { runStampede } from './stampede.js';
import { runSwarmNova } from './swarm-nova.js';
import { runThornwood } from './thornwood.js';

const RUN_BY_HERO = {
  moss: runThornwood,
  firefly: runSwarmNova,
  antler: runStampede,
  blue: runAbsoluteZero,
  ember: runPhoenixPyre,
  bokator: runPoundingLion,
  angkor: runThousandCuts,
};

export function startUlt(game, player) {
  Object.assign(player, { state: 'ult', stateTime: 0, move: null, hitboxActive: false });
  player.trail.length = 0;
  Object.assign(player, { vx: 0, vy: 0, invincible: 999, ultFrame: ['ult', 0] });
  game.ultMeter = 0;
  game.ultFreeze = ultimateOf(game.settings.hero).intro;
  game.io.sfx('ult');
  shake(game, 2, 12);
  const color = themeOf(game).ult.edge;
  addSparks(game, { x: player.x, y: player.y - 24, count: 16, color, speed: 3.4 });
}

// each hero runs its own ultimate; the world stands still while its cut-in plays
export function updateUlt(game, player) {
  const time = ++player.stateTime;
  RUN_BY_HERO[heroById(game.settings.hero).id](game, player, time);
}
