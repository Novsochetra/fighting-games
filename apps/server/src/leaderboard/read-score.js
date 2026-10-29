import { isBlockedInitials } from './blocked-initials.js';

export const SCORE_LIMITS = {
  maxScore: 99_999_999,
  maxSeconds: 24 * 60 * 60,
  // a short run can open on a burst (a boss falling at once), so its first minute earns up front
  graceSeconds: 60,
  maxTicketLength: 200,
};

const INITIALS = /^[A-Z]{3}$/;

const isWholeBetween = (value, min, max) => Number.isInteger(value) && value >= min && value <= max;

function fieldProblem(body, rules) {
  const { maxScore, maxSeconds, maxTicketLength } = SCORE_LIMITS;
  const checks = [
    [typeof body.initials === 'string' && INITIALS.test(body.initials), 'Initials are 3 letters.'],
    [isWholeBetween(body.score, 1, maxScore), `A score is a whole number up to ${maxScore}.`],
    [isWholeBetween(body.mission, 1, rules.missions), 'That mission is not in this game.'],
    [rules.heroes.includes(body.hero), 'That hero is not in this game.'],
    [
      isWholeBetween(body.difficulty, 0, rules.difficulties - 1),
      'That difficulty is not in this game.',
    ],
    [
      isWholeBetween(body.seconds, 0, maxSeconds),
      'The play time is not a whole number of seconds.',
    ],
    [typeof body.cleared === 'boolean', 'Say whether the run cleared every mission.'],
    [
      typeof body.ticket === 'string' && body.ticket.length <= maxTicketLength,
      'The run has no ticket.',
    ],
  ];

  return checks.find(([isFine]) => !isFine)?.[1];
}

// the time played is checked against the server's own clock with the run's ticket; this holds the
// score to what that much play can earn
function runProblem(body, rules) {
  const { graceSeconds } = SCORE_LIMITS;

  if (body.cleared && body.mission !== rules.missions) {
    return 'A run that cleared every mission reached the last one.';
  }

  if (body.score > (body.seconds + graceSeconds) * rules.maxPointsPerSecond) {
    return 'That score is more than the time played could earn.';
  }

  return isBlockedInitials(body.initials) ? 'Pick other initials.' : null;
}

export function readScore(body, rulesByGame) {
  const rules = rulesByGame.get(body?.game);

  if (!rules) {
    return { error: 'That game has no leaderboard.' };
  }

  const error = fieldProblem(body, rules) ?? runProblem(body, rules);

  if (error) {
    return { error };
  }

  const { game, initials, score, mission, hero, difficulty, seconds, cleared } = body;

  return {
    run: { game, initials, score, mission, hero, difficulty, seconds, cleared },
    ticket: body.ticket,
  };
}
