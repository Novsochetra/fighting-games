// The board is read from the server, but it is data: a run is kept only if every part of it is
// what a run is, and its name, free text a player typed, is only ever written as text.
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const NAME = /^[^\p{Cc}]{1,40}$/u;

const isWhole = (value, min) => Number.isInteger(value) && value >= min;

function isRun(run) {
  return (
    typeof run?.name === 'string' &&
    NAME.test(run.name) &&
    isWhole(run.score, 1) &&
    isWhole(run.mission, 1) &&
    isWhole(run.difficulty, 0) &&
    isWhole(run.seconds, 0) &&
    typeof run.hero === 'string' &&
    typeof run.date === 'string' &&
    DAY.test(run.date)
  );
}

const readRun = ({ name, score, mission, hero, difficulty, seconds, cleared, date }) => ({
  name,
  score,
  mission,
  hero,
  difficulty,
  seconds,
  cleared: cleared === true,
  date,
});

const readRuns = (runs) => (Array.isArray(runs) ? runs.filter(isRun).map(readRun) : []);

export function readBoard(payload) {
  return {
    weekStart: DAY.test(payload?.weekStart ?? '') ? payload.weekStart : '',
    week: readRuns(payload?.week),
    allTime: readRuns(payload?.allTime),
  };
}
