// The icon art fades out over this stretch of the launch, so the splash shows by mid-flight.
export const ICON_FADE = { start: 0.2, end: 0.75 };
export const HOME_ZOOM = 1.12;

// Corners are not linear in the scale, so they get a keyframe every twelfth of the way.
const KEYFRAME_STEPS = 12;

const lerp = (from, to, progress) => from + (to - from) * progress;
const clampUnit = (value) => Math.min(1, Math.max(0, value));

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

export function iconFrame(rect, from) {
  const size = Math.min(rect.width, rect.height);
  const x = rect.x + (rect.width - size) / 2 - from.x;
  const y = rect.y + (rect.height - size) / 2 - from.y;
  return { transform: `translate(${x}px, ${y}px) scale(${size / from.width})` };
}

export function iconOpacityAt(progress) {
  return clampUnit((ICON_FADE.end - progress) / (ICON_FADE.end - ICON_FADE.start));
}

// The corners round out like a window's as the panel grows, then square off as it fills the screen.
export function radiusAt(progress, radius) {
  return radius * (1 + progress) * (1 - progress ** 4);
}

// The corners animate apart from the transform: they cannot run on the compositor, and sharing an
// animation with them would hold the transform back on the main thread too.
export function launchKeyframes({ from, viewport, radius, steps = KEYFRAME_STEPS }) {
  const screen = { x: 0, y: 0, width: viewport.width, height: viewport.height };
  const frames = { panel: [], corners: [], icon: [] };
  for (let i = 0; i <= steps; i += 1) {
    const offset = i / steps;
    const rect = rectAt(from, screen, offset);
    const { transform, borderRadius } = panelFrame(rect, viewport, radiusAt(offset, radius));
    frames.panel.push({ offset, transform });
    frames.corners.push({ offset, borderRadius });
    frames.icon.push({ offset, ...iconFrame(rect, from), opacity: iconOpacityAt(offset) });
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
