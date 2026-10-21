import { VIEW_WIDTH } from '../../config.js';
import { POUNDING_LION } from '../../data/ultimates/pounding-lion.js';
import { clamp } from '../../lib/math.js';
import { LION_RISE_TICKS } from '../summons/lions.js';

const { prideAt, pride, ripple, hopTicks, cascade, pounceAt } = POUNDING_LION;
const { highLeap, lowLeap, pounceHeight } = POUNDING_LION;
// world px kept clear at the screen's edges, so no lion is cut off
const EDGE_INSET = 28;
// world px kept clear on each side of the hero, so no lion rises in front of his slam
const HERO_GAP = 30;
// they land in a loose heap on the middle, not all on one pixel
const HEAP_SPACING = 8;
// the scale the leap heights are tuned for
const BASE_SCALE = 0.5;

// an even row across the screen, left to right, with a gap left round the hero
export function pridePosts(cameraX, heroX) {
  const left = cameraX + EDGE_INSET;
  const right = cameraX + VIEW_WIDTH - EDGE_INSET;
  const gap = HERO_GAP * 2;
  const gapStart = clamp(heroX - HERO_GAP, left, right - gap);
  const span = right - left - gap;
  return Array.from({ length: pride.length }, (_, i) => {
    const x = left + (span * (i + 0.5)) / pride.length;
    return x < gapStart ? x : x + gap;
  });
}

// the posts nearest the hero first, so the gold of his slam seems to spread out and wake them
export function riseOrder(posts, heroX) {
  return posts
    .map((x, post) => ({ post, distance: Math.abs(x - heroX) }))
    .sort((first, second) => first.distance - second.distance)
    .map(({ post }) => post);
}

// for each lion, in the order they rise: ticks after `prideAt` it starts to rise, ticks it stays
// put rising and crouching, and ticks it runs until it lands on the middle
export function prideSchedule() {
  return pride.map(({ scale, wait }, rank) => {
    const delay = Math.floor(rank / 2) * ripple;
    const appear = LION_RISE_TICKS + wait;
    const land = pounceAt - (pride.length - 1 - rank) * cascade;
    return { scale, delay, appear, run: land - prideAt - delay - appear };
  });
}

// the left half bounds right to the posts the right half stood on and the right half bounds left,
// one half high over the other; then each lion makes one high bound onto the heap in the middle
export function prideFlight(posts, post, { middle, facing, ground, scale, run }) {
  const half = posts.length / 2;
  const across = (post + half) % posts.length;
  const direction = post < half ? 1 : -1;
  const size = scale / BASE_SCALE;
  const leap = (direction === facing ? highLeap : lowLeap) * size;
  const start = posts[post];
  const end = posts[across];
  const heap = middle + (across - (posts.length - 1) / 2) * HEAP_SPACING;
  const points = [
    [0, start, 0],
    [hopTicks, (start + end) / 2, leap],
    [hopTicks * 2, end, leap],
    [run, heap, pounceHeight * size],
  ];
  return points.map(([tick, x, hop]) => [tick, x, ground(x), hop]);
}
