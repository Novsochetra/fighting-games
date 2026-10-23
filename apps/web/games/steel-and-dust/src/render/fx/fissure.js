import { COLORS } from '../../art/colors.js';
import { FX_COLORS } from '../../art/fx-colors.js';
import { VIEW_WIDTH } from '../../config.js';
import { clamp, hashInt } from '../../lib/math.js';
import { fissureReach } from '../../sim/fx/fissure.js';
import { point } from '../painter.js';

// at about one point of the crack in so many, light pours up out of it as the crack runs past, each
// shaft as tall as its stretch of road gives it
const SHAFT_EVERY = 4;
const SHAFT_HEIGHT = 44;
const SHAFT_GROWS = 3;
const SHAFT_DIES = 24;
// the white-hot stretch just behind the crack's running ends
const HOT_REACH = 28;

// it burns at full strength through the first half of its life, then cools away
export function fissureGlow(progress) {
  return progress < 0.5 ? 1 : Math.max(0, 2 - progress * 2);
}

function openSegments(effect, reach) {
  const segments = [];
  for (let i = 1; i < effect.points.length; i++) {
    const [fromX, fromY] = effect.points[i - 1];
    const [toX, toY] = effect.points[i];
    if (Math.max(Math.abs(fromX - effect.x), Math.abs(toX - effect.x)) <= reach) {
      segments.push({ from: point(fromX, fromY), to: point(toX, toY) });
    }
  }
  return segments;
}

// a shaft springs up as the crack's end runs past it and dies down behind it
export function shaftHeight(effect, at) {
  const since = effect.time - (effect.run * Math.abs(at.x - effect.x)) / VIEW_WIDTH;
  const life = since < SHAFT_GROWS ? since / SHAFT_GROWS : 1 - (since - SHAFT_GROWS) / SHAFT_DIES;
  const tall = 0.45 + (hashInt(Math.round(at.x)) % 56) / 100;
  return Math.round(SHAFT_HEIGHT * tall * clamp(life, 0, 1));
}

function drawShaft(painter, { effect, at }) {
  const height = shaftHeight(effect, at);
  if (height < 2) {
    return;
  }
  const core = Math.round(height * 0.6);
  painter
    .alpha(0.45)
    .use(effect.color)
    .rect(at.x - 1, at.y - height, 3, height);
  painter
    .alpha(0.9)
    .use(COLORS.white)
    .rect(at.x, at.y - core, 1, core);
}

// the crack his chop opens: dark walls, a gold seam, white-hot where it is still running, and
// shafts of light rising out of it until it cools
export function drawFissure(painter, effect, progress) {
  const reach = fissureReach(effect);
  const segments = openSegments(effect, reach);
  painter.alpha(fissureGlow(progress));
  for (const { from, to } of segments) {
    painter.use(FX_COLORS.fissureDark).line(from, to, 3);
  }
  for (const { from, to } of segments) {
    painter.use(effect.color).line(from, to, 1);
  }
  for (const { from, to } of segments) {
    const hot = effect.time <= effect.run && reach - Math.abs(to.x - effect.x) < HOT_REACH;
    if (hot) {
      painter.use(COLORS.white).line(from, to, 1);
    }
  }
  for (const { to } of segments) {
    if (hashInt(Math.round(to.x) + 1) % SHAFT_EVERY === 0) {
      drawShaft(painter, { effect, at: to });
    }
  }
  painter.alpha(1);
}
