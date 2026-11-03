import { SPIRIT } from '../data/tuning.js';
import { attackSign } from './pitch.js';
import { skillOf, skillPostOf } from './skills/assign.js';
import { spiritMaxOf } from './spirit.js';
import { DEFAULT_STAT } from './stats.js';

const STAT_NAMES = ['speed', 'shot', 'pass', 'dribble', 'tackle', 'keeping', 'stamina'];

const statsOf = (spec) =>
  Object.fromEntries(STAT_NAMES.map((name) => [name, spec.stats?.[name] ?? DEFAULT_STAT]));

function identityOf(spec, { team, slotIndex }) {
  return {
    id: spec.id ?? `${team}-${slotIndex}`,
    name: spec.name ?? null,
    number: spec.number ?? slotIndex + 1,
    star: spec.star ?? null,
    hunts: spec.hunts ?? null,
    moves: [...(spec.moves ?? [])],
  };
}

// what a player may spend his spirit on besides his moves, and what he waits out after it
function skillsOf(spec, { slot, kit, skills }) {
  return {
    post: skillPostOf(slot),
    skill: skills ? skillOf(spec, { slot, kit }) : null,
    cooldown: 0,
    chain: null,
    burst: 0,
    beating: [],
    dribbleLook: -Infinity,
  };
}

// the slot decides how a player plays (index 0 keeps goal), whatever role their spec names; `skills`
// is false while the story has yet to bring the role skills in
export function createPlayer(spec, { team, slotIndex, index, slot, kit = null, skills = true }) {
  const stats = statsOf(spec);
  const spiritMax = spiritMaxOf({ ...spec, stats });

  return {
    index,
    team,
    slotIndex,
    role: slot.role,
    slot: { along: slot.along, across: slot.across },
    ...identityOf(spec, { team, slotIndex }),
    ...skillsOf(spec, { slot, kit, skills }),
    stats,
    spiritMax,
    spirit: Math.round(spiritMax * SPIRIT.start),
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    facing: { x: attackSign(team), y: 0 },
    stride: 0,
    stun: 0,
    tackle: 0,
    recover: 0,
    respite: 0,
    noPickup: 0,
    receiving: 0,
    holding: 0,
    still: 0,
    charge: 0,
    charging: null,
    lastKick: -Infinity,
    dive: null,
    energy: 1,
    strike: 0,
    flick: 0,
    flickAim: null,
    run: 0,
    spot: null,
  };
}
