import { describe, expect, it } from 'vitest';

import { createDuelShow, isShowDone } from '../../src/render/duel/show.js';
import { updateDuelShow } from '../../src/render/duel/timeline.js';
import { fakeMatch, forwardOn, giveBall, keeperOn } from '../support/duel-fixtures.js';

// the Naga Shot struck at Farhad, the computer on both sides: each stage of its show and how many
// ticks it ran, as the cinematic camera plays it (his Mountain Guard's cut-in runs on straight
// from the shot's where nothing comes between them)
function stagesOf(cinema) {
  const match = fakeMatch({ seed: 3, humanTeam: null });
  const shooter = Object.assign(forwardOn(match, 0), {
    star: 'sochetra',
    x: 850,
    moves: ['naga-shot'],
    spirit: 200,
  });

  Object.assign(keeperOn(match, 1), { star: 'farhad', moves: ['mountain-guard'], spirit: 200 });
  giveBall(match, shooter);
  match.hooks.special(match, shooter);

  const show = createDuelShow(match, { heroAge: 'young', cinema });
  const stages = [];

  for (let i = 0; i < 3000 && !isShowDone(show); i += 1) {
    updateDuelShow(show, {});
    match.hooks.duelTick(match);

    if (stages.at(-1)?.[0] !== show.stage) {
      stages.push([show.stage, 0]);
    }

    stages.at(-1)[1] += 1;
  }

  return stages.map(([stage, ticks]) => `${stage} ${ticks}`);
}

const SHOW_BEFORE_THE_CAMERA = [
  'intro 23',
  'versus 64',
  'wait 1',
  'cutin 128',
  'saveCam 96',
  'result 84',
  'outro 24',
  'done 1',
];

describe("a special's show, as recorded", () => {
  it('plays as it always did with the cinematic camera off, and on short', () => {
    expect(stagesOf('off')).toEqual(SHOW_BEFORE_THE_CAMERA);
    expect(stagesOf('short')).toEqual(SHOW_BEFORE_THE_CAMERA);
  });

  it('rides the ball to the goal between the shooter and the keeper on full', () => {
    expect(stagesOf('full')).toEqual([
      'intro 23',
      'versus 64',
      'wait 1',
      'cutin 64',
      'chase 40',
      'cutin 64',
      'saveCam 96',
      'result 84',
      'outro 24',
      'done 1',
    ]);
  });
});
