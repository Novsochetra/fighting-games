import { eventsOf, ourTeam, starOf } from './match-reads.js';

// what a match watch remembers between ticks: how many skills the player's side has played
export const createSeen = () => ({ skills: 0 });

const teamOf = (match, index) =>
  Number.isInteger(index) ? (match.players?.[index]?.team ?? null) : null;

const ourSkills = (match, events) =>
  eventsOf(events, 'skill').filter((event) => teamOf(match, event.player) === ourTeam(match));

const skillCounts = (trigger, match, event) =>
  (!trigger.move || event.move === trigger.move) &&
  (!trigger.by || starOf(match, event.player) === trigger.by);

// `first` asks for the side's opening skill of the match, so a trigger with `move` or `by` that
// missed it never fires
function skillPlayed(trigger, match, events, seen) {
  const skills = ourSkills(match, events);

  if (trigger.first && seen.skills > 0) {
    return false;
  }

  const looked = trigger.first ? skills.slice(0, 1) : skills;

  return looked.some((event) => skillCounts(trigger, match, event));
}

// the counter pushes an event at each climb from x2, and a one-two or a skill pass climbs two at
// once, so x3 asked for is met by a climb to x4 as well
const comboBuilt = (trigger, match, events) =>
  eventsOf(events, 'combo').some(
    (event) => event.team === ourTeam(match) && event.level >= trigger.level,
  );

export const PLAY_CONDITIONS = { combo: comboBuilt, skill: skillPlayed };

export function rememberPlay(seen, match, events) {
  seen.skills += ourSkills(match, events).length;
}
