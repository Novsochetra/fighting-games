import { nextRandom } from '../../sim/random.js';

// the lane runs along x; y goes from its far edge (0) to its near edge (LANE.width)
export const LANE = { width: 200, start: 40, firstCone: 170, finishGap: 90, goalGap: 150 };

const MIDDLE = LANE.width / 2;
const MANNEQUIN_GAP = 36;

// past this a cone's side, or the mannequin beside it, would leave the lane
const MOST_SWAY = MIDDLE - MANNEQUIN_GAP - 14;

const shapeOf = (tuning, level) => ({
  count: tuning.cones + tuning.conesPerLevel * (level - 1),
  spacing: Math.max(tuning.minSpacing, tuning.spacing + tuning.spacingPerLevel * (level - 1)),
  sway: Math.min(MOST_SWAY, tuning.sway + tuning.swayPerLevel * (level - 1)),
});

// the first third is a straight line, the second sways, the last sways tighter
function sectionOf(i, count) {
  return Math.min(2, Math.floor((i * 3) / count));
}

// a step from one cone to the next stays one a runner can make between them
function swayAt(random, { sway, spacing }, last) {
  const most = Math.min(sway * 0.7, spacing * 0.3);
  const step = (nextRandom(random) * 2 - 1) * most;

  return Math.max(-sway, Math.min(sway, last + step));
}

function placeCones(random, shape) {
  const { count, spacing } = shape;
  const cones = [];
  let x = LANE.firstCone;
  let offset = 0;

  for (let i = 0; i < count; i += 1) {
    const section = sectionOf(i, count);

    offset = section === 0 ? 0 : swayAt(random, shape, offset);
    cones.push({
      x,
      y: MIDDLE + offset,
      side: i % 2 === 0 ? 'far' : 'near',
      passed: false,
      clean: false,
      down: null,
    });
    x += section === 2 ? Math.round(spacing * 0.85) : spacing;
  }

  return cones;
}

// a mannequin stands out past the side a cone is passed on, so the gap to thread narrows
function placeMannequins(random, cones, level, tuning) {
  if (level < tuning.mannequinsFromLevel) {
    return [];
  }

  return cones
    .filter((_, i) => sectionOf(i, cones.length) === 2 && nextRandom(random) < 0.6)
    .map((cone) => ({
      x: cone.x,
      y: cone.y + (cone.side === 'far' ? -MANNEQUIN_GAP : MANNEQUIN_GAP),
      hit: null,
    }));
}

export function createCourse(random, { tuning, level }) {
  const shape = shapeOf(tuning, level);
  const cones = placeCones(random, shape);
  const finishX = cones.at(-1).x + LANE.finishGap;

  return {
    cones,
    mannequins: placeMannequins(random, cones, level, tuning),
    finishX,
    goalX: finishX + LANE.goalGap,
    length: finishX + LANE.goalGap + 60,
  };
}

// a clean run at running pace, kept straight, sets the par every score is held to
export const parTicks = (course, tuning) =>
  Math.round((course.finishX - LANE.start) / tuning.speed);

export const limitTicks = (course, tuning) =>
  Math.round(parTicks(course, tuning) * tuning.limitShare);
