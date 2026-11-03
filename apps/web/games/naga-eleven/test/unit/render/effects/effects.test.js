import { describe, expect, it, vi } from 'vitest';
import { LIFETIMES } from '../../../../src/render/effects/effect-list.js';
import {
  createEffects,
  drawEffects,
  scoringTeamOf,
  updateEffects,
} from '../../../../src/render/effects/index.js';
import { isFlying } from '../../../../src/render/effects/flight.js';
import { createCamera } from '../../../../src/render/camera.js';
import { fixtureMatch } from '../../../integration/render/actors/match-fixture.js';
import { createRecordingContext } from '../../../support/recording-context.js';

function tickWith(effects, match, events = [], camera = undefined) {
  match.tick += 1;
  match.events = events;
  updateEffects(effects, match, { camera });
  match.events = [];
}

const kinds = (effects) => effects.list.map((effect) => effect.kind);

describe('the effects of a match', () => {
  it('throws up grass at a shot, and dust at a tackle', () => {
    const match = fixtureMatch();
    const effects = createEffects();

    tickWith(effects, match, [{ type: 'shot', player: 9, power: 0.4, move: null }]);
    tickWith(effects, match, [{ type: 'tackle', player: 12, target: 9, won: true }]);

    expect(kinds(effects)).toEqual(['grass', 'dust']);
  });

  it('keeps each effect only for its lifetime', () => {
    const match = fixtureMatch();
    const effects = createEffects();

    tickWith(effects, match, [{ type: 'tackle', player: 12, target: 9, won: true }]);

    for (let i = 0; i < LIFETIMES.dust; i += 1) {
      tickWith(effects, match);
    }

    expect(kinds(effects)).toEqual([]);
  });

  it('kicks up dust where a player at speed turns sharply, and along a slide', () => {
    const match = fixtureMatch();
    const effects = createEffects();
    const runner = match.players[5];

    Object.assign(runner, { vx: 2.4, vy: 0 });
    tickWith(effects, match);
    Object.assign(runner, { vx: -2.2, vy: 0.4 });
    tickWith(effects, match);

    expect(kinds(effects)).toEqual(['dust']);

    Object.assign(match.players[14], { tackle: 10 });

    for (let i = 0; i < 8; i += 1) {
      tickWith(effects, match);
    }

    expect(kinds(effects).length).toBeGreaterThan(2);
  });

  it('flashes and shakes the view at a goal, and keeps who scored', () => {
    const match = fixtureMatch();
    const effects = createEffects();
    const camera = createCamera(match);

    tickWith(effects, match, [{ type: 'goal', team: 1, scorer: 20, move: null }], camera);

    expect(effects.flash.born).toBe(match.tick);
    expect(camera.shake.power).toBeGreaterThan(0);
    expect(scoringTeamOf(match, effects)).toBe(1);
  });

  it('follows a special shot from the foot after its cut-in until somebody has the ball', () => {
    const match = fixtureMatch();
    const effects = createEffects();

    match.ball.owner = 9;
    match.phase = 'duel';
    tickWith(effects, match, [{ type: 'special', player: 9, move: 'naga-shot' }]);

    expect(isFlying(effects)).toBe(false);

    match.phase = 'play';
    Object.assign(match.ball, { owner: null, vx: 12 });
    tickWith(effects, match);
    tickWith(effects, match);

    expect(isFlying(effects)).toBe(true);

    match.ball.owner = 0;
    tickWith(effects, match);

    expect(isFlying(effects)).toBe(false);
  });

  it('leaves a dribble special no ball trail: the dribbler carries his own', () => {
    const match = fixtureMatch();
    const effects = createEffects();

    match.phase = 'duel';
    tickWith(effects, match, [{ type: 'special', player: 9, move: 'hanuman-leap' }]);
    match.phase = 'play';
    tickWith(effects, match);

    expect(effects.flight).toBeNull();
    expect(effects.carries.map((carry) => carry.player)).toEqual([9]);
  });

  it('draws the same effects the same way every time, with no random of its own', () => {
    const random = vi.spyOn(Math, 'random');
    const drawnOnce = () => {
      const match = fixtureMatch();
      const effects = createEffects();
      const { context, calls } = createRecordingContext();

      tickWith(effects, match, [{ type: 'shot', player: 9, power: 0.9, move: null }]);
      tickWith(effects, match, [{ type: 'tackle', player: 12, target: 9, won: true }]);
      match.tick += 5;
      drawEffects(context, effects, { camera: createCamera(match), match });

      return JSON.stringify(calls);
    };

    expect(drawnOnce()).toBe(drawnOnce());
    expect(random).not.toHaveBeenCalled();
    random.mockRestore();
  });
});
