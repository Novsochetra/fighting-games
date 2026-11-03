import { describe, expect, it } from 'vitest';
import { UI_SCALE } from '../../../src/config.js';
import { createCamera, project, updateCamera } from '../../../src/render/camera.js';
import { bannerTopFor } from '../../../src/render/hud/banner-slot.js';
import { BANNER } from '../../../src/render/hud/layout.js';
import { createMatch } from '../../../src/sim/create-match.js';
import { drainEvents } from '../../../src/sim/events.js';
import { tick } from '../../../src/sim/tick.js';

// The GOAL band crossed the view a little over its middle and covered the ball in the net, then
// the scorer the camera turned to. The camera now looks at the net, then the scorer, straight on,
// and the band crosses the lower third, or just under the HUD for a scorer low in the view.
const SPRITE = 58;
const BAND_TICKS = 120;
// the camera keeps the net for its first ticks, then glides to the scorer
const NET_TICKS = 45;
const ON_SCORER = 90;

// the band and the scorer's name under it, in the world's pixels, where it crosses on this frame
function crossesBand(camera, match, { top, bottom }) {
  const slot = bannerTopFor(camera, match);

  return bottom > slot * UI_SCALE && top < (slot + BANNER.height + 16) * UI_SCALE;
}

function step(match, camera) {
  tick(match);
  updateCamera(camera, match);
  drainEvents(match);
}

// a shot struck into the far goal by the side's forward, the keeper drawn off his line, a while
// into the match
function scoreAt(match, camera, at) {
  while (match.tick < at || match.phase !== 'play') {
    step(match, camera);
  }

  const forward = match.players.find((player) => player.team === 0 && player.role === 'forward');
  const keeper = match.players.find((player) => player.team === 1 && player.role === 'keeper');
  const { length, width } = match.pitch;

  keeper.y = 40;
  Object.assign(match.ball, { owner: null, kick: null, x: length - 12, y: width / 2 + 15 });
  Object.assign(match.ball, { z: 8, vx: 7, vy: 0, vz: 0, lastTouch: forward.index });

  for (let i = 0; i < 30 && match.phase !== 'goal'; i += 1) {
    step(match, camera);
  }

  return forward.index;
}

function hiddenWhileCheered(match, camera, scorer) {
  const hidden = [];

  while (match.phase === 'goal' && match.phaseTicks < BAND_TICKS) {
    const { ball } = match;
    const net = project(camera, ball.x, ball.y, Math.max(0, ball.z));
    const player = match.players[scorer];
    const feet = project(camera, player.x, player.y);
    const isNetHidden =
      match.phaseTicks < NET_TICKS &&
      crossesBand(camera, match, { top: net.y - 6, bottom: net.y + 6 });
    const isScorerHidden =
      match.phaseTicks >= ON_SCORER &&
      crossesBand(camera, match, { top: feet.y - SPRITE, bottom: feet.y });

    if (isNetHidden || isScorerHidden) {
      hidden.push({ tick: match.tick, age: match.phaseTicks });
    }

    step(match, camera);
  }

  return hidden;
}

describe.each(['7', '11'])('a %s a side goal', (format) => {
  it('leaves the ball in the net and the scorer clear of the GOAL band', () => {
    const match = createMatch({ seed: 3, format, halfSeconds: 60 });
    const camera = createCamera(match);
    const hidden = [400, 1200, 2000].flatMap((at) =>
      hiddenWhileCheered(match, camera, scoreAt(match, camera, at)),
    );

    expect(match.score[0]).toBeGreaterThanOrEqual(3);
    expect(hidden).toEqual([]);
  });
});
