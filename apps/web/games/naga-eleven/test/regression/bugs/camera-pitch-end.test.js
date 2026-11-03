import { describe, expect, it } from 'vitest';
import { newSave, teamSpecFor } from '../../../src/campaign/index.js';
import { TEAMS } from '../../../src/data/teams/index.js';
import { clampAlong } from '../../../src/render/camera/bounds.js';
import { createMatch } from '../../../src/sim/create-match.js';
import { attachDuels } from '../../../src/sim/duel/index.js';
import { watchCamera } from '../../support/camera-watch.js';
import { createDecentHuman } from '../../support/decent-human/index.js';

// On a shot near a goal the 11 v 11 camera whipped after the ball and stopped dead at the end of
// its rail: its pace climbed to 5.6 world units a tick in 5 ticks, then dropped to nothing against
// the bound, and its pace changed by over 0.8 a tick dozens of times a match. These lock in a
// calm camera at both sizes of pitch: it gathers and sheds pace gently and eases into each end
// of its rail. Pace is the camera's travel along the touchline, in world units a tick.
const STORY_SIDES = { 7: ['chrey-school', 'royal-kids'], 11: ['cambodia-youth', 'japan-youth'] };
const MOST_CHANGE = 0.3;
// arriving at an end of the rail faster than this is a dead stop
const DEAD_STOP_PACE = 1;
// further than this in a tick is a cut to a new shot, not a pan
const CUT = 40;

function played(format, seed, human) {
  if (!human) {
    return { match: createMatch({ seed, format, halfSeconds: 60 }), step: () => {} };
  }

  const save = newSave();
  const teams = STORY_SIDES[format].map((id) => teamSpecFor(save, id, TEAMS));
  const match = createMatch({ seed, humanTeam: 0, format, teams, halfSeconds: 60 });

  attachDuels(match);

  return { match, step: createDecentHuman(seed).step };
}

const railEnds = (camera) =>
  [-Infinity, Infinity].map((x) => clampAlong(camera.bounds, camera.lens, { x }));

const isAtEnd = (camera, x) => railEnds(camera).some((end) => Math.abs(end - x) < 0.01);

function noteArrival(pace, camera, { x, last }) {
  const isArriving = isAtEnd(camera, x) && !isAtEnd(camera, last.x);

  pace.deadStops += isArriving && Math.abs(last.speed ?? 0) > DEAD_STOP_PACE ? 1 : 0;
}

// the along pace of the live camera on each tick that follows a live tick
function watchPace(format, seed, human) {
  const pace = { last: null, most: 0, deadStops: 0, ticks: 0 };
  const check = (camera, match) => {
    const x = camera.along.value;
    const { last } = pace;
    const isFollowing = last && last.tick === match.tick - 1 && Math.abs(x - last.x) < CUT;
    const speed = isFollowing ? x - last.x : null;

    if (isFollowing && last.speed !== null) {
      pace.most = Math.max(pace.most, Math.abs(speed - last.speed));
      pace.ticks += 1;
      noteArrival(pace, camera, { x, last });
    }

    pace.last = { tick: match.tick, x, speed };
  };
  const { match, step } = played(format, seed, human);

  watchCamera(match, { step, check });

  return pace;
}

describe.each(['11', '7'])('the camera along the touchline in a %s a side match', (format) => {
  const watches = [1, 2, 3].flatMap((seed) => [
    watchPace(format, seed, true),
    watchPace(format, seed, false),
  ]);

  it('watches a whole match of live play', () => {
    for (const watch of watches) {
      expect(watch.ticks).toBeGreaterThan(5000);
    }
  });

  it(`changes its pace by under ${MOST_CHANGE} units a tick from one tick to the next`, () => {
    expect(Math.max(...watches.map((watch) => watch.most))).toBeLessThan(MOST_CHANGE);
  });

  it('eases into each end of its rail, never stopping dead against it', () => {
    expect(watches.map((watch) => watch.deadStops)).toEqual(watches.map(() => 0));
  });
});
