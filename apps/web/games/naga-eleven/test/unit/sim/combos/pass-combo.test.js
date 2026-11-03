import { describe, expect, it } from 'vitest';
import { PASS_COMBO } from '../../../../src/data/combos.js';
import {
  comboLiftOf,
  endCombo,
  holdTicksOf,
  notePass,
  noteTouch,
  spendCombo,
  watchCombo,
} from '../../../../src/sim/combos/pass-combo.js';
import { matchInPlay } from '../../../support/match-driver.js';

// a pass from one player to another, taken at once
function pass(match, from, to, steps = 1) {
  const passer = match.players[from];

  Object.assign(passer, { holding: 10, charge: 0 });
  notePass(match, passer, { steps });
  match.ball.lastTouch = from;
  noteTouch(match, match.players[to]);
  match.ball.lastTouch = to;
}

const freshMatch = () => {
  const match = matchInPlay();

  match.events.length = 0;

  return match;
};

const typesOf = (match) => match.events.map((event) => `${event.type}:${event.level}`);

describe('the pass combo', () => {
  it('counts each quick pass a mate takes, showing from x2', () => {
    const match = freshMatch();

    pass(match, 5, 6);
    expect(match.combo).toMatchObject({ team: 0, level: 1, holder: 6, passer: 5 });
    expect(match.events).toEqual([]);

    pass(match, 6, 9);
    expect(match.combo.level).toBe(2);
    expect(match.events).toEqual([{ type: 'combo', team: 0, level: 2, player: 6 }]);
  });

  it('counts a one-two and a skill pass as two, and stops at its top', () => {
    const match = freshMatch();

    pass(match, 5, 6);
    pass(match, 6, 5);
    expect(match.combo.level).toBe(1 + PASS_COMBO.oneTwo);

    pass(match, 5, 9, 2);
    pass(match, 9, 8);
    expect(match.combo.level).toBe(PASS_COMBO.most);
  });

  it('fills the passer’s gauge for every pass taken and the one-two’s for the ball back', () => {
    const match = freshMatch();
    const [five, six] = [match.players[5], match.players[6]];

    Object.assign(five, { spirit: 0 });
    Object.assign(six, { spirit: 0 });
    pass(match, 5, 6);
    pass(match, 6, 5);

    expect(five.spirit).toBeGreaterThan(0);
    expect(six.spirit).toBeGreaterThan(0);
  });

  it('breaks when the other side touches it, and when the holder keeps it too long', () => {
    const lost = freshMatch();

    pass(lost, 5, 6);
    pass(lost, 6, 9);
    lost.ball.lastTouch = 14;
    watchCombo(lost);
    expect(lost.combo).toBeNull();
    expect(lost.events.at(-1)).toEqual({ type: 'comboEnd', team: 0, level: 2, reason: 'lost' });

    const held = freshMatch();

    pass(held, 5, 6);
    held.ball.owner = 6;
    held.tick += holdTicksOf(held) + 1;
    watchCombo(held);
    expect(held.events.at(-1)).toMatchObject({ type: 'comboEnd', reason: 'held' });
  });

  it('waits while the holder charges a kick, so a full charge does not run it out', () => {
    const match = freshMatch();

    pass(match, 5, 6);
    pass(match, 6, 9);
    Object.assign(match.ball, { owner: 9 });
    match.tick += holdTicksOf(match) + 10;
    match.players[9].charge = 30;
    watchCombo(match);

    expect(match.combo?.level).toBe(2);
    expect(comboLiftOf(match, match.players[9]).power).toBe(PASS_COMBO.shotPower[2]);
  });

  it('lifts the holder’s shot alone, and any shot of his side spends it', () => {
    const match = freshMatch();

    pass(match, 5, 6);
    pass(match, 6, 9);
    pass(match, 9, 8);

    expect(comboLiftOf(match, match.players[8])).toMatchObject({
      level: 3,
      power: PASS_COMBO.shotPower[3],
    });
    expect(comboLiftOf(match, match.players[9]).power).toBe(0);

    spendCombo(match, match.players[8]);
    expect(match.combo).toBeNull();
    expect(typesOf(match).at(-1)).toBe('comboEnd:3');
    expect(match.events.at(-1).reason).toBe('shot');
  });

  it('ends with the reason it is given, and only once', () => {
    const match = freshMatch();

    pass(match, 5, 6);
    endCombo(match, 'restart');
    endCombo(match, 'restart');

    expect(match.events.filter((event) => event.type === 'comboEnd')).toHaveLength(1);
  });
});
