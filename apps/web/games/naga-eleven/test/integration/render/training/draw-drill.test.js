import { describe, expect, it } from 'vitest';
import { VIEW } from '../../../../src/config.js';
import { DRILL_IDS, DRILLS } from '../../../../src/data/training.js';
import { drawDrill, hitTest } from '../../../../src/render/training/index.js';
import { LABELS } from '../../../../src/render/training/labels.js';
import { RESULT_BUTTONS } from '../../../../src/render/training/result-card.js';
import { createDrill, updateDrill } from '../../../../src/training/index.js';
import { createPixelCanvas } from '../../../support/pixel-canvas.js';
import { createRecordingContext } from '../../../support/recording-context.js';
import { BOTS, NOTHING } from '../../training/support/drill-bots.js';

const PHASES = ['intro', 'ready', 'play', 'finish', 'result', 'done'];
const PASS = { held: {}, pressed: { pass: true } };

function inputFor(state, bot) {
  if (state.phase === 'intro' || (state.phase === 'result' && state.phaseTicks > 60)) {
    return PASS;
  }

  return state.phase === 'play' ? bot(state) : NOTHING;
}

// a drill played by its bot until it reaches the phase, and some way into it
function drillAt(drill, phase, { into = 20, level = 2 } = {}) {
  const state = createDrill(drill, { seed: 21, level });
  const bot = BOTS[drill]();
  const reached = () => PHASES.indexOf(state.phase) >= PHASES.indexOf(phase);

  for (let i = 0; i < 30000 && !reached(); i += 1) {
    updateDrill(state, inputFor(state, bot));
  }

  for (let i = 0; i < into && state.phase === phase && phase !== 'intro'; i += 1) {
    updateDrill(state, state.phase === 'play' ? bot(state) : NOTHING);
  }

  return state;
}

// a recording context that, like a real canvas, starts opaque and can measure its words
function recorded(state, lang = 'en') {
  const { context, calls } = createRecordingContext();

  context.globalAlpha = 1;
  context.measureText = (text) => ({ width: [...text].length * 12 });
  calls.length = 0;
  drawDrill(context, state, { lang, tick: state.tick });

  return calls;
}

const numbersOf = (calls) =>
  calls.flatMap((call) => call.args).filter((arg) => typeof arg === 'number');

const textsOf = (calls) =>
  calls.filter((call) => call.name === 'fillText').map((call) => call.args[0]);

function paintedColors(state) {
  const canvas = createPixelCanvas(VIEW.width, VIEW.height);

  drawDrill(canvas.getContext('2d'), state, { lang: 'en', tick: state.tick });

  const colors = new Set();
  let empty = 0;

  for (let at = 0; at < canvas.data.length; at += 4) {
    empty += canvas.data[at + 3] === 0 ? 1 : 0;
    colors.add(canvas.data.subarray(at, at + 3).join());
  }

  return { colors, empty };
}

describe.each(DRILL_IDS)('drawing %s', (drill) => {
  it.each(PHASES)('draws its %s with no number lost to NaN, in both languages', (phase) => {
    const state = drillAt(drill, phase);

    expect(state.phase).toBe(phase);

    for (const lang of ['en', 'km']) {
      for (const number of numbersOf(recorded(state, lang))) {
        expect(Number.isFinite(number)).toBe(true);
      }
    }
  });

  it.each(['intro', 'play', 'result'])('paints the whole view in its %s', (phase) => {
    const { colors, empty } = paintedColors(drillAt(drill, phase, { into: 300 }));

    expect(empty).toBe(0);
    expect(colors.size).toBeGreaterThan(30);
  });

  it('names the drill and how to start it on the intro card', () => {
    const texts = textsOf(recorded(drillAt(drill, 'intro')));

    expect(texts).toEqual(expect.arrayContaining([DRILLS[drill].name.en, 'PRESS PASS TO START']));
    expect(textsOf(recorded(drillAt(drill, 'intro'), 'km'))).toContain(DRILLS[drill].name.km);
  });

  it('writes the level in the digits of its language on the intro card', () => {
    const state = drillAt(drill, 'intro');
    const header = (lang, digit) => `${LABELS.training[lang]} · ${LABELS.level[lang]} ${digit}`;

    expect(textsOf(recorded(state))).toContain(header('en', '2'));
    expect(textsOf(recorded(state, 'km'))).toContain(header('km', '២'));
  });

  it('shows the score and the combo in play', () => {
    const state = drillAt(drill, 'play', { into: 600 });
    const texts = textsOf(recorded(state));

    expect(texts).toEqual(
      expect.arrayContaining(['SCORE', String(state.score), `x${state.combo}`]),
    );
  });

  it('offers to go on or try again on the result card, and answers a tap on each', () => {
    const state = drillAt(drill, 'result', { into: 60 });
    const middleOf = (box) => ({ x: box.x + box.width / 2, y: box.y + box.height / 2 });

    expect(textsOf(recorded(state))).toEqual(expect.arrayContaining(['CONTINUE', 'TRY AGAIN']));
    expect(hitTest(state, middleOf(RESULT_BUTTONS.pass))).toBe('pass');
    expect(hitTest(state, middleOf(RESULT_BUTTONS.shoot))).toBe('shoot');
    expect(hitTest(state, { x: 4, y: 4 })).toBeNull();
  });
});

describe('a tap on a drill', () => {
  it('starts it from the intro card, and does nothing in play', () => {
    expect(hitTest(drillAt('cone-dribble', 'intro'), { x: 10, y: 10 })).toBe('pass');
    expect(hitTest(drillAt('cone-dribble', 'play'), { x: 384, y: 300 })).toBeNull();
  });
});
