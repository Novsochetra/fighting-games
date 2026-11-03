import { kitsOf, teamCard } from '../shared/kits.js';
import { rivalOf } from './rivals.js';

// the ticks each graphic comes in on, at 60 a second: the cup, the two teams, the rival to watch,
// then everything goes and KICK OFF lands; with no rival it is over a second sooner
const WITH_RIVAL = { cup: 0, teams: 14, rival: 92, out: 192, kickoff: 200, length: 246 };
const NO_RIVAL = { cup: 0, teams: 14, rival: null, out: 124, kickoff: 132, length: 178 };

export const INTRO_MOTION = { slideIn: 22, slideOut: 16 };

export function createIntro({ home, away, cup, round, venueName, rival, lang = 'en' }) {
  const teams = [teamCard(home, 0), teamCard(away, 1)];
  const card = rivalOf(rival, [home, away]);

  return {
    tick: 0,
    beats: card ? WITH_RIVAL : NO_RIVAL,
    teams,
    kits: kitsOf(teams),
    cup: cup?.name ?? cup ?? '',
    round: round ?? '',
    venueName: venueName ?? '',
    rival: card,
    lang,
    skipped: false,
  };
}

export const isIntroDone = (state) => state.tick >= state.beats.length;

// a first press sends the graphics off and lands KICK OFF; a second ends it there
function skipIntro(state) {
  state.skipped = true;
  state.tick = state.tick < state.beats.out ? state.beats.out : state.beats.length;
}

export function updateIntro(state, input = {}) {
  if (isIntroDone(state)) {
    return state;
  }

  if (input.pass || input.confirm || input.skip) {
    skipIntro(state);
  } else {
    state.tick += 1;
  }

  return state;
}
