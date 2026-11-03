import { describe, expect, it } from 'vitest';

import { shakeOffset } from '../../../../src/render/duel/draw-show.js';
import { createDuelShow, isShowDone } from '../../../../src/render/duel/show.js';
import { IMPACT_TICK, STAGE_TICKS } from '../../../../src/render/duel/stages.js';
import { updateDuelShow } from '../../../../src/render/duel/timeline.js';
import { finishDuel } from '../../../../src/sim/duel/index.js';
import { fakeMatch, forwardOn, giveBall, startMeeting } from '../../../support/duel-fixtures.js';

// the app's loop: the show and the match tick together until the show is done
function run(match, show, { press = () => ({}), most = 2000 } = {}) {
  const stages = [];

  for (let i = 0; i < most && !isShowDone(show); i += 1) {
    updateDuelShow(show, { pressed: press(show) });

    if (match.duel) {
      match.hooks.duelTick(match);
    }

    if (stages.at(-1) !== show.stage) {
      stages.push(show.stage);
    }
  }

  return stages;
}

describe('a duel show from start to end', () => {
  it('plays the splash, waits on the menu, then the clash and the result', () => {
    const match = fakeMatch();

    startMeeting(match);

    const show = createDuelShow(match);
    const stages = run(match, show, {
      press: (each) => ({ pass: each.stage === 'menu' && each.stageTicks > 30 }),
    });

    expect(stages.slice(0, 4)).toEqual(['intro', 'versus', 'menu', 'wait']);
    expect(stages).toContain('clash');
    expect(stages).toContain('result');
    expect(stages.at(-1)).toBe('done');
    expect(match.duel.stage).toBe('done');
    expect(finishDuel(match)).toBe(true);
  });

  it('never opens the menu when the computer picks both sides', () => {
    const match = fakeMatch({ humanTeam: null });

    startMeeting(match);

    expect(run(match, createDuelShow(match))).not.toContain('menu');
  });

  it("announces a special with its owner's cut-in, then plays the save cam at the keeper", () => {
    const match = fakeMatch({ humanTeam: null });
    const shooter = Object.assign(forwardOn(match, 0), {
      star: 'sochetra',
      x: 850,
      moves: ['naga-shot'],
      spirit: 99,
    });

    giveBall(match, shooter);
    match.hooks.special(match, shooter);

    const show = createDuelShow(match);
    const stages = run(match, show);

    expect(show.cutins).toEqual(['attack']);
    expect(stages).toEqual([
      'intro',
      'versus',
      'wait',
      'cutin',
      'saveCam',
      'result',
      'outro',
      'done',
    ]);
    expect(show.saveCam.moment.move).toBe('naga-shot');
    expect(show.saveCam.ticks).toBe(STAGE_TICKS.saveCam);
  });

  it('clashes two stars in the field, shaking at the impact', () => {
    const match = fakeMatch({ humanTeam: null });

    startMeeting(match);

    const show = createDuelShow(match);
    let shook = 0;

    for (let i = 0; i < 2000 && !isShowDone(show); i += 1) {
      updateDuelShow(show, {});
      match.hooks.duelTick(match);

      if (show.stage === 'clash' && show.stageTicks === IMPACT_TICK + 1) {
        shook = show.shake;
      }
    }

    expect(shook).toBeGreaterThan(0);
  });

  it('shakes by whole pixels, the same for the same frame', () => {
    const show = { shake: 12, ticks: 40 };

    expect(shakeOffset(show)).toEqual(shakeOffset({ ...show }));
    expect(Number.isInteger(shakeOffset(show).x)).toBe(true);
    expect(shakeOffset({ shake: 0, ticks: 40 })).toEqual({ x: 0, y: 0 });
  });

  it('is done at once with no duel to show', () => {
    expect(isShowDone(createDuelShow(fakeMatch()))).toBe(true);
  });
});
