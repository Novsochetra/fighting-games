import { moveOf } from '../../data/moves.js';
import { CROWD } from '../../data/audio.js';

const WHISTLES = { kickoff: 'short', halfTime: 'long', fullTime: 'final' };

// a ball struck higher than this was met with the head
export const HEAD_HEIGHT = 30;

// a pass leaving the grass faster than this goes in the air
const LOFT_LIFT = 1;

// a shot at least this hard draws an "ooh" when the keeper stops it
const HARD_SHOT = 0.5;

export const cueOf = (cue, options = {}, duck = null) => ({ cue, options, duck });

const lookOf = (move) => moveOf(move)?.look ?? 'plain';

export function kickCueOf(ball) {
  if (ball.kick === 'header' || ball.z >= HEAD_HEIGHT) {
    return 'header';
  }

  return ball.vz > LOFT_LIFT ? 'loft' : 'pass';
}

function shotCues(event, match, ear) {
  ear.lastShot = { tick: match.tick, power: event.move ? 1 : (event.power ?? 0.6) };

  if (!event.move) {
    return [cueOf('kick', { power: event.power })];
  }

  return [cueOf('kick', { power: 1 }), cueOf('impact', { look: lookOf(event.move) }, 'special')];
}

// the crowd is the human side's; with the computer on both sides it cheers every goal a little
function goalCues(event, match, ear) {
  const human = match.humanTeam ?? null;

  ear.lastShot = null;

  if (human === null) {
    return [cueOf('net'), cueOf('roar', { level: 0.7 }, 'goal')];
  }

  return event.team === human
    ? [cueOf('net'), cueOf('roar', { level: event.move ? 1 : 0.85 }, 'goal')]
    : [cueOf('net'), cueOf('groan', {}, 'goal')];
}

function saveCues(event, match, ear) {
  const hard = event.parried || (ear.lastShot?.power ?? 0) >= HARD_SHOT;

  ear.lastShot = null;

  return [cueOf('save', { parried: Boolean(event.parried) }), ...(hard ? [cueOf('ooh')] : [])];
}

// a shot that goes out for a goal kick or a corner soon after it was struck was a near miss
function outCues(event, match, ear) {
  const shot = ear.lastShot;
  const nearMiss =
    shot !== null && event.kind !== 'throwIn' && match.tick - shot.tick <= CROWD.nearMissTicks;

  ear.lastShot = null;

  return [cueOf('whistle', { kind: 'restart' }), ...(nearMiss ? [cueOf('ooh')] : [])];
}

const MAPPERS = {
  whistle: (event) => [cueOf('whistle', { kind: WHISTLES[event.kind] ?? 'short' })],
  pass: (event, match) => [cueOf(kickCueOf(match.ball))],
  shot: shotCues,
  goal: goalCues,
  save: saveCues,
  tackle: (event) => [cueOf('tackle', { won: Boolean(event.won) })],
  out: outCues,
  special: (event) => [cueOf('charge', { look: lookOf(event.move) })],
  duel: () => [cueOf('duel', {}, 'duel')],
  duelEnd: (event) =>
    event.duel?.outcome?.result === 'wide' ? [cueOf('duelEnd'), cueOf('ooh')] : [cueOf('duelEnd')],
};

// one match event (README "A match") to the cues it sounds as: [{ cue, options, duck }]
export function cuesOfEvent(event, match, ear) {
  const mapper = MAPPERS[event?.type];

  return mapper ? mapper(event, match, ear) : [];
}
