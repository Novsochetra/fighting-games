import { describe, expect, it } from 'vitest';
import { newSave, teamSpecFor } from '../../../../src/campaign/index.js';
import { TEAMS } from '../../../../src/data/teams/index.js';
import { project } from '../../../../src/render/camera.js';
import { createMatch } from '../../../../src/sim/create-match.js';
import { attachDuels } from '../../../../src/sim/duel/index.js';
import { isOnView, watchCamera } from '../../../support/camera-watch.js';
import { createDecentHuman } from '../../../support/decent-human/index.js';

// the calm camera holds still while the play stays in the middle of the view, but whatever the
// sim does it keeps the ball in view, long balls and all, and the player the human steers too
// whenever the view can hold the two
const STORY_SIDES = { 7: ['chrey-school', 'royal-kids'], 11: ['cambodia-youth', 'japan-youth'] };

function humanMatch(format, seed) {
  const save = newSave();
  const teams = STORY_SIDES[format].map((id) => teamSpecFor(save, id, TEAMS));
  const match = createMatch({ seed, humanTeam: 0, format, teams, halfSeconds: 60 });

  attachDuels(match);

  return match;
}

const groundOf = (camera, point) => project(camera, point.x, point.y);

// each test plays whole matches, which can take longer than vitest's five seconds while every
// other test file runs beside it
const SLOW = { timeout: 60000 };

describe.each(['7', '11'])('the live camera over a real %s a side match', (format) => {
  it('keeps the ball inside the view on every tick of open play and of each kick off', SLOW, () => {
    const missed = [];
    const check = (camera, match) => {
      const isWatched = match.phase === 'play' || match.phase === 'kickoff';

      if (isWatched && !isOnView(groundOf(camera, match.ball), 24)) {
        missed.push({ tick: match.tick, phase: match.phase, ball: { ...match.ball } });
      }
    };

    for (const seed of [3, 4]) {
      watchCamera(createMatch({ seed, format, halfSeconds: 60 }), { check });
    }

    expect(missed).toEqual([]);
  });

  it('keeps a ball in flight in view, high balls too', SLOW, () => {
    let flights = 0;
    let missed = 0;
    const check = (camera, match) => {
      const { ball } = match;
      const isFlying = match.phase === 'play' && ball.owner === null && Math.abs(ball.vx) > 8;

      flights += isFlying ? 1 : 0;
      missed += isFlying && !isOnView(project(camera, ball.x, ball.y, ball.z), 0) ? 1 : 0;
    };

    for (const seed of [5, 6, 7]) {
      watchCamera(createMatch({ seed, format, halfSeconds: 60 }), { check });
    }

    expect(flights).toBeGreaterThan(30);
    expect(missed).toBe(0);
  });

  it('shows the player the human steers on nine ticks in ten of open play', SLOW, () => {
    let play = 0;
    let shown = 0;
    const check = (camera, match) => {
      const steered = match.players[match.controlled ?? -1];

      if (match.phase === 'play' && steered) {
        play += 1;
        shown += isOnView(groundOf(camera, steered), 8) ? 1 : 0;
      }
    };
    const match = humanMatch(format, 2);
    const human = createDecentHuman(2);

    watchCamera(match, { step: human.step, check });

    expect(play).toBeGreaterThan(3000);
    expect(shown / play).toBeGreaterThan(0.9);
  });
});
