import { CONVEYOR } from '../../data/conveyors.js';

const DRIVE_END = 4;
const FAR_END = 5;
const VARIANTS = 4;
// how far up the belt from the furnace's mouth each piece's anchor stands, in world px, so the
// drawn pieces butt together: the far end's cap under the furnace's chute, then the segments,
// then the drive end
const FAR_END_BACK = 11.5;
const FIRST_SEGMENT_BACK = 45.5;
// a segment's plates reach this far either side of its anchor
const HALF_PLATES = 18;

// the belt is set in the floor, its plates as high over the feet as the road's cinders; the
// furnace stands on the floor just past the mouth, its chute over the belt's far end
export const BELT_SINK = 18;
export const PLATES = { top: -3, bottom: 5 };
export const FURNACE_AHEAD = 11;

export function beltPieces(belt) {
  const segments = Array.from({ length: belt.segments }, (_, i) => ({
    frame: i % VARIANTS,
    back: FIRST_SEGMENT_BACK + CONVEYOR.segment * i,
  }));
  const driveBack = FIRST_SEGMENT_BACK + CONVEYOR.segment * belt.segments;

  return [
    { frame: FAR_END, back: FAR_END_BACK },
    ...segments,
    { frame: DRIVE_END, back: driveBack },
  ];
}

// the stretch of straight belt whose plates are seen running toward the mouth
export function plateSpan(belt) {
  const last = FIRST_SEGMENT_BACK + CONVEYOR.segment * (belt.segments - 1);

  return { near: FIRST_SEGMENT_BACK - HALF_PLATES, far: last + HALF_PLATES };
}

// the plates of every segment, moved on toward the mouth by how far the belt has run; each
// segment's plates move into the next one's place, and one more comes in at the top
export function plateSlots(belt, tick) {
  const travel = tick * CONVEYOR.speed;
  const shift = Math.floor(travel / CONVEYOR.segment);
  const moved = travel - shift * CONVEYOR.segment;

  return Array.from({ length: belt.segments + 1 }, (_, i) => ({
    frame: (i + shift) % VARIANTS,
    back: FIRST_SEGMENT_BACK + CONVEYOR.segment * i - moved,
  }));
}
