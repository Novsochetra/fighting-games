import { headPose, joinedNeck } from '../../../../../src/render/duel/looks/naga-pose.js';
import { easeIn, easeOut, phaseOf } from './ease.js';
import { flightPoint } from './flight.js';

// in shares of the flight, never ticks, so the swim slows with the keeper's slow motion by
// itself and the pose it crashes in is the same at every camera setting
export const SERPENT = {
  length: 0.3,
  joints: 44,
  size: 1.8,
  menace: 2.7,
  newborn: 0.7,
  neck: 3.6,
  sway: 7,
  waves: 1.6,
  swim: 18,
  born: 0.03,
  closing: 0.8,
};

const STEP = 0.002;

// a point of the ball's path, the way it heads there and its side (down, to its right)
export function pathAt(ending, share) {
  const next = flightPoint(ending, Math.min(1, share + STEP));
  const last = flightPoint(ending, Math.max(0, share - STEP));
  const length = Math.hypot(next.x - last.x, next.y - last.y) || 1;
  const ahead = { x: (next.x - last.x) / length, y: (next.y - last.y) / length };

  return { ...flightPoint(ending, share), ahead, normal: { x: -ahead.y, y: ahead.x } };
}

// the jaws hold the ball on its line, so the swing grows from nothing there
function swingAt(along, flight) {
  const reach = SERPENT.sway * easeOut(phaseOf(along, 0, 0.35)) * (1 - 0.25 * along);

  return reach * Math.sin(along * SERPENT.waves * Math.PI * 2 - flight * SERPENT.swim);
}

const radiusAt = (along, size) => Math.max(0.6, SERPENT.neck * size * (1 - along) ** 0.75);

// tail first, as the game's bodies are; a joint not yet off the boot is not there
function jointsOf(ending, { flight, size }) {
  const joints = [];

  for (let i = 0; i <= SERPENT.joints; i += 1) {
    const along = 1 - i / SERPENT.joints;
    const share = flight - along * SERPENT.length;

    if (share >= 0) {
      const path = pathAt(ending, share);
      const swing = swingAt(along, flight);

      joints.push({
        x: path.x + path.normal.x * swing,
        y: path.y + path.normal.y * swing,
        radius: radiusAt(along, size),
        along,
      });
    }
  }

  return joints;
}

function sizeAt(flight) {
  const born = easeOut(phaseOf(flight, 0, SERPENT.born));
  const closing = easeIn(phaseOf(flight, SERPENT.closing, 1 - SERPENT.closing));

  return (
    SERPENT.newborn +
    (SERPENT.size - SERPENT.newborn) * born +
    (SERPENT.menace - SERPENT.size) * closing
  );
}

// `flight` is 0 at the boot and 1 where it meets the goal
export function serpentAt(flight, ending) {
  if (!(flight > 0)) {
    return null;
  }

  const size = sizeAt(flight);
  const ball = flightPoint(ending, flight);
  const joints = jointsOf(ending, { flight, size });
  const head = headPose(joints.length > 2 ? joints : [ball], { ball, size, facing: 1 });

  return {
    ending,
    ball,
    head,
    joints: joinedNeck(joints, { head, ball }),
    flight,
    born: phaseOf(flight, 0, SERPENT.born),
    burn: phaseOf(flight, SERPENT.closing - 0.04, 1.04 - SERPENT.closing),
  };
}

// the crash holds a few ticks even with no hold on the camera, so the Naga is seen whole as it
// strikes before it breaks; the last of it is gone by `gone` of the aftermath
const BREAK = { hot: 3, least: 5, gone: 0.6 };

// `since` the crash, `ticks` since it broke apart (cracked and still before), `life` 0 at the
// break to 1 when gone
export function breakAt(clock) {
  const since = clock.stage === 'collision' ? clock.ticks : clock.lengths.collision + clock.ticks;
  const cracked = Math.max(BREAK.least, clock.holds.crash);
  const ticks = since - cracked;
  const end = clock.lengths.collision - cracked + BREAK.gone * clock.lengths.aftermath;

  return {
    since,
    hot: since < BREAK.hot,
    ticks,
    life: Math.min(1, Math.max(0, ticks / end)),
  };
}
