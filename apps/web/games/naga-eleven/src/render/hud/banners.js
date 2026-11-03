import { HUD } from '../../art/hud.js';
import { PHASE_TICKS } from '../../data/tuning.js';
import { textOf } from '../text.js';
import { BANNER_TEXT } from './labels.js';

const RESTARTS = ['throwIn', 'corner', 'goalKick'];
const GOAL_BANNER_TICKS = 120;

const teamRamp = (kits, team) => kits[team]?.outfield.shirt ?? HUD.gold;

function scorerLine(match, effects, lang) {
  const scorer = match.players[effects?.goal?.scorer ?? -1];

  return scorer ? textOf(scorer.name, lang).toUpperCase() : null;
}

function phaseBanner(match, { kits, effects, lang }) {
  const age = match.phaseTicks;

  switch (match.phase) {
    case 'kickoff':
      return {
        size: 'big',
        label: BANNER_TEXT.kickOff,
        age,
        length: PHASE_TICKS.kickoff,
        ramp: HUD.gold,
      };
    case 'halfTime':
      return {
        size: 'big',
        label: BANNER_TEXT.halfTime,
        age,
        length: PHASE_TICKS.halfTime,
        ramp: HUD.gold,
      };
    case 'over':
      return { size: 'big', label: BANNER_TEXT.fullTime, age, length: Infinity, ramp: HUD.gold };
    case 'goal': {
      const team = effects?.goal?.team ?? match.lastScorer ?? 0;
      const line = scorerLine(match, effects, lang);

      return {
        size: 'big',
        label: BANNER_TEXT.goal,
        age,
        length: GOAL_BANNER_TICKS,
        ramp: teamRamp(kits, team),
        line,
        wave: true,
      };
    }
    default:
      return null;
  }
}

export function bannerOf(match, context) {
  const banner = phaseBanner(match, context);

  if (banner) {
    return banner.age < banner.length ? banner : null;
  }

  const kind = match.phase === 'restart' ? match.restart?.kind : null;

  if (!RESTARTS.includes(kind)) {
    return null;
  }

  return {
    size: 'small',
    label: BANNER_TEXT[kind],
    age: match.phaseTicks,
    length: Infinity,
    ramp: teamRamp(context.kits, match.restart.team),
  };
}
