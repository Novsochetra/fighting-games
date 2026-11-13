// in ticks, 60 a second, at full length
export const NAGA_TIMINGS = {
  stages: {
    awakening: 60,
    charge: 72,
    manifest: 84,
    impact: 40,
    flight: 60,
    keeper: 60,
    collision: 44,
    aftermath: 100,
  },
  contact: 8,
  hitStop: 10,
  crashStop: 8,
  repeatShare: 0.5,
};

export const STAGE_IDS = Object.keys(NAGA_TIMINGS.stages);

// the build-up a player has seen once in a match plays at a share of its length, as a repeated
// cut-in does in the game
const BUILD_UP = ['awakening', 'charge', 'manifest'];

// the beats that only add time: the holds at the kick and at the crash, and half the keeper's
// slow look; a camera on Short or Off plays without them, as the game's chase and freeze
const holdsFor = (camera) =>
  camera === 'full'
    ? { hit: NAGA_TIMINGS.hitStop, crash: NAGA_TIMINGS.crashStop, keeper: 0 }
    : { hit: 0, crash: 0, keeper: Math.round(NAGA_TIMINGS.stages.keeper / 2) };

const CUT_BY_HOLD = { impact: 'hit', collision: 'crash', keeper: 'keeper' };

function lengthOf(id, { repeat }, holds) {
  const full = NAGA_TIMINGS.stages[id];
  const share = repeat && BUILD_UP.includes(id) ? NAGA_TIMINGS.repeatShare : 1;
  const fullHolds = holdsFor('full');
  const cut = CUT_BY_HOLD[id] ? fullHolds[CUT_BY_HOLD[id]] - holds[CUT_BY_HOLD[id]] : 0;

  return Math.max(1, Math.round(full * share - Math.abs(cut)));
}

export function planFor(settings) {
  const holds = holdsFor(settings.camera);
  let from = 0;
  const stages = STAGE_IDS.map((id) => {
    const length = lengthOf(id, settings, holds);
    const stage = { id, from, length, full: NAGA_TIMINGS.stages[id] };

    from += length;

    return stage;
  });

  return { stages, holds: { hit: holds.hit, crash: holds.crash }, total: from };
}

// `full` is the ticks as they would be at full length, which the camera's shots are written in
export function clockAt(plan, frame) {
  const at = Math.max(0, Math.min(plan.total - 1, frame));
  const stage = plan.stages.findLast((entry) => entry.from <= at);
  const ticks = at - stage.from;

  return {
    frame: at,
    stage: stage.id,
    ticks,
    length: stage.length,
    share: Math.min(1, ticks / stage.length),
    full: (ticks * stage.full) / stage.length,
    holds: plan.holds,
    lengths: Object.fromEntries(plan.stages.map((entry) => [entry.id, entry.length])),
  };
}

// the world stands still through a hold while the camera shakes and the light flashes
export function movingTicks(ticks, { at, hold }) {
  if (ticks <= at) {
    return ticks;
  }

  return at + Math.max(0, ticks - at - hold);
}
