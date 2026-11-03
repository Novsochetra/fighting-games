import { describe, expect, it } from 'vitest';
import {
  drawFullTime,
  drawHalfTime,
} from '../../../../src/render/cinematics/boards/draw-boards.js';
import { countEvents, createMatchStats } from '../../../../src/render/cinematics/boards/stats.js';
import { kitsOf } from '../../../../src/render/cinematics/shared/kits.js';
import { TEAMS } from '../../../../src/data/teams/index.js';
import { createMatch } from '../../../../src/sim/create-match.js';
import { drainEvents } from '../../../../src/sim/events.js';
import { tick } from '../../../../src/sim/tick.js';
import { createPixelCanvas } from '../../../support/pixel-canvas.js';
import { coloursOf, numbersOf, recorder, strays } from './view-checks.js';

// a short match the computer plays both sides of, its stats counted tick by tick as the app will
function playTo(phase, { match, stats }) {
  for (let i = 0; i < 40000 && match.phase !== phase; i += 1) {
    tick(match);
    countEvents(stats, match.events, match);
    drainEvents(match);
  }

  return { match, stats };
}

function freshMatch(format = '11') {
  const teams = format === '7' ? ['chrey-school', 'royal-kids'] : ['cambodia-youth', 'japan-youth'];
  const match = createMatch({
    seed: 7,
    format,
    teams: teams.map((id) => TEAMS[id]),
    halfSeconds: 20,
  });

  return { match, stats: createMatchStats() };
}

// the same match twice, seeded alike: one stopped at half time, one played to the end
const played = { half: playTo('halfTime', freshMatch()), full: playTo('over', freshMatch()) };

function checkTicks(draw, { match, stats }) {
  for (let age = 0; age <= 90; age += 3) {
    const { context, calls } = recorder();

    draw(context, { match, stats, age, tick: age, lang: age % 2 ? 'km' : 'en' });
    expect(numbersOf(calls).every(Number.isFinite)).toBe(true);
    expect(strays(calls, 4)).toEqual([]);
  }
}

const shirtsIn = (canvas, kit) => kit.shirt.filter((shade) => coloursOf(canvas).has(shade));

describe('the half-time board', () => {
  it('counted the half from its events', () => {
    const { stats } = played.half;

    expect(stats.passes[0] + stats.passes[1]).toBeGreaterThan(0);
    expect(stats.possession[0] + stats.possession[1]).toBeGreaterThan(0);
  });

  it('draws as it drops in and after, with no NaN, inside the view', () => {
    checkTicks(drawHalfTime, played.half);
  });

  it('draws with no stats counted, and in its phase takes the phase’s ticks as its age', () => {
    const { context, calls } = recorder();

    drawHalfTime(context, { match: played.half.match });
    expect(numbersOf(calls).every(Number.isFinite)).toBe(true);
  });

  it('wears both teams’ colours', () => {
    const canvas = createPixelCanvas(768, 432);
    const kits = kitsOf(played.half.match.teams);

    drawHalfTime(canvas.getContext('2d'), { ...played.half, age: 120 });

    expect(kits.every((kit) => shirtsIn(canvas, kit).length > 0)).toBe(true);
  });
});

describe('the full-time board', () => {
  const won = (score) => ({ ...played.full, match: { ...played.full.match, score } });

  it('draws as it drops in and after, with no NaN, inside the view', () => {
    checkTicks(drawFullTime, played.full);
    checkTicks(drawFullTime, won([3, 0]));
  });

  it('rains confetti in the winners’ colours after a win', () => {
    const quiet = createPixelCanvas(768, 432);
    const party = createPixelCanvas(768, 432);
    const winners = kitsOf(played.full.match.teams)[1];

    drawFullTime(quiet.getContext('2d'), { ...won([1, 1]), age: 200 });
    drawFullTime(party.getContext('2d'), { ...won([0, 2]), age: 200 });

    expect(coloursOf(party).size).toBeGreaterThan(coloursOf(quiet).size);
    expect(shirtsIn(party, winners)).toHaveLength(4);
  });

  it('cheers only the player’s own win', () => {
    const human = { ...won([0, 2]), match: { ...won([0, 2]).match, humanTeam: 0 } };
    const lost = createPixelCanvas(768, 432);
    const draw = createPixelCanvas(768, 432);

    drawFullTime(lost.getContext('2d'), { ...human, age: 200 });
    drawFullTime(draw.getContext('2d'), { ...won([2, 2]), age: 200 });

    expect(coloursOf(lost).size).toBe(coloursOf(draw).size);
  });

  it('shows a shootout’s winner after a draw', () => {
    const { context, calls } = recorder();

    drawFullTime(context, { ...won([1, 1]), age: 100, penalties: { goals: [4, 3] } });

    const words = calls.filter((call) => call.name === 'fillText').map((call) => call.args[0]);

    expect(words).toContain('(4-3)');
    expect(words.some((text) => text.endsWith(' WIN'))).toBe(true);
  });

  it('draws for seven a side too', () => {
    const seven = playTo('over', freshMatch('7'));

    checkTicks(drawFullTime, seven);
  });
});
