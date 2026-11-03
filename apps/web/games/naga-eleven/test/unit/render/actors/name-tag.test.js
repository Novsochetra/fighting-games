import { describe, expect, it } from 'vitest';
import { UI_SCALE } from '../../../../src/config.js';
import { looksOf } from '../../../../src/render/actors/looks.js';
import { drawNameTags } from '../../../../src/render/actors/name-tag.js';
import { createCamera, project } from '../../../../src/render/camera.js';
import { createRecordingContext } from '../../../support/recording-context.js';
import { fixtureMatch } from '../../../integration/render/actors/match-fixture.js';

const STAND = 58;

// a star by the ball, named; where his tag's point comes down to, in the UI's pixels
function tagTipOver(player, match) {
  const camera = createCamera(match);
  const { context, calls } = createRecordingContext();

  context.measureText = (text) => ({ width: [...text].length * 5 });
  camera.pan = null;
  Object.assign(match.ball, { x: player.x + 20, y: player.y });
  drawNameTags(context, camera, match, { lang: 'en', looks: looksOf(match), standHeight: STAND });

  const rects = calls.filter((call) => call.name === 'fillRect').map((call) => call.args);

  return {
    tip: Math.max(...rects.map(([, y, , height]) => y + height)),
    feet: project(camera, player.x, player.y).y / UI_SCALE,
  };
}

const starOf = (match) =>
  match.players.find((player) => player.star && player.index !== match.controlled);

describe('a star’s name tag', () => {
  it('floats just over the head of a player on his feet', () => {
    const match = fixtureMatch({ format: '11' });
    const { tip, feet } = tagTipOver(starOf(match), match);

    expect(feet - tip).toBeGreaterThan(STAND / UI_SCALE);
    expect(feet - tip).toBeLessThan(STAND / UI_SCALE + 6);
  });

  // the tag floated 50 pixels over a keeper lying on the grass after a dive
  it('comes down to a player on the ground', () => {
    const match = fixtureMatch({ format: '11' });
    const star = starOf(match);

    star.dive = { tick: match.tick - 20, side: 1 };

    const { tip, feet } = tagTipOver(star, match);

    expect(feet - tip).toBeLessThan(20);
  });
});
