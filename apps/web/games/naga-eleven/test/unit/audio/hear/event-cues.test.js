import { describe, expect, it } from 'vitest';
import { createEar } from '../../../../src/audio/hear/ear.js';
import { cuesOfEvent, kickCueOf } from '../../../../src/audio/hear/event-cues.js';
import { CROWD } from '../../../../src/data/audio.js';
import { createMatch } from '../../../../src/sim/create-match.js';

const names = (cues) => cues.map((each) => each.cue);

function heard(events, { humanTeam = 0, ball = {}, tick = 100 } = {}) {
  const match = createMatch({ seed: 1, humanTeam });
  const ear = createEar();

  Object.assign(match.ball, ball);
  match.tick = tick;

  return events.flatMap((event) => cuesOfEvent(event, match, ear));
}

describe('match events as cues', () => {
  it('blows a short whistle for kick off, a long one at half time and three at full time', () => {
    const kinds = ['kickoff', 'halfTime', 'fullTime'].map(
      (kind) => heard([{ type: 'whistle', kind, half: 1 }])[0].options.kind,
    );

    expect(kinds).toEqual(['short', 'long', 'final']);
  });

  it('strikes a shot as hard as it was hit', () => {
    const [cue] = heard([{ type: 'shot', player: 9, power: 0.3, move: null }]);

    expect(cue).toEqual({ cue: 'kick', options: { power: 0.3 }, duck: null });
  });

  it('lands a special shot with its move look, ducking the music', () => {
    const cues = heard([{ type: 'shot', player: 9, power: 1, move: 'garuda-volley' }]);

    expect(names(cues)).toEqual(['kick', 'impact']);
    expect(cues[1]).toEqual({ cue: 'impact', options: { look: 'garuda' }, duck: 'special' });
  });

  it('charges a special in the colour of its move, and a move it does not know plainly', () => {
    const [naga] = heard([{ type: 'special', player: 9, move: 'naga-shot' }]);
    const [other] = heard([{ type: 'special', player: 9, move: 'no-such-move' }]);

    expect(naga.options.look).toBe('naga');
    expect(other.options.look).toBe('plain');
  });

  it('roars for the human side, groans against it and cheers both when nobody plays', () => {
    const goal = (team, humanTeam) =>
      heard([{ type: 'goal', team, scorer: 9, move: null }], { humanTeam });

    expect(names(goal(0, 0))).toEqual(['net', 'roar']);
    expect(names(goal(1, 0))).toEqual(['net', 'groan']);
    expect(names(goal(1, 1))).toEqual(['net', 'roar']);
    expect(names(goal(0, null))).toEqual(['net', 'roar']);
    expect(goal(0, 0)[1].duck).toBe('goal');
  });

  it('roars loudest for a goal with a special move', () => {
    const plain = heard([{ type: 'goal', team: 0, scorer: 9, move: null }]);
    const special = heard([{ type: 'goal', team: 0, scorer: 9, move: 'naga-shot' }]);

    expect(special[1].options.level).toBeGreaterThan(plain[1].options.level);
  });

  it('passes along the grass, in the air or off the head by how the ball left', () => {
    expect(kickCueOf({ z: 0, vz: 0, kick: 'pass' })).toBe('pass');
    expect(kickCueOf({ z: 2, vz: 5, kick: 'pass' })).toBe('loft');
    expect(kickCueOf({ z: 40, vz: 2, kick: 'pass' })).toBe('header');
    expect(names(heard([{ type: 'pass', player: 3 }], { ball: { z: 0, vz: 6 } }))).toEqual([
      'loft',
    ]);
  });

  it('thumps the gloves on a save, with an "ooh" after a hard shot or a parry', () => {
    const shot = { type: 'shot', player: 9, power: 0.9, move: null };
    const weak = { type: 'shot', player: 9, power: 0.2, move: null };

    expect(names(heard([shot, { type: 'save', keeper: 11, parried: false }]))).toEqual([
      'kick',
      'save',
      'ooh',
    ]);
    expect(names(heard([weak, { type: 'save', keeper: 11, parried: false }]))).toEqual([
      'kick',
      'save',
    ]);
    expect(names(heard([{ type: 'save', keeper: 11, parried: true }]))).toEqual(['save', 'ooh']);
  });

  it('hears a shot gone out for a goal kick soon after as a near miss, a throw-in not', () => {
    const shot = { type: 'shot', player: 9, power: 0.7, move: null };

    expect(names(heard([shot, { type: 'out', kind: 'goalKick', team: 1 }]))).toEqual([
      'kick',
      'whistle',
      'ooh',
    ]);
    expect(names(heard([shot, { type: 'out', kind: 'throwIn', team: 1 }]))).toEqual([
      'kick',
      'whistle',
    ]);
    expect(names(heard([{ type: 'out', kind: 'corner', team: 0 }]))).toEqual(['whistle']);
  });

  it('forgets a shot once its near miss is long past', () => {
    const match = createMatch({ seed: 1, humanTeam: 0 });
    const ear = createEar();

    cuesOfEvent({ type: 'shot', player: 9, power: 0.7, move: null }, match, ear);
    match.tick += CROWD.nearMissTicks + 1;

    expect(names(cuesOfEvent({ type: 'out', kind: 'goalKick', team: 1 }, match, ear))).toEqual([
      'whistle',
    ]);
  });

  it('opens a duel with its sting and closes it, with an "ooh" for a special gone wide', () => {
    const duel = { id: 1, outcome: { result: 'wide' } };

    expect(heard([{ type: 'duel', duel }])[0]).toEqual({ cue: 'duel', options: {}, duck: 'duel' });
    expect(names(heard([{ type: 'duelEnd', duel }]))).toEqual(['duelEnd', 'ooh']);
    expect(names(heard([{ type: 'duelEnd', duel: { outcome: { result: 'broke' } } }]))).toEqual([
      'duelEnd',
    ]);
  });

  it('thuds a tackle and says whether it won the ball', () => {
    expect(heard([{ type: 'tackle', player: 2, target: 9, won: true }])[0].options).toEqual({
      won: true,
    });
  });

  it('hears nothing in an event it does not know, or in no event at all', () => {
    expect(heard([{ type: 'firework' }, null, {}])).toEqual([]);
  });
});
