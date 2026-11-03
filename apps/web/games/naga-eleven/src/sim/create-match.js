import { TICKS_PER_SECOND } from '../config.js';
import { FORMATS } from '../data/formats.js';
import { createBall } from './ball.js';
import { createInput } from './input-state.js';
import { setKickoff } from './kickoff.js';
import { plainTeams } from './plain-teams.js';
import { createRandom } from './random.js';
import { createPlayers } from './squad.js';
import { systemsOf } from './systems.js';

const teamOf = ({ id, name, short, kit }) => ({ id, name, short, kit });

// what the skills and combos keep between ticks: the pass combo and the pass on its way, the last
// shot, a RUN tap, a duo's ball and the open play save cam
const playState = () => ({
  combo: null,
  comboPass: null,
  lastShot: null,
  runTap: -Infinity,
  duoPass: null,
  saveCam: null,
  saveCamGoal: null,
  saveCams: { last: -Infinity, halves: [0, 0] },
});

function matchState({ seed, humanTeam, format, teams, halfTicks, input }) {
  const { pitch, goal } = FORMATS[format];

  return {
    tick: 0,
    phase: 'kickoff',
    phaseTicks: 0,
    half: 1,
    minute: 0,
    clock: halfTicks,
    halfTicks,
    format,
    pitch: { ...pitch },
    goal: { ...goal },
    teams: teams.map(teamOf),
    score: [0, 0],
    humanTeam,
    controlled: null,
    switchCooldown: 0,
    stickHold: null,
    aimTarget: null,
    dropSpot: null,
    restart: null,
    duel: null,
    events: [],
    hooks: {},
    plans: [null, null],
    random: createRandom(seed),
    input,
    lastScorer: null,
    kickoffTeam: 0,
    firstKickoff: 0,
    lastKickoff: null,
    ...playState(),
  };
}

// `humanTeam` is the side the player steers, or null for a match the computer plays both sides
// of; teams of the game's own carry their format, and with neither it is a quick 11 v 11 of two
// plain sides. `systems` says which of the skills and combos play (src/sim/systems.js); the
// campaign's sides carry them (src/campaign/team-spec.js)
export function createMatch(options) {
  const { seed, humanTeam = null, input = createInput() } = options;
  const format = options.format ?? options.teams?.[0]?.format ?? '11';
  const teams = options.teams ?? plainTeams(format);
  const halfSeconds = options.halfSeconds ?? FORMATS[format].halfSeconds;
  const halfTicks = Math.round(halfSeconds * TICKS_PER_SECOND);
  const match = matchState({ seed, humanTeam, format, teams, halfTicks, input });

  match.systems = systemsOf(options.systems ?? teams[0].systems);
  match.players = createPlayers(format, teams, { skills: match.systems.roleSkills });
  match.sides = [0, 1].map((team) => match.players.filter((player) => player.team === team));
  match.ball = createBall(match);
  setKickoff(match, 0);

  return match;
}
