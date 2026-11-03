import { describe, expect, it } from 'vitest';
import { createActorArt, loadSprites } from '../../../src/render/actors/index.js';
import { looksOf } from '../../../src/render/actors/looks.js';
import { createCamera, panCamera, updateCamera } from '../../../src/render/camera.js';
import { drawFrame, sceneOf } from '../../../src/render/draw-frame.js';
import { createEffects, updateEffects } from '../../../src/render/effects/index.js';
import { VENUES as VENUE_SPECS } from '../../../src/render/venues/catalog.js';
import { prepareVenue } from '../../../src/render/venues/index.js';
import { createPixelCanvas } from '../../support/pixel-canvas.js';
import { createRecordingContext } from '../../support/recording-context.js';
import { FAKE_KIT, FAKE_SPRITES, fakeImageLoader } from '../../support/fake-sprites.js';
import { attackingMatch, fixtureMatch } from './actors/match-fixture.js';

const VENUES = { 7: 'village-field', 11: 'national-stadium' };

const MOMENTS = {
  kickoff: (format) => fixtureMatch({ format, phase: 'kickoff' }),
  attack: (format) => attackingMatch(format),
  goal: (format) =>
    Object.assign(attackingMatch(format), {
      phase: 'goal',
      phaseTicks: 12,
      score: [1, 0],
      lastScorer: 0,
    }),
  fullTime: (format) =>
    Object.assign(fixtureMatch({ format, phase: 'over' }), { half: 2, minute: 90, score: [2, 1] }),
};

async function artWith(sprites) {
  if (!sprites) {
    return createActorArt({ createCanvas: createPixelCanvas });
  }

  const loaded = await loadSprites(FAKE_SPRITES, { loadImage: fakeImageLoader().loadImage });

  return createActorArt({ sprites: loaded, sourceKit: FAKE_KIT, createCanvas: createPixelCanvas });
}

function cameraOn(match) {
  const camera = createCamera(match);

  camera.pan = null;

  for (let i = 0; i < 90; i += 1) {
    updateCamera(camera, match);
  }

  return camera;
}

function effectsOf(match, camera) {
  const effects = createEffects();

  if (match.phase === 'goal') {
    match.events = [{ type: 'goal', team: 0, scorer: match.controlled, move: null }];
    updateEffects(effects, match, { camera });
    match.events = [];
  }

  return effects;
}

const hexAt = (data, at) =>
  `#${[0, 1, 2].map((i) => data[at + i].toString(16).padStart(2, '0')).join('')}`;

function coloursOf(canvas) {
  const found = new Set();

  for (let at = 0; at < canvas.data.length; at += 4) {
    found.add(hexAt(canvas.data, at));
  }

  return found;
}

// a recording context measures each letter 5 px wide, as the pixel font near enough does
function recorder() {
  const recording = createRecordingContext();

  recording.context.measureText = (text) => ({ width: [...text].length * 5 });

  return recording;
}

const wearsBothKits = (match, colours) =>
  looksOf(match).kits.every((kit) => kit.outfield.shirt.some((shade) => colours.has(shade)));

const numbersOf = (calls) =>
  calls.flatMap((call) => call.args).filter((arg) => typeof arg === 'number');

describe.each(['7', '11'])('a %s a side frame', (format) => {
  describe.each([false, true])('with sprites: %s', (sprites) => {
    it.each(Object.keys(MOMENTS))(
      'draws the %s, the players in their kits, with no NaN',
      async (moment) => {
        const match = MOMENTS[moment](format);
        const camera = cameraOn(match);
        const options = {
          venue: VENUES[format],
          effects: effectsOf(match, camera),
          createCanvas: createPixelCanvas,
        };
        const canvas = createPixelCanvas(768, 432);
        const { context, calls } = recorder();

        drawFrame(canvas.getContext('2d'), match, camera, {
          ...options,
          actors: await artWith(sprites),
        });
        drawFrame(context, match, camera, { ...options, actors: await artWith(sprites) });

        expect(wearsBothKits(match, coloursOf(canvas))).toBe(true);
        expect(numbersOf(calls).every(Number.isFinite)).toBe(true);
      },
    );
  });
});

describe('the words of a frame', () => {
  const textsOf = (match, options = {}) => {
    const { context, calls } = recorder();

    drawFrame(context, match, cameraOn(match), { createCanvas: createPixelCanvas, ...options });

    return calls.filter((call) => call.name === 'fillText').map((call) => call.args[0]);
  };

  it('shows the score, the minute and the banner of the moment', () => {
    expect(textsOf(MOMENTS.kickoff('11'))).toEqual(
      expect.arrayContaining(['0-0', "12'", 'K', 'O']),
    );
    expect(textsOf(MOMENTS.goal('11'))).toEqual(
      expect.arrayContaining(['1-0', 'G', '!', 'SOCHETRA']),
    );
    expect(textsOf(MOMENTS.fullTime('11'))).toEqual(expect.arrayContaining(['2-1', "90'", 'F']));
  });

  // the HUD's band showed either side of the half-time board, the minimap over its corner, and
  // KICK OFF twice, once landed by the opening card and once by the HUD
  it('leaves television its half time, full time and opening kick off', () => {
    const opening = Object.assign(MOMENTS.kickoff('11'), { tick: 20, phaseTicks: 20 });
    const halfTime = Object.assign(fixtureMatch({ phase: 'halfTime' }), { score: [1, 0] });

    expect(textsOf(halfTime, { tv: true })).toEqual([]);
    expect(textsOf(MOMENTS.fullTime('11'), { tv: true })).toEqual([]);
    expect(textsOf(opening, { tv: true })).toEqual(expect.arrayContaining(['0-0']));
    expect(textsOf(opening, { tv: true })).not.toContain('K');
    expect(textsOf(opening)).toContain('K');
  });

  it('still shows KICK OFF under television after a goal and at the second half', () => {
    const afterGoal = Object.assign(MOMENTS.kickoff('11'), { tick: 900, phaseTicks: 20 });
    const second = Object.assign(MOMENTS.kickoff('11'), { half: 2, tick: 20, phaseTicks: 20 });

    expect(textsOf(afterGoal, { tv: true })).toContain('K');
    expect(textsOf(second, { tv: true })).toContain('K');
  });
});

describe('the venue under a frame', () => {
  it("is drawn from what prepareVenue baked on the actors' canvases, not baked again", () => {
    const match = attackingMatch('11');
    const camera = cameraOn(match);
    const made = [];
    const counting = (width, height) => {
      made.push(`${width}x${height}`);

      return createPixelCanvas(width, height);
    };

    prepareVenue(camera, match, { venue: 'asia-stadium', createCanvas: counting });

    const baked = new Set(made);

    const frame = createPixelCanvas(768, 432);

    made.length = 0;
    drawFrame(frame.getContext('2d'), match, camera, {
      venue: 'asia-stadium',
      actors: createActorArt({ createCanvas: counting }),
    });

    expect(baked.size).toBeGreaterThan(2);
    expect(made.filter((size) => baked.has(size))).toEqual([]);
    expect(coloursOf(frame).size).toBeGreaterThan(coloursOf(createPixelCanvas(1, 1)).size + 60);
    expect(hexAt(frame.data, (420 * 768 + 384) * 4)).not.toBe(VENUE_SPECS['asia-stadium'].sky);
  });
});

describe('the scene on the pitch', () => {
  // the camera is put on the goal the carrier runs at, so its posts and net are in the scene
  it('sorts the venue props, the players and the ball from the back to the front', () => {
    const match = attackingMatch('11');
    const camera = cameraOn(match);

    panCamera(camera, { x: match.pitch.length, y: match.pitch.width / 2, ticks: 1 });
    updateCamera(camera, match);

    const scene = sceneOf(match, camera, {
      venue: { venue: 'national-stadium', createCanvas: createPixelCanvas },
    });
    const depths = scene.map((drawable) => drawable.depth);

    expect(scene.length).toBeGreaterThan(match.players.length + 1);
    expect(depths).toEqual([...depths].sort((first, second) => first - second));
  });

  it('draws the block figure straight onto the frame where there is no canvas to bake it on', () => {
    const match = attackingMatch('7');
    const { context, calls } = recorder();

    drawFrame(context, match, cameraOn(match), {
      actors: createActorArt({ createCanvas: null }),
      createCanvas: createPixelCanvas,
    });

    expect(calls.filter((call) => call.name === 'fillRect').length).toBeGreaterThan(500);
  });
});
