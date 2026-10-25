export const HOME_ZOOM = 1.12;

// The art settles in the middle of the screen at the size of a large card, a little above center to
// leave room for the game's name under it.
export const ART_MAX_WIDTH = 640;
export const ART_SIDE_MARGIN = 24;
export const ART_MAX_HEIGHT_SHARE = 0.46;
export const CAPTION_ROOM = 96;
export const CAPTION_GAP = 24;

// Corners are not linear in the scale, so they get a keyframe every twelfth of the way.
const KEYFRAME_STEPS = 12;

const lerp = (from, to, progress) => from + (to - from) * progress;

export function isMeasurable(rect) {
  return Boolean(rect) && rect.width > 0 && rect.height > 0;
}

export function toRect({ left, top, width, height }) {
  return { x: left, y: top, width, height };
}

export function resolveRadius(value, size) {
  const [first = ''] = String(value ?? '')
    .trim()
    .split(/\s+/);
  const amount = Number.parseFloat(first);
  if (!Number.isFinite(amount)) {
    return 0;
  }
  return first.endsWith('%') ? (amount / 100) * size : amount;
}

export function rectAt(from, to, progress) {
  return {
    x: lerp(from.x, to.x, progress),
    y: lerp(from.y, to.y, progress),
    width: lerp(from.width, to.width, progress),
    height: lerp(from.height, to.height, progress),
  };
}

// The panel stays viewport-sized and is scaled down onto the icon, so only its transform animates.
// Dividing the corner by the scale on each axis keeps it round instead of stretched.
export function panelFrame(rect, viewport, radius) {
  const scaleX = rect.width / viewport.width;
  const scaleY = rect.height / viewport.height;
  return {
    transform: `translate(${rect.x}px, ${rect.y}px) scale(${scaleX}, ${scaleY})`,
    borderRadius: `${radius / scaleX}px / ${radius / scaleY}px`,
  };
}

export function launchArtRect(viewport, from) {
  const aspect = from.width / from.height;
  const width = Math.min(
    viewport.width - 2 * ART_SIDE_MARGIN,
    ART_MAX_WIDTH,
    viewport.height * ART_MAX_HEIGHT_SHARE * aspect,
  );
  const height = width / aspect;
  const x = (viewport.width - width) / 2;
  const y = (viewport.height - height - CAPTION_ROOM) / 2;
  return { x, y, width, height };
}

// The game's name sits just under the art's resting place.
export const captionTop = (art) => art.y + art.height + CAPTION_GAP;

// The art keeps its shape on the way, moved and scaled from where the card was.
export function iconFrame(rect, from) {
  const scale = rect.width / from.width;
  return { transform: `translate(${rect.x - from.x}px, ${rect.y - from.y}px) scale(${scale})` };
}

// The corners round out like a window's as the panel grows, then square off as it fills the screen.
export function radiusAt(progress, radius) {
  return radius * (1 + progress) * (1 - progress ** 4);
}

// The corners animate apart from the transform: they cannot run on the compositor, and sharing an
// animation with them would hold the transform back on the main thread too.
// The panel grows from the card to the screen while the art, still sharp, moves to its resting place.
export function launchKeyframes({ from, viewport, radius, steps = KEYFRAME_STEPS }) {
  const screen = { x: 0, y: 0, width: viewport.width, height: viewport.height };
  const art = launchArtRect(viewport, from);
  const frames = { panel: [], corners: [], icon: [] };
  for (let i = 0; i <= steps; i += 1) {
    const offset = i / steps;
    const rect = rectAt(from, screen, offset);
    const { transform, borderRadius } = panelFrame(rect, viewport, radiusAt(offset, radius));
    frames.panel.push({ offset, transform });
    frames.corners.push({ offset, borderRadius });
    frames.icon.push({ offset, ...iconFrame(rectAt(from, art, offset), from) });
  }
  return frames;
}

export function homeKeyframes() {
  return [
    { offset: 0, transform: 'scale(1)', opacity: 1 },
    { offset: 1, transform: `scale(${HOME_ZOOM})`, opacity: 0 },
  ];
}

// Played backwards with the same easing, so landing slows down into the icon like launching does.
export function reverseKeyframes(keyframes) {
  return keyframes.map((frame) => ({ ...frame, offset: 1 - frame.offset })).reverse();
}
