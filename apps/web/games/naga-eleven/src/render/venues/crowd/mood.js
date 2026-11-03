// how the crowd feels, kept per match and moved on once a tick from what the match shows: a goal
// brings everyone up cheering for a while, a ball near a goal or a kickoff makes them restless
const CHEER_TICKS = 420;
const EXCITED_TICKS = 240;
const states = new WeakMap();

function stateOf(match) {
  if (!states.has(match)) {
    states.set(match, { tick: null, score: [...match.score], goalTick: -Infinity, goalTeam: null });
  }

  return states.get(match);
}

function nearGoal({ ball, pitch }) {
  return ball.x < pitch.length * 0.18 || ball.x > pitch.length * 0.82;
}

export function moodOf(match, tick = match.tick) {
  const state = stateOf(match);

  if (state.tick !== tick) {
    const team = [0, 1].find((side) => match.score[side] > state.score[side]);

    if (team !== undefined) {
      Object.assign(state, { goalTick: tick, goalTeam: team });
    }

    state.score = [...match.score];
    state.tick = tick;
  }

  const sinceGoal = tick - state.goalTick;
  const cheer = sinceGoal < CHEER_TICKS;
  const excited =
    cheer ||
    sinceGoal < CHEER_TICKS + EXCITED_TICKS ||
    nearGoal(match) ||
    match.phase === 'kickoff';

  return { tick, cheer, excited, sinceGoal, goalTeam: state.goalTeam };
}

// which of a crowd's four drawings shows: two of them sitting, bobbing in turn, and two standing with
// their arms up and down
export function crowdFrame(mood) {
  if (mood.cheer) {
    return 2 + ((mood.tick >> 3) & 1);
  }

  return (mood.tick >> (mood.excited ? 3 : 5)) & 1;
}
