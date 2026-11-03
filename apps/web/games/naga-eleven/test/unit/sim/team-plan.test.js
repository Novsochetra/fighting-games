import { describe, expect, it } from 'vitest';
import { planTeams } from '../../../src/sim/team-plan.js';
import { holdBallAt, looseBallAt, matchInPlay } from '../../support/match-driver.js';

describe('each side’s plan', () => {
  it('has the side with the ball attack and the other press it with two and cover', () => {
    const match = matchInPlay();
    const carrier = holdBallAt(match, { x: 900, y: 540 }, match.players[6]);

    Object.assign(match.players[17], { x: 940, y: 540 });
    Object.assign(match.players[16], { x: 960, y: 600 });
    planTeams(match);

    const [attack, defence] = match.plans;

    expect(attack.attacking).toBe(true);
    expect(defence.attacking).toBe(false);
    expect(defence.pressers).toEqual([17, 16]);
    expect(match.players[defence.cover].role).toBe('defender');
    expect(Object.values(defence.marks)).not.toContain(carrier.index);
  });

  it('sends each side’s fastest to a loose ball, and the receiver to a pass', () => {
    const match = matchInPlay();

    looseBallAt(match, { x: 900, y: 540, lastTouch: 6 });
    match.players[3].receiving = 30;
    planTeams(match);

    expect(match.plans[0].chaser).toBe(3);
    expect(match.plans[0].attacking).toBe(true);
    expect(match.players[match.plans[1].chaser].team).toBe(1);
  });

  it('never presses a keeper holding the ball in their box', () => {
    const match = matchInPlay();

    holdBallAt(match, { x: match.pitch.length - 20, y: 540 }, match.players[11]);
    planTeams(match);

    expect(match.plans[0].pressers).toEqual([]);
  });

  it('knows where its back line and the other side’s last man stand', () => {
    const match = matchInPlay();

    holdBallAt(match, { x: 900, y: 540 }, match.players[6]);
    planTeams(match);

    const [plan] = match.plans;

    expect(plan.line).toBeLessThan(900);
    expect(plan.lastLine).toBeGreaterThan(900);
  });

  it('sends a rival who hunts the carrier to close him down himself, the nearest cutting the pass', () => {
    const match = matchInPlay();
    const star = holdBallAt(match, { x: 1200, y: 540 }, match.players[9]);
    const rival = Object.assign(match.players[20], { hunts: 'sochetra', x: 1320, y: 600 });

    star.star = 'sochetra';
    Object.assign(match.players[17], { x: 1225, y: 540 });
    planTeams(match);

    const defence = match.plans[1];

    expect(defence.hunt).toEqual({ hunter: rival.index, quarry: star.index });
    expect(defence.pressers).toEqual([rival.index, 17]);
    expect(Object.keys(defence.marks)).not.toContain(String(rival.index));
  });

  it('presses as it always has when nobody hunts the carrier', () => {
    const match = matchInPlay();

    holdBallAt(match, { x: 1200, y: 540 }, match.players[9]);
    Object.assign(match.players[20], { x: 1320, y: 600 });
    Object.assign(match.players[17], { x: 1225, y: 540 });
    planTeams(match);

    expect(match.plans[1].hunt).toBeNull();
    expect(match.plans[1].pressers[0]).toBe(17);
  });

  it('sends a rival who hunts a star to a loose ball near him, though a mate is nearer it', () => {
    const match = matchInPlay();
    const star = Object.assign(match.players[9], { star: 'sochetra', x: 1200, y: 540 });
    const rival = Object.assign(match.players[20], { hunts: 'sochetra', x: 1340, y: 600 });

    looseBallAt(match, { x: 1230, y: 560, lastTouch: star.index });
    Object.assign(match.players[17], { x: 1240, y: 560 });
    planTeams(match);

    expect(match.plans[1].chaser).toBe(rival.index);

    looseBallAt(match, { x: 600, y: 300, lastTouch: star.index });
    planTeams(match);

    expect(match.plans[1].chaser).not.toBe(rival.index);
  });
});
