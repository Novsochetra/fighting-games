import { COLORS } from '../../art/colors.js';
import { CHARGE_LEVEL1, CHARGE_MAX, CHARGE_TAP, DASH_TICKS } from '../../config.js';
import { randomBetween } from '../../lib/math.js';
import { commitScore } from '../combat/combo.js';
import { shake } from '../fx/camera-fx.js';
import { addSparks } from '../fx/particles.js';
import { updateUlt } from '../ultimates/index.js';
import { jump } from './actions.js';
import { themeOf } from './hero-colors.js';
import { updateAttack } from './attack-state.js';

function updateHurt(_game, fighter) {
  if (--fighter.stateTime <= 0) {
    fighter.state = 'idle';
  }
}

function updateDown(_game, fighter) {
  fighter.stateTime++;
  if (fighter.stateTime >= (fighter.side === 'player' ? 34 : 44)) {
    fighter.state = 'getup';
    fighter.stateTime = 0;
  }
}

function updateGetup(_game, fighter) {
  fighter.stateTime++;
  if (fighter.stateTime < 16) {
    return;
  }
  Object.assign(fighter, {
    state: 'idle',
    juggleCount: 0,
    groundBounceUsed: false,
    wallBounced: false,
  });
  if (fighter.side === 'player') {
    fighter.invincible = 50;
  } else {
    fighter.ai.cooldown = Math.max(fighter.ai.cooldown, 30);
  }
}

function updateKnockedOut(game, fighter) {
  if (fighter.airborne) {
    return;
  }
  fighter.stateTime++;
  if (fighter.side === 'enemy' && fighter.stateTime > 70) {
    fighter.removed = true;
  }
  if (fighter.side === 'player' && fighter.stateTime > 80 && game.mode === 'play') {
    game.mode = 'over';
    commitScore(game);
  }
}

// a fast burst that eases down to walking pace, so a dash flows straight into a walk
function updateDash(_game, fighter) {
  fighter.stateTime++;
  const remaining = 1 - Math.min(1, fighter.stateTime / DASH_TICKS);
  fighter.vx = fighter.facing * (1.7 + 3.2 * remaining * remaining);
  if (fighter.airborne && fighter.stateTime < 12) {
    fighter.vy = 0;
  }
  if (fighter.stateTime >= DASH_TICKS) {
    fighter.state = fighter.airborne ? 'air' : 'idle';
  }
}

function updateSquat(game, fighter) {
  if (++fighter.stateTime >= 3) {
    jump(game, fighter, { vy: -5.8, vx: fighter.jumpDirection * 1.7 });
  }
}

function chargeColor(game, time) {
  if (time >= CHARGE_MAX) {
    return COLORS.gold;
  }
  const theme = themeOf(game);
  return time >= CHARGE_LEVEL1 ? theme.glow : theme.glowDim;
}

function updateCharge(game, fighter) {
  const time = ++fighter.stateTime;
  if (time === CHARGE_LEVEL1) {
    game.io.sfx('chargeLevel1');
    addSparks(game, { x: fighter.x, y: fighter.y - 20, count: 8, color: COLORS.cyan, speed: 2.4 });
  }
  if (time === CHARGE_MAX) {
    game.io.sfx('chargeMax');
    addSparks(game, { x: fighter.x, y: fighter.y - 20, count: 14, color: COLORS.gold, speed: 3.2 });
    shake(game, 1, 4);
  }
  if (time >= CHARGE_TAP && time % 3 === 0) {
    game.particles.push({
      kind: 'mote',
      x: fighter.x + randomBetween(-10, 10),
      y: fighter.y - randomBetween(0, 8),
      vx: 0,
      vy: -randomBetween(0.6, 1.4),
      life: 22,
      maxLife: 22,
      color: chargeColor(game, time),
    });
  }
}

const UPDATE_BY_STATE = {
  attack: updateAttack,
  hurt: updateHurt,
  down: updateDown,
  getup: updateGetup,
  ko: updateKnockedOut,
  dash: updateDash,
  squat: updateSquat,
  charge: updateCharge,
  ult: updateUlt,
};

export function updateState(game, fighter) {
  const update = UPDATE_BY_STATE[fighter.state];
  if (update) {
    update(game, fighter);
  }
  if (fighter.state !== 'attack') {
    fighter.hitboxActive = false;
  }
}
