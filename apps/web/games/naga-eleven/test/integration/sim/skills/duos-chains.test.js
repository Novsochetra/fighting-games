import { describe, expect, it } from 'vitest';
import { CHAIN_RULES } from '../../../../src/data/combos.js';
import { MOVES } from '../../../../src/data/moves.js';
import { KICK } from '../../../../src/data/tuning.js';
import { currentRound } from '../../../../src/sim/duel/index.js';
import { attachDuels } from '../../../../src/sim/duel/attach.js';
import { holdBallAt, matchInPlay, only, playTicks } from '../../../support/match-driver.js';

// the player's Sochetra on the ball in range of the goal, Rithy where the test puts him, nobody
// else near but the keeper
function sochetraOnTheBall({ moves, rithyAt = 1380 }) {
  const match = attachDuels(matchInPlay(4));
  const sochetra = holdBallAt(match, { x: 1450, y: 540 }, match.players[9]);
  const rithy = Object.assign(match.players[7], { star: 'rithy', moves: ['preah-khan-strike'] });

  Object.assign(sochetra, { star: 'sochetra', skill: null, moves, spirit: 100, spiritMax: 100 });
  Object.assign(rithy, { x: rithyAt, y: 600, vx: 0, vy: 0, spirit: 100, stun: 0 });
  only(match, [sochetra.index, rithy.index, 11]);
  match.events.length = 0;

  return { match, sochetra, rithy };
}

function fullChargeShoot(match) {
  playTicks(match, 1, { held: { shoot: true }, pressed: { shoot: true } });
  playTicks(match, KICK.chargeTicks + 2, { held: { shoot: true } });
  playTicks(match, 1, { held: { shoot: false } });
}

const specialsOf = (match) => match.events.filter((event) => event.type === 'special');

describe('a duo in a match', () => {
  it('strikes Twin Naga from a full charge with Rithy near, each paying his share', () => {
    const { match, sochetra, rithy } = sochetraOnTheBall({ moves: ['twin-naga'] });

    fullChargeShoot(match);
    expect(match.phase).toBe('duel');
    expect(currentRound(match.duel).picked.attack).toMatchObject({
      move: 'twin-naga',
      tag: 'duo',
      partner: 7,
    });

    playTicks(match, 2);

    expect(specialsOf(match)).toEqual([
      { type: 'special', player: 9, move: 'twin-naga', tag: 'duo', partner: 7 },
    ]);
    expect(sochetra.spirit).toBeLessThanOrEqual(100 - 36 + 8);
    expect(rithy.spirit).toBeLessThanOrEqual(100 - 24);
  });

  it('is no duo with Rithy far away: the full charge is a plain shot', () => {
    const { match } = sochetraOnTheBall({ moves: ['twin-naga'], rithyAt: 700 });

    fullChargeShoot(match);

    expect(match.phase).toBe('play');
    expect(match.ball.kick).toBe('shot');
    expect(specialsOf(match)).toEqual([]);
  });
});

describe('a skill chain in a match', () => {
  it('strikes Hanuman Leap into Naga Shot as the Flying Naga, lifted by the chain', () => {
    const { match } = sochetraOnTheBall({ moves: ['hanuman-leap', 'naga-shot'] });

    playTicks(match, 1, { pressed: { sprint: true } });
    playTicks(match, 3);
    playTicks(match, 1, { pressed: { sprint: true } });

    expect(
      match.events.filter((event) => event.type === 'skill').map((event) => event.move),
    ).toEqual(['hanuman-leap']);

    fullChargeShoot(match);

    const attack = currentRound(match.duel).picked.attack;

    expect(attack).toMatchObject({ move: 'flying-naga', tag: 'chain', from: 'hanuman-leap' });
    expect(attack.power).toBe(MOVES['naga-shot'].power + CHAIN_RULES.power);
  });
});
