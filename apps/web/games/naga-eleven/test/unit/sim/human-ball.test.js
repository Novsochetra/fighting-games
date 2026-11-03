import { describe, expect, it } from 'vitest';
import { KICK } from '../../../src/data/tuning.js';
import { humanIntent } from '../../../src/sim/human.js';
import { clearPresses } from '../../../src/sim/input-state.js';
import { holdBallAt, matchInPlay } from '../../support/match-driver.js';

// holds a button to a full charge and lets it go, returning what letting go did
function fullCharge(match, player, button) {
  const keys = match.input.sources.keys.held;

  keys[button] = true;
  match.input.pressed[button] = true;
  humanIntent(match, player);
  clearPresses(match.input);

  for (let i = 0; i < KICK.chargeTicks + 2; i += 1) {
    humanIntent(match, player);
  }

  keys[button] = false;

  return humanIntent(match, player).action;
}

function tapRun(match, player) {
  match.input.pressed.sprint = true;

  const { action } = humanIntent(match, player);

  clearPresses(match.input);

  return action;
}

describe('the player’s skills with the ball', () => {
  it('plays a full-charge PASS as his pass skill with the spirit for it, else the long ball', () => {
    const match = matchInPlay();
    const mid = holdBallAt(match, { x: 700, y: 540 }, match.players[6]);

    mid.spirit = 80;
    expect(fullCharge(match, mid, 'pass')).toMatchObject({
      kind: 'skillPass',
      move: 'apsara-curl',
    });

    mid.spirit = 5;
    expect(fullCharge(match, mid, 'pass')).toMatchObject({ kind: 'pass', lofted: true });
  });

  it('plays a full-charge SHOOT in range as his shot skill, in the open', () => {
    const match = matchInPlay();
    const forward = holdBallAt(match, { x: 1500, y: 540 }, match.players[9]);

    forward.spirit = 80;

    expect(fullCharge(match, forward, 'shoot')).toMatchObject({
      kind: 'skillShot',
      move: 'kouprey-kick',
    });
  });

  it('plays a star’s dribble move on two taps of RUN close together, not one or two far apart', () => {
    const match = matchInPlay();
    const star = holdBallAt(match, { x: 700, y: 540 }, match.players[9]);

    Object.assign(star, { star: 'sochetra', skill: null, moves: ['hanuman-leap'], spirit: 80 });

    expect(tapRun(match, star)).toBeNull();
    match.tick += 30;
    expect(tapRun(match, star)).toBeNull();
    match.tick += 5;
    expect(tapRun(match, star)).toEqual({ kind: 'burst', move: 'hanuman-leap' });
  });
});
