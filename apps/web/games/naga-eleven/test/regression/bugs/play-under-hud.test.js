import { describe, expect, it } from 'vitest';
import { newSave, teamSpecFor } from '../../../src/campaign/index.js';
import { TEAMS } from '../../../src/data/teams/index.js';
import { project } from '../../../src/render/camera.js';
import { HUD_COVER } from '../../../src/render/camera/room.js';
import { createMatch } from '../../../src/sim/create-match.js';
import { attachDuels } from '../../../src/sim/duel/index.js';
import { watchCamera } from '../../support/camera-watch.js';
import { createDecentHuman } from '../../support/decent-human/index.js';

// The camera let the ball rest 104 pixels over the middle of the view, so the players by it stood
// with their heads in the score, the player card and the minimap's band while the bottom of the
// view was empty grass: in an 11 v 11 the ball was that high for a quarter of open play. A
// footballer stands 58 pixels over his feet; the camera keeps the ball's spot low enough that a
// head by it clears the HUD's boxes.
const SPRITE = 58;
const STORY_SIDES = { 7: ['chrey-school', 'royal-kids'], 11: ['cambodia-youth', 'japan-youth'] };

function shareUnderHud(match, step) {
  let play = 0;
  let under = 0;
  const check = (camera, each) => {
    if (each.phase === 'play') {
      play += 1;
      under += project(camera, each.ball.x, each.ball.y).y - SPRITE < HUD_COVER ? 1 : 0;
    }
  };

  watchCamera(match, { step, check });

  return under / play;
}

describe.each(['7', '11'])('open play in a %s a side match', (format) => {
  it('stands clear of the HUD at the top of the view, the computer playing', () => {
    expect(shareUnderHud(createMatch({ seed: 2, format, halfSeconds: 60 }))).toBeLessThan(0.01);
  });

  it('stands clear of the HUD at the top of the view, a player steering', () => {
    const save = newSave();
    const teams = STORY_SIDES[format].map((id) => teamSpecFor(save, id, TEAMS));
    const match = createMatch({ seed: 5, humanTeam: 0, format, teams, halfSeconds: 60 });

    attachDuels(match);

    expect(shareUnderHud(match, createDecentHuman(5).step)).toBeLessThan(0.01);
  });
});
