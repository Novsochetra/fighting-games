import { describe, expect, it } from 'vitest';
import { marksOf } from '../../../src/sim/marking.js';
import { matchInPlay } from '../../support/match-driver.js';

describe('marking', () => {
  it('picks up the other side’s advanced players with defenders and midfielders only', () => {
    const match = matchInPlay(2);

    match.ball.x = 500;
    Object.assign(match.players[19], { x: 400, y: 300 });
    Object.assign(match.players[20], { x: 350, y: 540 });
    Object.assign(match.players[21], { x: 400, y: 800 });
    Object.assign(match.players[17], { x: 700, y: 540 });

    const marks = marksOf(match, 0, []);
    const markers = Object.keys(marks).map((index) => match.players[index]);
    const marked = Object.values(marks);

    expect(markers.length).toBeGreaterThan(2);
    expect(
      markers.every(
        (player) => player.team === 0 && player.role !== 'forward' && player.role !== 'keeper',
      ),
    ).toBe(true);
    expect(new Set(marked).size).toBe(marked.length);
    expect(marked.every((index) => match.players[index].team === 1)).toBe(true);
  });

  it('leaves the busy players and the one on the ball out of it', () => {
    const match = matchInPlay(2);

    match.ball.owner = 20;

    const marks = marksOf(match, 0, [2, 3]);

    expect(marks[2]).toBeUndefined();
    expect(marks[3]).toBeUndefined();
    expect(Object.values(marks)).not.toContain(20);
  });
});
