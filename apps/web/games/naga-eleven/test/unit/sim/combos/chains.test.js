import { describe, expect, it } from 'vitest';
import { CHAIN_RULES } from '../../../../src/data/combos.js';
import { MOVES } from '../../../../src/data/moves.js';
import {
  chainOf,
  clearChains,
  spendChain,
  startChain,
  watchChains,
} from '../../../../src/sim/combos/chains.js';
import { matchInPlay } from '../../../support/match-driver.js';

describe('a skill chain', () => {
  it('starts from a dribble, pass or cross skill, for whoever is to strike next', () => {
    const match = matchInPlay();

    startChain(match, match.players[6], MOVES['apsara-curl'], 9);
    startChain(match, match.players[9], MOVES['kouprey-kick']);

    expect(chainOf(match, match.players[9])).toMatchObject({ move: 'apsara-curl', owner: 6 });
    expect(match.players[9].chain).toBeNull();
    expect(chainOf(match, match.players[8])).toBeNull();
  });

  it('lives its ticks, waiting while the striker charges his shot', () => {
    const match = matchInPlay();
    const striker = match.players[9];

    startChain(match, striker, MOVES['hanuman-leap']);
    match.tick += CHAIN_RULES.ticks + 20;
    expect(chainOf(match, striker)).toBeNull();

    striker.charge = 30;
    expect(chainOf(match, striker)).not.toBeNull();
  });

  it('breaks when the other side touches the ball, and a shot spends it', () => {
    const match = matchInPlay();

    startChain(match, match.players[6], MOVES['apsara-curl'], 9);
    match.ball.lastTouch = 15;
    watchChains(match);
    expect(match.players[6].chain).toBeNull();

    startChain(match, match.players[6], MOVES['apsara-curl'], 9);
    spendChain(match, match.players[9]);
    expect(match.players[6].chain).toBeNull();

    startChain(match, match.players[6], MOVES['apsara-curl'], 9);
    clearChains(match);
    expect(match.players[6].chain).toBeNull();
  });

  it('is off until the story brings chains in', () => {
    const match = matchInPlay(1, { systems: { chains: false } });

    startChain(match, match.players[6], MOVES['apsara-curl'], 9);

    expect(match.players[6].chain).toBeNull();
  });
});
