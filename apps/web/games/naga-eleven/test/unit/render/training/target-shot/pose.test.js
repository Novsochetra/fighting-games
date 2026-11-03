import { describe, expect, it } from 'vitest';
import { DRILLS } from '../../../../../src/data/training.js';
import { isDrifting, shooterPose } from '../../../../../src/render/training/target-shot/pose.js';
import { createDrill } from '../../../../../src/training/index.js';

const TUNING = DRILLS['target-shot'].tuning;
const KICK = { ticks: 10, lead: 5 };

// a run at its shot, in play; the first round stands still, the second drifts
function shotAt(shot) {
  const state = createDrill('target-shot', { seed: 5, level: 1 });

  Object.assign(state, { phase: 'play', tick: 300 });
  state.run.shot = shot;

  return state;
}

const DRIFTING = TUNING.shotsPerRound * (TUNING.driftFromRound - 1);

function struck(state, ticks) {
  Object.assign(state.run, {
    stage: 'flight',
    ball: { fromX: 0, to: { x: 186, y: 122 }, power: 0.7, ticks, total: 24 },
  });

  return state;
}

describe('the shooter, drawn as a footballer', () => {
  it('stands facing the goal while he aims', () => {
    expect(shooterPose(shotAt(0), KICK)).toMatchObject({ name: 'idle', direction: 'north' });
  });

  it('winds up at the goal while the shot charges', () => {
    const state = shotAt(0);

    state.run.charge = 12;

    expect(shooterPose(state, KICK)).toMatchObject({ name: 'kick', age: 0, direction: 'north' });
  });

  it('strikes from the moment the ball leaves, then stands watching it fly', () => {
    expect(shooterPose(struck(shotAt(0), 0), KICK)).toMatchObject({
      name: 'kick',
      age: KICK.lead,
      direction: 'north',
    });
    expect(shooterPose(struck(shotAt(0), KICK.ticks), KICK)).toMatchObject({
      name: 'idle',
      direction: 'north',
    });
  });

  it('jogs three-quarters toward the way the run carries him across the box', () => {
    const right = shotAt(DRIFTING);
    const left = shotAt(DRIFTING);

    right.run.spot.dir = 1;
    left.run.spot.dir = -1;

    expect(shooterPose(right, KICK)).toMatchObject({ name: 'run', direction: 'north-east' });
    expect(shooterPose(left, KICK)).toMatchObject({ name: 'run', direction: 'north-west' });
  });

  it('stands once the last shot is struck, though the run carried him across the box', () => {
    for (const phase of ['finish', 'result']) {
      const state = shotAt(TUNING.shots - 1);

      state.phase = phase;

      expect(shooterPose(state, KICK)).toMatchObject({ name: 'idle', direction: 'north' });
      expect(isDrifting(state)).toBe(false);
    }
  });

  it('still strikes at the goal while the run carries him', () => {
    expect(shooterPose(struck(shotAt(DRIFTING), 2), KICK)).toMatchObject({
      name: 'kick',
      direction: 'north',
    });
  });
});
