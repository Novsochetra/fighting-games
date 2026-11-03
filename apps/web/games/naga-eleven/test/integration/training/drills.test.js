import { describe, expect, it } from 'vitest';
import { DRILL_IDS } from '../../../src/data/training.js';
import {
  createDrill,
  drillResult,
  isDrillOver,
  RESULT_LOCK_TICKS,
  updateDrill,
} from '../../../src/training/index.js';
import { BOTS, idleBot, NOTHING } from './support/drill-bots.js';

const PASS = { held: {}, pressed: { pass: true } };
const SHOOT = { held: {}, pressed: { shoot: true } };

function inputFor(state, { bot, onResult }) {
  if (state.phase === 'intro') {
    return PASS;
  }

  if (state.phase === 'result') {
    return state.phaseTicks >= RESULT_LOCK_TICKS ? onResult(state) : NOTHING;
  }

  return state.phase === 'play' ? bot(state) : NOTHING;
}

// plays a drill as the app would: a tick at a time, PASS on the cards, the bot in play
function playThrough(state, { bot, onResult = () => PASS }) {
  const events = [];
  const phases = [state.phase];

  for (let i = 0; i < 30000 && !isDrillOver(state); i += 1) {
    updateDrill(state, inputFor(state, { bot, onResult }));
    events.push(...state.events);

    if (phases.at(-1) !== state.phase) {
      phases.push(state.phase);
    }
  }

  return { events, phases };
}

describe.each(DRILL_IDS)('%s played through', (drill) => {
  it('goes from its intro to its result and hands the campaign its grade', () => {
    const state = createDrill(drill, { seed: 12, level: 1 });
    const { phases } = playThrough(state, { bot: BOTS[drill]() });

    expect(phases).toEqual(['intro', 'ready', 'play', 'finish', 'result', 'done']);
    expect(drillResult(state)).toEqual({ drill, score: state.score, grade: 'S' });
  });

  it('lets a poor first try be beaten by a second, and hands over the better', () => {
    const state = createDrill(drill, { seed: 12, level: 2 });
    let bot = idleBot;

    playThrough(state, {
      bot: (each) => bot(each),
      onResult: (each) => {
        if (each.attempt === 1) {
          bot = BOTS[drill]();

          return SHOOT;
        }

        return PASS;
      },
    });

    expect(state.attempt).toBe(2);
    expect(state.newBest).toBe(true);
    expect(drillResult(state)).toMatchObject({ drill, grade: 'S' });
    expect(drillResult(state).score).toBeGreaterThan(0);
  });

  it('keeps the first try when the second is worse', () => {
    const state = createDrill(drill, { seed: 4, level: 1 });
    let bot = BOTS[drill]();

    playThrough(state, {
      bot: (each) => bot(each),
      onResult: (each) => {
        if (each.attempt === 1) {
          bot = idleBot;

          return SHOOT;
        }

        return PASS;
      },
    });

    expect(state.score).toBe(0);
    expect(drillResult(state).grade).toBe('S');
  });
});

describe('what each drill tells the app', () => {
  it('marks every cone of a clean slalom, then the finish', () => {
    const state = createDrill('cone-dribble', { seed: 2, level: 1 });
    const { events } = playThrough(state, { bot: BOTS['cone-dribble']() });
    const kinds = events.map((event) => event.type);

    expect(kinds.filter((kind) => kind === 'clean')).toHaveLength(state.run.course.cones.length);
    expect(kinds.at(-1)).toBe('finish');
  });

  it('marks a strike for every one of the shots', () => {
    const state = createDrill('target-shot', { seed: 2, level: 3 });
    const { events } = playThrough(state, { bot: BOTS['target-shot']() });

    expect(events.filter((event) => event.type === 'lateHit')).toHaveLength(12);
  });

  it('marks every beat of the focus perfect', () => {
    const state = createDrill('spirit-focus', { seed: 2, level: 2 });
    const { events } = playThrough(state, { bot: BOTS['spirit-focus']() });

    expect(events.filter((event) => event.type === 'perfect')).toHaveLength(state.run.beats.length);
    expect(state.run.spirit).toBe(100);
  });
});
