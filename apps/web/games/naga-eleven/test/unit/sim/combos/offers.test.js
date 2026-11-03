import { describe, expect, it } from 'vitest';
import { CHAIN_RULES } from '../../../../src/data/combos.js';
import { MOVES } from '../../../../src/data/moves.js';
import { startChain } from '../../../../src/sim/combos/chains.js';
import { opensDuel, shotOffersOf } from '../../../../src/sim/combos/offers.js';
import { holdBallAt, matchInPlay } from '../../../support/match-driver.js';

function striker(fields, x = 1450) {
  const match = matchInPlay();
  const player = holdBallAt(match, { x, y: 540 }, match.players[9]);

  Object.assign(player, { spirit: 100, ...fields });

  return { match, player };
}

const tagged = (offers) => offers.map((option) => `${option.tag ?? option.family}:${option.move}`);

describe('the shots a full charge may strike', () => {
  it('are a star’s specials, strongest family first, and none out of range', () => {
    const { match, player } = striker({
      star: 'sochetra',
      skill: null,
      moves: ['naga-shot', 'power-shot'],
    });

    expect(tagged(shotOffersOf(match, player))).toEqual(['star:naga-shot', 'star:power-shot']);

    player.x = 300;
    expect(shotOffersOf(match, player)).toEqual([]);
  });

  it('put a chain before the plain shot it lifts, and a star’s named chain in its place', () => {
    const { match, player } = striker({
      star: 'sochetra',
      skill: null,
      moves: ['naga-shot', 'hanuman-leap'],
    });

    startChain(match, player, MOVES['hanuman-leap']);
    player.cooldown = 300;

    const [named] = shotOffersOf(match, player);

    expect(tagged(shotOffersOf(match, player))).toEqual(['chain:flying-naga']);
    expect(named).toMatchObject({ from: 'hanuman-leap', cost: MOVES['naga-shot'].cost });
    expect(MOVES['flying-naga'].power).toBe(MOVES['naga-shot'].power + CHAIN_RULES.power);
  });

  it('offer the finisher, free, to the holder of x3, before his own shot skill', () => {
    const { match, player } = striker({});

    match.combo = { team: 0, level: 3, holder: 9, since: match.tick, passer: 8, before: 7 };

    const offers = shotOffersOf(match, player);

    expect(tagged(offers)).toEqual(['finisher:mekong-current', 'role:kouprey-kick']);
    expect(offers[0].cost).toBe(0);
    expect(offers[1].bonus).toBeGreaterThan(0);
  });

  it('stop for the duel for anything but a role skill alone, which plays on', () => {
    const { match, player } = striker({});

    expect(opensDuel(shotOffersOf(match, player))).toBe(false);

    startChain(match, match.players[6], MOVES['apsara-curl'], 9);
    expect(opensDuel(shotOffersOf(match, player))).toBe(true);
  });
});
