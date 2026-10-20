import { COLORS } from '../art/colors.js';
import { VIEW_WIDTH } from '../config.js';
import { isLastMission } from '../data/missions/index.js';
import { clamp, randomBetween } from '../lib/math.js';
import { endCombo } from './combat/combo.js';
import { resolveHits } from './combat/resolve-hits.js';
import { arenaBounds } from './fighters/arena-bounds.js';
import { separateFighters } from './fighters/separate.js';
import { followFloor } from './fighters/terrain-motion.js';
import { updateFighter } from './fighters/update-fighter.js';
import { shedHeroAura } from './fx/hero-aura.js';
import { updateEffects } from './fx/update-effects.js';
import { updateProjectiles } from './hazards/projectiles.js';
import { updateShockwaves } from './hazards/shockwaves.js';
import { updateHints } from './hints.js';
import { expireBuffer } from './input/read-input.js';
import { updatePickups } from './items/pickups.js';
import { updateCamera } from './stage/camera.js';
import { enterNextMission } from './stage/flow.js';
import { missionOf } from './stage/mission.js';
import { updateSummons } from './summons/update-summons.js';
import { BANNER_FOREVER } from './stage/stage-clear.js';
import { updateZones } from './stage/zones.js';

function updateWorld(game) {
  for (const fighter of game.fighters) {
    updateFighter(game, fighter);
  }
  resolveHits(game);
  separateFighters(game.fighters, game.terrain);
  updateShockwaves(game);
  updateProjectiles(game);
  updateSummons(game);
  updatePickups(game);
  updateEffects(game);
  for (const fighter of game.fighters) {
    const bounds = arenaBounds(game, fighter);
    if (!fighter.entering) {
      fighter.x = clamp(fighter.x, bounds.min, bounds.max);
    }
    followFloor(game.terrain, fighter);
  }
  game.fighters = game.fighters.filter((fighter) => !fighter.removed);
  if (game.boss && game.boss.removed) {
    game.boss = null;
  }
}

function advanceClearScreen(game) {
  if (!game.clearTime) {
    return;
  }
  game.clearTime++;
  if (game.clearTime <= 170 || game.mode !== 'play') {
    return;
  }
  if (isLastMission(game.missionIndex)) {
    game.mode = 'clear';
    game.io.sfx('clear');
  } else {
    enterNextMission(game);
  }
}

function countDown(game) {
  const { combo } = game;
  if (combo.timer > 0 && --combo.timer === 0) {
    endCombo(game);
  }
  if (combo.bump > 0) {
    combo.bump--;
  }
  if (game.goArrowTime > 0) {
    game.goArrowTime--;
  }
  if (game.banner && game.banner.time < BANNER_FOREVER && --game.banner.time <= 0) {
    game.banner = null;
  }
  advanceClearScreen(game);
}

// the wrecked tanks by the road still smoke from their engine deck
function tankSmoke(game) {
  if (game.tickCount % 7 !== 0) {
    return;
  }
  const middle = game.camera.x + VIEW_WIDTH / 2;
  for (const prop of missionOf(game).props) {
    if (prop.kind === 'tank' && Math.abs(prop.x + 30 - middle) < VIEW_WIDTH) {
      puffSmoke(game, { x: prop.x + 30, y: prop.y - 38 });
    }
  }
}

function puffSmoke(game, { x, y }) {
  game.particles.push({
    kind: 'dust',
    x: x + randomBetween(-2, 2),
    y,
    vx: randomBetween(-0.5, -0.1),
    vy: -randomBetween(0.3, 0.6),
    life: 60,
    maxLife: 60,
    size: 2,
    color: COLORS.smoke,
  });
}

// during the ultimate's freeze only the hero moves
export function simulateStep(game) {
  expireBuffer(game.input.buffer);
  if (game.ultFreeze > 0) {
    game.ultFreeze--;
    updateFighter(game, game.player);
    updateEffects(game);
    return;
  }
  if (game.mode === 'play' && !game.clearTime) {
    game.playTime++;
  }
  updateZones(game);
  updateWorld(game);
  updateCamera(game);
  updateHints(game);
  countDown(game);
  tankSmoke(game);
  shedHeroAura(game);
}
