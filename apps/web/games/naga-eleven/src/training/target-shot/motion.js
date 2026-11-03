// the keeper dummy covers this much of the mouth: shots over its head or past its arm go in
export const DUMMY = { half: 34, height: 104, range: 176 };

export const roundOf = (run, tuning) => Math.floor(run.shot / tuning.shotsPerRound) + 1;

// back and forth between -range and range, turning at each end
function sway(mover, { speed, range }) {
  const next = mover.x + mover.dir * speed;

  if (Math.abs(next) > range) {
    mover.dir = -mover.dir;
  }

  const moved = Math.max(-range, Math.min(range, next)) - mover.x;

  mover.x += moved;

  return moved;
}

export const dummyActive = (state, tuning) =>
  roundOf(state.run, tuning) >= Math.max(2, tuning.dummyFromRound - (state.level - 1));

export const driftActive = (state, tuning) => roundOf(state.run, tuning) >= tuning.driftFromRound;

export function moveDummy(state, tuning) {
  if (!dummyActive(state, tuning)) {
    return;
  }

  const speed = tuning.dummySpeed + tuning.dummySpeedPerLevel * (state.level - 1);

  sway(state.run.dummy, { speed, range: DUMMY.range });
}

// the run carries the shooter sideways and his aim with him, so the stick has to hold it on
export function drift(state, tuning) {
  const run = state.run;

  if (!driftActive(state, tuning)) {
    return;
  }

  const moved = sway(run.spot, { speed: tuning.driftSpeed, range: tuning.driftRange });

  if (run.stage === 'aim') {
    run.aim.x += moved;
  }
}

export function blocksShot(state, tuning, point) {
  const dummy = state.run.dummy;

  return (
    dummyActive(state, tuning) && Math.abs(point.x - dummy.x) < DUMMY.half && point.y < DUMMY.height
  );
}
