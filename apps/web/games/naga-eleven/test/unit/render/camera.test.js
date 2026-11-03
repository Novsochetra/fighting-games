import { describe, expect, it } from 'vitest';
import { WORLD_VIEW } from '../../../src/config.js';
import {
  createCamera,
  panCamera,
  PIXELS_PER_UNIT,
  project,
  shakeCamera,
} from '../../../src/render/camera.js';
import { DEAD_ZONE } from '../../../src/render/camera/dead-zone.js';
import { inView, lookOf, matchOf, run } from './camera/fixture.js';

const middleX = WORLD_VIEW.width / 2;

const ballOnView = (camera, match) => project(camera, match.ball.x, match.ball.y);

describe('the broadcast camera', () => {
  it('draws the near touchline at PIXELS_PER_UNIT and the far one smaller and higher', () => {
    const match = matchOf();
    const camera = createCamera(match);
    const near = project(camera, 900, match.pitch.width);
    const far = project(camera, 900, 0);

    expect(near.scale).toBeCloseTo(PIXELS_PER_UNIT);
    expect(far.scale).toBeLessThan(near.scale * 0.75);
    expect(far.y).toBeLessThan(near.y);
  });

  it('closes the goal lines in toward the back and lifts what is off the grass by its height', () => {
    const camera = createCamera(matchOf());
    const nearCorner = project(camera, 0, 1080);
    const farCorner = project(camera, 0, 0);
    const ground = project(camera, 300, 400);
    const high = project(camera, 300, 400, 30);

    expect(farCorner.x).toBeGreaterThan(nearCorner.x);
    expect(ground.y - high.y).toBeCloseTo(30 * ground.scale);
    expect(high.x).toBeCloseTo(ground.x);
  });

  it('puts what it looks at in the middle column of the view', () => {
    const camera = createCamera(matchOf());
    const look = lookOf(camera);

    expect(project(camera, look.x, look.y).x).toBeCloseTo(middleX);
  });

  it('opens a kickoff on a sweep from one end to the centre spot', () => {
    const match = matchOf('11', { phase: 'kickoff' });
    const camera = createCamera(match);
    const start = lookOf(camera).x;

    run(camera, match, 200);

    expect(start).toBeLessThan(match.pitch.length / 3);
    expect(lookOf(camera).x).toBeCloseTo(match.pitch.length / 2, 0);
  });

  it('gives up the sweep and follows the ball once the kick off is played', () => {
    const match = matchOf('11', { phase: 'kickoff' });
    const camera = createCamera(match);

    run(camera, match, 30);
    match.phase = 'play';
    run(camera, match, 1);

    expect(camera.pan).toBeNull();
    expect(Math.abs(camera.along.velocity)).toBeGreaterThan(0);
  });

  it('holds still while the ball moves about the middle of the view', () => {
    const match = matchOf();
    const camera = createCamera(match);
    const centre = match.ball.x;
    const looks = new Set();

    run(camera, match, 300, {
      step: (each, i) => {
        each.ball.x = centre + (Math.floor(i / 20) % 2 === 0 ? 50 : -50);
        each.ball.y = each.pitch.width / 2 + (Math.floor(i / 30) % 2 === 0 ? 40 : -40);
      },
      check: () => looks.add(`${lookOf(camera).x} ${lookOf(camera).y}`),
    });

    expect([...looks]).toEqual([`${centre} ${match.pitch.width / 2}`]);
  });

  it('moves only as far as keeps a run inside its window, never overshooting', () => {
    const match = matchOf();
    const camera = createCamera(match);
    const path = [];

    run(camera, match, 300, {
      step: (each, i) => {
        each.ball.vx = i < 100 ? 3 : 0;
        each.ball.x += each.ball.vx;
      },
      check: () => path.push(lookOf(camera).x),
    });

    const settled = ballOnView(camera, match).x - middleX;

    path.slice(1).forEach((x, i) => expect(x).toBeGreaterThanOrEqual(path[i] - 0.01));
    expect(settled).toBeGreaterThan(0);
    expect(settled).toBeLessThanOrEqual(DEAD_ZONE.side + 0.5);
  });

  // the view is wide, so a run keeps most of it ahead; the lead holds the ball short of the edge of
  // the window it would run on to without one
  it('frames room ahead toward the goal of the side that runs with the ball', () => {
    const carried = (team) => {
      const match = matchOf();
      const camera = createCamera(match);
      const way = team === 0 ? 1 : -1;

      Object.assign(match.ball, { owner: team, x: 900 - 500 * way });
      match.players[team].x = match.ball.x;
      run(camera, match, 150, {
        step: (each) => {
          Object.assign(each.players[team], { vx: 3 * way, x: each.players[team].x + 3 * way });
          Object.assign(each.ball, { vx: 3 * way, x: each.ball.x + 3 * way });
        },
      });

      return ballOnView(camera, match).x - middleX;
    };

    expect(carried(0)).toBeLessThan(DEAD_ZONE.side - 40);
    expect(carried(1)).toBeGreaterThan(-(DEAD_ZONE.side - 40));
  });

  it('turns round slowly when the other side wins the ball', () => {
    const match = matchOf();
    const camera = createCamera(match);
    const speeds = [];

    match.ball.owner = 0;
    run(camera, match, 600);
    match.ball.owner = 1;
    run(camera, match, 60, { check: () => speeds.push(Math.abs(camera.along.velocity)) });

    expect(Math.max(...speeds)).toBeLessThan(1.5);
  });

  it('keeps a long ball in the view on every tick of its flight', () => {
    const match = matchOf('11', { ball: { x: 300, y: 900, vx: 13, vy: -6 } });
    const camera = createCamera(match);

    run(camera, match, 90, {
      step: (each) => {
        each.ball.x += each.ball.vx;
        each.ball.y = Math.max(40, each.ball.y + each.ball.vy);
      },
      check: (each) => expect(inView(project(camera, each.ball.x, each.ball.y))).toBe(true),
    });
  });

  it('pans in depth on a pitch deeper than the view', () => {
    const depthFor = (y) => {
      const match = matchOf('11', { ball: { y } });
      const camera = createCamera(match);

      run(camera, match, 240);

      return { look: lookOf(camera).y, ball: project(camera, match.ball.x, y) };
    };
    const far = depthFor(60);
    const near = depthFor(1040);

    expect(near.look - far.look).toBeGreaterThan(150);
    expect(inView(far.ball) && inView(near.ball)).toBe(true);
  });

  it('stops before the near touchline shows past the nets at either end, or past the venue in depth', () => {
    for (const format of ['7', '11']) {
      const match = matchOf(format, { ball: { x: -200, y: -100 } });
      const camera = createCamera(match);
      const limit = match.goal.depth + 60;

      run(camera, match, 300);

      const look = lookOf(camera);
      const nearCorner = project(camera, -limit, match.pitch.width);
      const farLine = project(camera, look.x, 0);

      expect(nearCorner.x).toBeLessThanOrEqual(0);
      expect(farLine.y).toBeGreaterThan(WORLD_VIEW.height * 0.3);
    }
  });

  it('cuts to a ball set down out of view, and pans to one set down in view', () => {
    const match = matchOf();
    const camera = createCamera(match);

    match.ball.x = 300;
    run(camera, match, 300);
    match.ball.x = 1300;
    run(camera, match, 1);

    expect(ballOnView(camera, match).x).toBeCloseTo(middleX);
    expect(camera.along.velocity).toBe(0);

    match.ball.x -= 150;
    run(camera, match, 1);

    expect(ballOnView(camera, match).x).toBeLessThan(middleX - 100);
  });

  it('shakes by whole pixels on a goal, and settles again', () => {
    const match = matchOf();
    const camera = createCamera(match);

    run(camera, match, 30);

    const still = project(camera, 900, 540);

    shakeCamera(camera, 6);
    run(camera, match, 1);

    const shaken = project(camera, 900, 540);

    run(camera, match, 60);

    expect(Number.isInteger(camera.shake.x) && Number.isInteger(camera.shake.y)).toBe(true);
    expect(Math.abs(shaken.x - still.x) + Math.abs(shaken.y - still.y)).toBeGreaterThan(0);
    expect(camera.shake).toMatchObject({ power: 0, x: 0, y: 0 });
  });

  it('glides to a point on a cinematic pan, then frames the ball again', () => {
    const match = matchOf();
    const camera = createCamera(match);

    run(camera, match, 60);
    panCamera(camera, { x: 600, y: 400, ticks: 40 });
    run(camera, match, 40);

    expect(lookOf(camera).x).toBeCloseTo(600, 0);

    run(camera, match, 200);

    expect(Math.abs(ballOnView(camera, match).x - middleX)).toBeLessThanOrEqual(
      DEAD_ZONE.side + 0.5,
    );
  });

  it('sees the goal in the net first, then follows the scorer as they run off to celebrate', () => {
    const match = matchOf();
    const camera = createCamera(match);
    const scorer = match.players[0];

    run(camera, match, 30);
    Object.assign(match, {
      phase: 'goal',
      phaseTicks: 0,
      score: [1, 0],
      events: [{ type: 'goal', team: 0, scorer: 0 }],
    });
    run(camera, match, 40, {
      step: () => {
        match.events = [];
        scorer.x = Math.min(1500, scorer.x + 3);
      },
    });

    expect(inView(ballOnView(camera, match))).toBe(true);
    expect(lookOf(camera).x).toBeLessThan(scorer.x - 60);

    run(camera, match, 200, {
      step: () => {
        scorer.x = Math.min(1500, scorer.x + 3);
      },
    });

    expect(lookOf(camera).x).toBeGreaterThan(1300);
  });
});
