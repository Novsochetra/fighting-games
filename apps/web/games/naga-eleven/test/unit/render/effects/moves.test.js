import { describe, expect, it } from 'vitest';
import { EFFECT_TICKS } from '../../../../src/data/move-effects.js';
import { createEffects, updateEffects } from '../../../../src/render/effects/index.js';
import { isFlying } from '../../../../src/render/effects/flight.js';
import { fixtureMatch } from '../../../integration/render/actors/match-fixture.js';

function tickWith(effects, match, events = []) {
  match.tick += 1;
  match.events = events;
  updateEffects(effects, match, {});
  match.events = [];
}

const impacts = (effects) =>
  effects.list.filter((effect) => effect.kind === 'impact').map((effect) => effect.shape);

const kickedBy = (match, player) => {
  Object.assign(match.ball, { owner: null, x: player.x + 10, y: player.y, vx: 9, vy: 0 });
};

function struckSkill(move) {
  const match = fixtureMatch();
  const effects = createEffects();
  const striker = match.players[9];

  kickedBy(match, striker);
  tickWith(effects, match, [{ type: 'skill', player: striker.index, move }]);

  return { match, effects, striker };
}

describe('a skill in the open, on the pitch', () => {
  it('wraps its player in its aura for a moment and names it over his head', () => {
    const { match, effects } = struckSkill('kouprey-kick');

    expect(effects.auras).toMatchObject([{ player: 9, move: 'kouprey-kick' }]);
    expect(effects.popups).toMatchObject([{ player: 9, move: 'kouprey-kick' }]);

    for (let i = 0; i < EFFECT_TICKS.aura + 8; i += 1) {
      tickWith(effects, match);
    }

    expect(effects.auras).toEqual([]);
  });

  it('flies its ball with its trail, bursts as it is struck and again where it is met', () => {
    const { match, effects } = struckSkill('kouprey-kick');

    expect(isFlying(effects)).toBe(true);
    expect(impacts(effects)).toEqual(['dust']);

    match.ball.owner = 0;
    tickWith(effects, match);

    expect(isFlying(effects)).toBe(false);
    expect(impacts(effects)).toEqual(['dust', 'dust']);
  });

  it('ends a flight in the net with its impact there', () => {
    const { match, effects } = struckSkill('thunder-shot');

    match.ball.inGoal = 0;
    tickWith(effects, match);

    expect(isFlying(effects)).toBe(false);
    expect(impacts(effects)).toEqual(['burst', 'burst']);
  });

  it('lets a trail draw in and go once its ball dies out', () => {
    const { match, effects } = struckSkill('apsara-curl');

    Object.assign(match.ball, { vx: 0.5 });
    tickWith(effects, match);

    expect(effects.flight.endedAt).toBe(match.tick);

    for (let i = 0; i < 12; i += 1) {
      tickWith(effects, match);
    }

    expect(effects.flight).toBeNull();
  });

  it('trails the dribbler for his burst, from his feet', () => {
    const match = fixtureMatch();
    const effects = createEffects();

    match.phase = 'duel';
    tickWith(effects, match, [{ type: 'special', player: 9, move: 'mirror-step' }]);

    expect(effects.carries).toEqual([]);
    expect(effects.pending).toHaveLength(1);

    match.phase = 'play';
    tickWith(effects, match);

    expect(effects.carries[0]).toMatchObject({ player: 9, started: match.tick });
    expect(impacts(effects)).toEqual(['dust']);

    for (let i = 0; i < 60; i += 1) {
      tickWith(effects, match);
    }

    expect(effects.carries).toEqual([]);
  });

  it('raises a wall in front of a blocker, between him and the ball', () => {
    const match = fixtureMatch();
    const effects = createEffects();
    const blocker = match.players[14];

    Object.assign(match.ball, { owner: null, x: blocker.x - 60, y: blocker.y });
    tickWith(effects, match, [{ type: 'skill', player: blocker.index, move: 'steel-block' }]);

    const [wall] = effects.list.filter((effect) => effect.shape === 'wall');

    expect(wall.place.x).toBeLessThan(blocker.x);
    expect(wall.life).toBe(EFFECT_TICKS.wall);
  });

  it("bursts a keeper's save skill where the ball meets him, and stops the shot's trail there", () => {
    const { match, effects } = struckSkill('kouprey-kick');
    const keeper = match.players[11];

    tickWith(effects, match, [{ type: 'skill', player: keeper.index, move: 'panther-dive' }]);

    expect(effects.guard).toMatchObject({ keeper: keeper.index });

    tickWith(effects, match, [{ type: 'save', keeper: keeper.index, parried: false }]);

    expect(effects.guard).toBeNull();
    expect(impacts(effects)).toEqual(['dust', 'dust', 'burst']);
  });

  it('lights both players of a duo as it is struck, after its cut-in', () => {
    const match = fixtureMatch();
    const effects = createEffects();

    match.phase = 'duel';
    tickWith(effects, match, [{ type: 'special', player: 9, move: 'twin-naga', partner: 8 }]);

    expect(effects.auras).toEqual([]);

    match.phase = 'play';
    kickedBy(match, match.players[9]);
    tickWith(effects, match);

    expect(effects.auras.map((aura) => aura.player).sort()).toEqual([8, 9]);
    expect(effects.flight.plan.trail).toBe('twin-coils');
  });
});
