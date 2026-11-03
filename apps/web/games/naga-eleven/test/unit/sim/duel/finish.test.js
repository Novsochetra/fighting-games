import { describe, expect, it } from 'vitest';

import { DUEL_AFTERMATH } from '../../../../src/data/duels.js';
import { finishDuel } from '../../../../src/sim/duel/index.js';
import { fakeMatch, keeperOn, startMeeting } from '../../../support/duel-fixtures.js';

// a duel decided by hand, so each outcome can be looked at on its own
function decided(result, { kind = 'field', receiver = null } = {}) {
  const match = fakeMatch();
  const { carrier, rival } = startMeeting(match, { at: 800 });
  const keeper = keeperOn(match, 1);
  const side = ['broke', 'passed', 'goal'].includes(result) ? 'attack' : 'defend';

  Object.assign(keeper, { x: 990, y: 320 });
  match.events.length = 0;
  Object.assign(match.duel, {
    stage: 'done',
    outcome: {
      result,
      side,
      winner: side === 'attack' ? 0 : 1,
      attacker: carrier.index,
      defender: kind === 'keeper' ? keeper.index : rival.index,
      keeper: kind === 'keeper' ? keeper.index : null,
      receiver,
      move: 'naga-shot',
      guard: null,
    },
  });

  return { match, carrier, rival, keeper };
}

const typesOf = (match) => match.events.map((event) => event.type);

describe('finishing a duel', () => {
  it('leaves the defender on the grass when the dribbler breaks through', () => {
    const { match, carrier, rival } = decided('broke');

    expect(finishDuel(match)).toBe(true);
    expect(match.phase).toBe('play');
    expect(match.duel).toBeNull();
    expect(match.ball.owner).toBe(carrier.index);
    expect(carrier.x).toBeGreaterThan(rival.x);
    expect(rival.stun).toBe(DUEL_AFTERMATH.floored);
    expect(typesOf(match)).toEqual(['tackle', 'duelEnd']);
  });

  it('hands the ball to the defender who wins it', () => {
    const { match, carrier, rival } = decided('stolen');

    finishDuel(match);

    expect(match.ball.owner).toBe(rival.index);
    expect(carrier.stun).toBeGreaterThan(0);
    expect(match.events[0]).toMatchObject({ type: 'tackle', won: true });
  });

  it('rolls a pass through to the mate', () => {
    const { match, carrier } = decided('passed', { receiver: 3 });

    Object.assign(match.players[3], { x: 860, y: 200 });
    finishDuel(match);

    expect(match.ball.owner).toBeNull();
    expect(match.ball.vx).toBeGreaterThan(0);
    expect(match.ball.vy).toBeLessThan(0);
    expect(match.players[3].receiving).toBeGreaterThan(0);
    expect(carrier.noPickup).toBeGreaterThan(0);
    expect(typesOf(match)).toEqual(['pass', 'duelEnd']);
  });

  it('knocks a blocked shot loose, back the way it came', () => {
    const { match } = decided('blocked');

    finishDuel(match);

    expect(match.ball.owner).toBeNull();
    expect(match.ball.vx).toBeLessThan(0);
  });

  it('puts a goal in the net, counts it and goes to the goal phase', () => {
    const { match, carrier, keeper } = decided('goal', { kind: 'keeper' });

    finishDuel(match);

    expect(match.score).toEqual([1, 0]);
    expect(match.phase).toBe('goal');
    expect(match.ball.inGoal).toBe(0);
    expect(match.ball.x).toBeGreaterThan(match.pitch.length);
    expect(keeper.dive).not.toBeNull();
    expect(match.events.find((event) => event.type === 'goal')).toEqual({
      type: 'goal',
      team: 0,
      scorer: carrier.index,
      move: 'naga-shot',
    });
    expect(typesOf(match)).toEqual(['shot', 'goal', 'duelEnd']);
  });

  it('gives a saved shot to the keeper, and a parried one to nobody', () => {
    const saved = decided('saved', { kind: 'keeper' });

    finishDuel(saved.match);

    expect(saved.match.ball.owner).toBe(saved.keeper.index);
    expect(saved.match.events[1]).toEqual({
      type: 'save',
      keeper: saved.keeper.index,
      parried: false,
    });

    const parried = decided('parried', { kind: 'keeper' });

    finishDuel(parried.match);

    expect(parried.match.ball.owner).toBeNull();
    expect(parried.match.events[1]).toMatchObject({ type: 'save', parried: true });
  });

  it('sends a wide shot on past the post', () => {
    const { match } = decided('wide', { kind: 'keeper' });

    finishDuel(match);

    expect(Math.abs(match.ball.y - match.pitch.width / 2)).toBeGreaterThan(match.goal.width / 2);
    expect(match.ball.vx).toBeGreaterThan(0);
    expect(match.phase).toBe('play');
  });

  it('decides a duel that is finished before its sides chose', () => {
    const match = fakeMatch();

    startMeeting(match);

    expect(match.duel.stage).toBe('choose');
    expect(finishDuel(match)).toBe(true);
    expect(match.phase).not.toBe('duel');
    expect(match.events.at(-1).duel.outcome.winner).toBeTypeOf('number');
  });

  it('does nothing with no duel on', () => {
    expect(finishDuel(fakeMatch())).toBe(false);
  });
});
