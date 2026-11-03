import { describe, expect, it } from 'vitest';
import { createAudio } from '../../../src/audio/index.js';
import { AUDIO, VOICE_CAP } from '../../../src/data/audio.js';
import { TEAMS } from '../../../src/data/teams/index.js';
import { createMatch } from '../../../src/sim/create-match.js';
import { attachDuels } from '../../../src/sim/duel/index.js';
import { drainEvents } from '../../../src/sim/events.js';
import { tick } from '../../../src/sim/tick.js';
import { runningAudio } from '../../support/fake-audio.js';

const TICK_SECONDS = 1 / 60;
const PUMP_TICKS = Math.round(AUDIO.pumpMs / 1000 / TICK_SECONDS);
const LOOK_TICKS = 60;

// a whole match is a few seconds of the sim's work
const MATCH_TIMEOUT_MS = 30000;

// every source sounding at once: effects, the crowd bed and the music's notes together
const MOST_SOURCES = 100;

const specOf = ({ id, name, short, kit, players }) => ({ id, name, short, kit, players });

function heardMatch({ seed, format, teams }) {
  const match = createMatch({ seed, format, teams: teams.map((id) => specOf(TEAMS[id])) });
  const { audio, context, timers } = runningAudio(createAudio);
  const seen = { cues: {}, voices: 0, sources: 0 };

  attachDuels(match, { watched: false });
  audio.setCrowd(1);
  audio.setMusic('match');

  while (match.phase !== 'over') {
    tick(match);
    context.advance(TICK_SECONDS);

    // the computer plays both sides, and the ear hears team 0 as the player's
    for (const { cue } of audio.hear(drainEvents(match), { ...match, humanTeam: 0 })) {
      seen.cues[cue] = (seen.cues[cue] ?? 0) + 1;
    }

    if (match.tick % PUMP_TICKS === 0) {
      timers.run();
    }

    if (match.tick % LOOK_TICKS === 0) {
      seen.voices = Math.max(seen.voices, audio.stats().voices);
      seen.sources = Math.max(seen.sources, context.playingAt().length);
    }
  }

  return { match, audio, context, seen };
}

describe('the sound of a whole match', () => {
  it.each([
    { seed: 1, format: '11', teams: ['germany', 'brazil'] },
    { seed: 2, format: '11', teams: ['phnom-penh-elite', 'kampot-high'] },
    { seed: 1, format: '7', teams: ['royal-kids', 'riverside-school'] },
  ])(
    'hears $teams.0 against $teams.1 within its voice cap',
    (game) => {
      const { match, seen } = heardMatch(game);
      const goals = match.score[0] + match.score[1];

      expect(seen.voices).toBeLessThanOrEqual(VOICE_CAP);
      expect(seen.sources).toBeLessThan(MOST_SOURCES);
      expect(seen.cues.whistle).toBeGreaterThan(3);
      expect(seen.cues.kick).toBeGreaterThan(5);
      expect(seen.cues.pass).toBeGreaterThan(50);
      expect(seen.cues.net ?? 0).toBe(goals);
      expect((seen.cues.roar ?? 0) + (seen.cues.groan ?? 0)).toBe(goals);
    },
    MATCH_TIMEOUT_MS,
  );

  it(
    'lets go of what it no longer plays, so a long session does not pile nodes up',
    () => {
      const { context } = heardMatch({ seed: 1, format: '11', teams: ['germany', 'brazil'] });
      const connected = context.nodes.filter(
        (node) => !node.disconnected && node.outputs.length > 0,
      );

      expect(context.nodes.length).toBeGreaterThan(5000);
      expect(connected.length).toBeLessThan(200);
    },
    MATCH_TIMEOUT_MS,
  );
});

// one of every event the README's contract lists, in the order a match might push them
const SCRIPT = [
  [1, [{ type: 'whistle', kind: 'kickoff', half: 1 }]],
  [30, [{ type: 'pass', player: 5 }]],
  [60, [{ type: 'pass', player: 6 }], { ball: { z: 1, vz: 6 } }],
  [90, [{ type: 'tackle', player: 14, target: 6, won: true }], { ball: { z: 0, vz: 0 } }],
  [120, [{ type: 'duel', duel: { id: 1 } }], { phase: 'duel' }],
  [121, [{ type: 'special', player: 9, move: 'seven-headed-naga' }]],
  [
    300,
    [
      { type: 'shot', player: 9, power: 1, move: 'seven-headed-naga' },
      { type: 'goal', team: 0, scorer: 9, move: 'seven-headed-naga' },
      { type: 'duelEnd', duel: { id: 1, outcome: { result: 'goal' } } },
    ],
    { phase: 'goal', score: [1, 0] },
  ],
  [600, [{ type: 'whistle', kind: 'kickoff', half: 1 }], { phase: 'kickoff' }],
  [700, [{ type: 'shot', player: 9, power: 0.9, move: null }], { phase: 'play' }],
  [720, [{ type: 'save', keeper: 11, parried: true }]],
  [760, [{ type: 'out', kind: 'corner', team: 0 }], { phase: 'restart' }],
  [900, [{ type: 'shot', player: 10, power: 0.8, move: null }], { phase: 'play' }],
  [940, [{ type: 'out', kind: 'goalKick', team: 1 }], { phase: 'restart' }],
  [1000, [{ type: 'whistle', kind: 'halfTime', half: 1 }], { phase: 'halfTime', minute: 45 }],
  [1200, [{ type: 'whistle', kind: 'kickoff', half: 2 }], { phase: 'kickoff', half: 2 }],
  [1500, [{ type: 'goal', team: 1, scorer: 20, move: null }], { phase: 'goal', score: [1, 1] }],
  [2000, [{ type: 'whistle', kind: 'fullTime', half: 2 }], { phase: 'over', minute: 90 }],
];

const HEARD = [
  ['whistle', 'pass', 'loft', 'tackle', 'duel', 'charge', 'kick', 'impact', 'net', 'roar'],
  ['duelEnd', 'whistle', 'kick', 'save', 'ooh', 'whistle', 'kick', 'whistle', 'ooh', 'whistle'],
  ['whistle', 'net', 'groan', 'whistle'],
].flat();

describe('the sound of every kind of match event', () => {
  it('hears each event as its cue, ducking under the goal and the special', () => {
    const match = createMatch({ seed: 3, humanTeam: 0 });
    const { audio, context, timers } = runningAudio(createAudio);
    const heard = [];

    audio.setMusic('match');

    for (const [at, events, patch = {}] of SCRIPT) {
      while (match.tick < at) {
        match.tick += 1;
        context.advance(TICK_SECONDS);
        timers.run();
        heard.push(...audio.hear([], match));
      }

      Object.assign(match, { ...patch, ball: { ...match.ball, ...patch.ball } });
      heard.push(...audio.hear(events, match));

      expect(audio.stats().voices).toBeLessThanOrEqual(VOICE_CAP);
    }

    expect(heard.map((each) => each.cue)).toEqual(HEARD);
    expect(heard.find((each) => each.cue === 'impact').options.look).toBe('seven-naga');
    expect(heard.filter((each) => each.duck).map((each) => each.duck)).toEqual([
      'duel',
      'special',
      'goal',
      'goal',
    ]);
    expect(audio.stats().mood).toBe('match');
  });
});
