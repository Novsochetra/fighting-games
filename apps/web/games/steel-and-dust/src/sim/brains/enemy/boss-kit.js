import { startMove } from '../../fighters/actions.js';
import { hasMirages } from '../../bosses/mirage.js';
import { isMissionBoss } from '../../stage/mission.js';
import { BOSS_MOVEMENT } from './boss-movement.js';
import { standStill } from './movement.js';

const CALM = { pace: 1, cooldown: 1 };

function kitState(boss) {
  boss.ai.kit ??= { readyAt: {}, ultReadyAt: 0, chain: null };
  return boss.ai.kit;
}

function healthShare(boss) {
  return boss.hp / boss.maxHp;
}

// below half health a boss moves quicker, uses its skills more often and may chain them
function phaseOf(boss, kit) {
  return kit.phaseTwo && healthShare(boss) <= kit.phaseTwo.below ? kit.phaseTwo : CALM;
}

function standsAlone(game) {
  return !game.fighters.some(
    (fighter) => fighter.side === 'enemy' && !fighter.def.boss && fighter.state !== 'ko',
  );
}

function canUse(game, skill, { boss, state, distance }) {
  const [near, far] = skill.range;
  return (
    game.tickCount >= (state.readyAt[skill.move] ?? 0) &&
    distance >= near &&
    distance <= far &&
    (!skill.alone || standsAlone(game)) &&
    (!skill.noMirages || !hasMirages(boss)) &&
    (!skill.airborne || game.player.airborne)
  );
}

// a boss whose phase two opens with a move of its own (crumbling and reforming) plays it once, as
// soon as it is free after falling below the line
function tryOpener(game, boss, { kit, state }) {
  const opener = kit.phaseTwo?.opener;
  if (!opener || state.opened || healthShare(boss) > kit.phaseTwo.below) {
    return false;
  }
  state.opened = true;
  return startMove(game, boss, opener);
}

// a mid-boss met on a later road fights with its skills but keeps its ultimate for its own road
function tryUltimate(game, boss, { kit, state }) {
  const ultimate = kit.ultimate;
  const ready =
    ultimate &&
    isMissionBoss(game, boss) &&
    healthShare(boss) <= ultimate.below &&
    game.tickCount >= state.ultReadyAt;
  if (ready && startMove(game, boss, ultimate.move)) {
    state.ultReadyAt = game.tickCount + ultimate.every;
    return true;
  }
  return false;
}

function trySkill(game, boss, { kit, state, distance, phase }) {
  for (const skill of kit.skills) {
    if (canUse(game, skill, { boss, state, distance }) && Math.random() < skill.chance) {
      startMove(game, boss, phase.swaps?.[skill.move] ?? skill.move);
      state.readyAt[skill.move] = game.tickCount + Math.round(skill.cooldown * phase.cooldown);
      const repeats = (phase.chains?.[skill.move] ?? 1) - 1;
      state.chain = repeats > 0 ? { move: skill.move, left: repeats } : null;
      return true;
    }
  }
  return false;
}

function continueChain(game, boss, state) {
  const chain = state.chain;
  chain.left--;
  if (chain.left <= 0) {
    state.chain = null;
  }
  startMove(game, boss, chain.move);
}

function attackOrMove(game, boss, context) {
  const { kit, distance, phase } = context;
  if (tryUltimate(game, boss, context) || trySkill(game, boss, context)) {
    return;
  }
  if (distance < kit.close.range) {
    const moves = kit.close.moves;
    startMove(game, boss, moves[(Math.random() * moves.length) | 0]);
    return;
  }
  BOSS_MOVEMENT[kit.movement](boss, { game, distance, pace: phase.pace });
}

// a boss with a kit of its own picks from its skills by range and cooldown, and moves its own way
export function thinkKitBoss(game, boss, { kit, distance }) {
  const state = kitState(boss);
  const phase = phaseOf(boss, kit);
  const player = game.player;
  if (tryOpener(game, boss, { kit, state })) {
    return;
  }
  if (state.chain && player.state !== 'down' && player.state !== 'getup') {
    continueChain(game, boss, state);
    return;
  }
  if (boss.ai.cooldown > 0) {
    BOSS_MOVEMENT[kit.movement](boss, { game, distance, pace: phase.pace });
    return;
  }
  if (player.state === 'down' || player.state === 'getup') {
    standStill(boss);
    return;
  }
  attackOrMove(game, boss, { kit, state, distance, phase });
}
