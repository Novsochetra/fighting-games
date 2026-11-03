import { EFFECT_TICKS } from '../../data/move-effects.js';
import { PASS_COMBO } from '../../data/combos.js';

const MOST_POPS = 4;

// what the combo counter shows for a side (src/render/hud/combo-counter.js): the level it stands
// at, when it last climbed, and how and when the last one ended
const sideCombo = () => ({
  level: 0,
  climbedAt: null,
  endedAt: null,
  endLevel: 0,
  reason: null,
  finisher: false,
  endBurst: false,
});

export const createCombos = () => [sideCombo(), sideCombo()];

function addPop(effects, match, { player, level, team }) {
  if (player === null || player === undefined || level < PASS_COMBO.showFrom) {
    return;
  }

  // a side's new level takes the place of the last it popped, so two never stack on a passer
  effects.pops = [
    ...effects.pops.filter(
      (pop) => pop.team !== team && match.tick - pop.born < EFFECT_TICKS.comboPop,
    ),
    { player, level, team, born: match.tick },
  ].slice(-MOST_POPS);
}

export function climbCombo(effects, match, { team, level, player }) {
  const side = effects.combos[team];

  if (side && level > 0) {
    Object.assign(side, { level, climbedAt: match.tick, endedAt: null, endBurst: false });
    addPop(effects, match, { player, level, team });
  }
}

export function endCombo(effects, match, { team, level, reason }) {
  const side = effects.combos[team];

  if (side && (side.level > 0 || level > 0)) {
    Object.assign(side, {
      endLevel: level ?? side.level,
      level: 0,
      endedAt: match.tick,
      reason: reason ?? 'lost',
      endBurst: side.finisher,
      finisher: false,
    });
  }
}

// a finisher spends the combo it was struck from: the counter bursts into sparks as it ends,
// whichever of the two the match tells first
export function noteFinisher(effects, team) {
  const side = effects.combos[team];

  if (side?.level > 0) {
    side.finisher = true;
  } else if (side?.endedAt !== null && side?.endedAt !== undefined) {
    side.endBurst = true;
  }
}

// a cut-in covers the HUD, so a climb or an end that comes in a duel shows as play goes on
export function holdThroughDuel(effects, match) {
  if (match.phase !== 'duel') {
    return;
  }

  for (const side of effects.combos) {
    side.climbedAt = side.climbedAt === null ? null : match.tick;
    side.endedAt = side.endedAt === null ? null : match.tick;
  }
}

// a match that keeps its combo on `match.combo` (README "Contract additions") is followed by it
// too, so a climb or a break the events missed still shows; a replay's frames keep none
export function syncCombos(effects, match) {
  if (match.combo === undefined) {
    return;
  }

  effects.combos.forEach((side, team) => {
    const live = match.combo?.team === team ? match.combo.level : 0;

    if (live > side.level) {
      climbCombo(effects, match, { team, level: live, player: match.combo.passer });
    } else if (live === 0 && side.level > 0) {
      endCombo(effects, match, { team, level: side.level, reason: 'lost' });
    } else if (live < side.level) {
      side.level = live;
    }
  });
}
