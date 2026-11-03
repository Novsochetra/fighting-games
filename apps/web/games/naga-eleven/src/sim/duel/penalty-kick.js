import { PENALTIES } from '../../data/duels.js';
import { nextRandom } from '../random.js';
import { clamp } from '../vector.js';

const statOf = (player, stat) => player?.stats?.[stat] ?? 50;

function missChanceOf(shooter, power) {
  const chance =
    PENALTIES.miss +
    power ** 3 * PENALTIES.powerMiss -
    (statOf(shooter, 'shot') - 50) / PENALTIES.skillMiss;

  return clamp(chance, PENALTIES.leastMiss, PENALTIES.mostMiss);
}

function saveChanceOf({ shooter, keeper, aim, dive, power }) {
  const edge = (statOf(keeper, 'keeping') - statOf(shooter, 'shot')) / 150;

  if (dive === aim) {
    return clamp(
      PENALTIES.guessSave + edge - power * PENALTIES.powerBeat,
      PENALTIES.leastSave,
      PENALTIES.mostSave,
    );
  }

  // a keeper who dived the wrong way never gets there; one who stayed up reaches a few
  return dive === 0
    ? clamp(PENALTIES.reach + edge / 3, PENALTIES.leastMiss, PENALTIES.mostReach)
    : 0;
}

// both rolls are always drawn, so a replay keeps the same draws whatever each kick comes to
export function resolveKick(random, kick) {
  const missRoll = nextRandom(random);
  const saveRoll = nextRandom(random);

  if (missRoll < missChanceOf(kick.shooter, kick.power)) {
    return 'missed';
  }

  return saveRoll < saveChanceOf(kick) ? 'saved' : 'scored';
}

const AIMS = [-1, 0, 1];

function weightedAim(random, weights) {
  let left = nextRandom(random);

  for (let i = 0; i < AIMS.length; i += 1) {
    left -= weights[i];

    if (left < 0) {
      return AIMS[i];
    }
  }

  return AIMS.at(-1);
}

export function computerShot(random) {
  const aim = weightedAim(random, PENALTIES.aimWeights);

  return { aim, power: PENALTIES.leastPower + nextRandom(random) * PENALTIES.powerSpread };
}

export const computerDive = (random) => ({ dive: weightedAim(random, PENALTIES.diveWeights) });
