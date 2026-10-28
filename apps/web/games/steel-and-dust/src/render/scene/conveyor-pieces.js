import { CONVEYOR } from '../../data/conveyors.js';

const DRIVE_END = 4;
const FAR_END = 5;
const VARIANTS = 4;
// how far up the belt from the furnace's mouth each piece's anchor stands, in world px, so the
// drawn pieces butt together: the far end's cap under the furnace's chute, then the segments,
// then the drive end
const FAR_END_BACK = 11.5;
const FIRST_SEGMENT_BACK = 45.5;
// the belt's straight run, whose plates are seen moving, from where the far end's drum begins to
// just past the drive end's anchor, where its gear begins
const FAR_DRUM_BACK = 5;
const DRIVE_GEAR_PAST = 2.5;

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

// the stretch of straight belt whose plates are seen running toward the mouth: all of it, over
// the far and drive ends too, so no plate there stands still beside the moving ones
export function plateSpan(belt) {
  const driveBack = FIRST_SEGMENT_BACK + CONVEYOR.segment * belt.segments;

  return { near: FAR_DRUM_BACK, far: driveBack + DRIVE_GEAR_PAST };
}

// the plates of every segment, moved on toward the mouth by how far the belt has run, and one
// segment's more at each end over the far and drive ends; each place's plates move into the next
// one's, and one more comes in at the top
export function plateSlots(belt, tick) {
  const travel = tick * CONVEYOR.speed;
  const shift = Math.floor(travel / CONVEYOR.segment);
  const moved = travel - shift * CONVEYOR.segment;

  return Array.from({ length: belt.segments + 3 }, (_, i) => ({
    frame: (i + shift) % VARIANTS,
    back: FIRST_SEGMENT_BACK + CONVEYOR.segment * (i - 1) - moved,
  }));
}
