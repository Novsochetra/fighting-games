import { POUNDING_LION } from '../../data/ultimates/pounding-lion.js';
import { LION_RISE_TICKS } from '../summons/lions.js';
import { WAKE_AT } from './rush-timing.js';

const { pride, ripple, hopTicks, cascade, pounceAt, hopHeight, pounceHeight } = POUNDING_LION;
// they land in a loose heap, not all on one pixel
const HEAP_SPACING = 8;
// the heap lies this far ahead of the hero, where his fists pound the ground
const HEAP_AHEAD = 40;
// the scale the leap heights are tuned for
const BASE_SCALE = 0.5;

export function heapAt(heroX, facing) {
  return heroX + facing * HEAP_AHEAD;
}

// for each lion, in the order the echoes wake: ticks after `WAKE_AT` it starts to rise, ticks it
// stays put rising and crouching, and ticks it runs until it lands on the heap
export function prideSchedule() {
  return pride.map(({ scale, wait }, rank) => {
    const delay = rank * ripple;
    const appear = LION_RISE_TICKS + wait;
    const land = pounceAt - (pride.length - 1 - rank) * cascade;
    return { scale, delay, appear, run: land - WAKE_AT - delay - appear };
  });
}

// a lion rises where its echo stood, hops toward the heap and makes one high bound onto it
export function prideFlight(start, rank, { heap, ground, scale, run }) {
  const size = scale / BASE_SCALE;
  const landing = heap + (rank - (pride.length - 1) / 2) * HEAP_SPACING;
  const hop = start + (landing - start) / 3;
  const points = [
    [0, start, 0],
    [hopTicks, hop, hopHeight * size],
    [run, landing, pounceHeight * size],
  ];
  return points.map(([tick, x, height]) => [tick, x, ground(x), height]);
}
