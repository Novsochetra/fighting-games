import { describe, expect, it } from 'vitest';
import { SWITCH } from '../../../src/data/tuning.js';
import { controlNearest, stickOf, switchPlayer, updateControl } from '../../../src/sim/control.js';
import { createInput } from '../../../src/sim/input-state.js';
import { looseBallAt, matchInPlay } from '../../support/match-driver.js';

describe('the stick from the keys', () => {
  it('reads a diagonal as one direction of length 1', () => {
    const input = createInput();

    Object.assign(input.sources.keys.held, { up: true, right: true });

    const stick = stickOf(input);

    expect(stick.x).toBeCloseTo(Math.SQRT1_2);
    expect(stick.y).toBeCloseTo(-Math.SQRT1_2);
  });

  it('joins the keys, the pad and the touch controls', () => {
    const input = createInput();

    input.sources.touch.held.left = true;

    expect(stickOf(input)).toEqual({ x: -1, y: 0 });
  });
});

describe('who the player steers', () => {
  it('follows the ball to a mate who gets it', () => {
    const match = matchInPlay();

    match.ball.owner = 3;
    updateControl(match);

    expect(match.controlled).toBe(3);
  });

  it('jumps to the mate best placed for the ball when the one steered is left far behind', () => {
    const match = matchInPlay();

    Object.assign(match.players[match.controlled], { x: 1700, y: 540 });
    looseBallAt(match, { x: 100, y: 540 });
    Object.assign(match.players[3], { x: 110, y: 540 });
    match.switchCooldown = 0;
    updateControl(match);

    expect(match.controlled).toBe(3);
    expect(match.switchCooldown).toBe(SWITCH.cooldownTicks);
  });

  it('holds over the stick the last man was steered with when it jumps by itself', () => {
    const match = matchInPlay();

    match.input.sources.keys.held.left = true;
    Object.assign(match.players[match.controlled], { x: 1700, y: 540 });
    looseBallAt(match, { x: 100, y: 540 });
    Object.assign(match.players[3], { x: 110, y: 540 });
    match.switchCooldown = 0;
    updateControl(match);

    expect(match.stickHold).toMatchObject({ stick: { x: -1, y: 0 } });
    expect(match.stickHold.until).toBe(match.tick + SWITCH.holdTicks);
  });

  it('hands the player the keeper while he holds the ball, and takes him back once he lets it go', () => {
    const match = matchInPlay();

    match.ball.owner = 0;
    updateControl(match);

    expect(match.controlled).toBe(0);

    looseBallAt(match, { x: 600, y: 540 });
    updateControl(match);

    expect(match.players[match.controlled].role).not.toBe('keeper');
  });

  it('changes on pass without the ball to another mate, never the keeper', () => {
    const match = matchInPlay();
    const before = match.controlled;

    switchPlayer(match, match.players[before]);

    expect(match.controlled).not.toBe(before);
    expect(match.players[match.controlled].role).not.toBe('keeper');
  });

  it('goes to the side’s player nearest a spot when play stops', () => {
    const match = matchInPlay();

    Object.assign(match.players[5], { x: 1000, y: 1000 });
    controlNearest(match, { x: 1010, y: 1010 });

    expect(match.controlled).toBe(5);
  });

  it('is no one in a match the computer plays both sides of', () => {
    const match = matchInPlay(1, { humanTeam: null });

    match.ball.owner = 3;
    updateControl(match);

    expect(match.controlled).toBe(null);
  });
});
