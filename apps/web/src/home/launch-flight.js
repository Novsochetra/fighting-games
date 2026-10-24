import {
  homeKeyframes,
  isMeasurable,
  launchKeyframes,
  resolveRadius,
  reverseKeyframes,
  toRect,
} from './launch-geometry.js';
import { createBackdrop } from './launch-backdrop.js';

const ICON_SELECTOR = '.app__icon';
const keepOrder = (keyframes) => keyframes;

function createPart(document, className) {
  const element = document.createElement('div');
  element.className = className;
  return element;
}

function buildLayer(document, iconBox) {
  const layer = createPart(document, 'launch');
  layer.setAttribute('aria-hidden', 'true');
  const panel = createPart(document, 'launch__panel');
  const icon = createPart(document, 'launch__icon');
  const art = iconBox.querySelector('.app__art');
  if (art) {
    icon.append(art.cloneNode(true));
  }
  panel.append(createBackdrop(document, art));
  layer.append(panel, icon);
  document.body.append(layer);
  return { layer, panel, icon };
}

function measureScene({ iconBox, home, layer }) {
  const from = toRect(iconBox.getBoundingClientRect());
  const { width, height } = layer.getBoundingClientRect();
  const homeBox = home.getBoundingClientRect();
  const style = iconBox.ownerDocument.defaultView.getComputedStyle(iconBox);
  return {
    from,
    viewport: { width, height },
    radius: resolveRadius(style.borderTopLeftRadius, from.width),
    origin: {
      x: from.x + from.width / 2 - homeBox.left,
      y: from.y + from.height / 2 - homeBox.top,
    },
  };
}

function placeIcon(icon, rect) {
  icon.style.left = `${rect.x}px`;
  icon.style.top = `${rect.y}px`;
  icon.style.width = `${rect.width}px`;
  icon.style.height = `${rect.height}px`;
}

function play(parts, scene, { timing, order }) {
  const frames = launchKeyframes(scene);
  const options = { duration: timing.duration, easing: timing.easing, fill: 'forwards' };
  placeIcon(parts.icon, scene.from);
  // Set outside the keyframes, which would otherwise keep the zoom off the compositor.
  parts.home.style.transformOrigin = `${scene.origin.x}px ${scene.origin.y}px`;
  return [
    parts.panel.animate(order(frames.panel), options),
    parts.panel.animate(order(frames.corners), options),
    parts.icon.animate(order(frames.icon), options),
    parts.home.animate(order(homeKeyframes()), options),
  ];
}

function fadeOut(layer, timing) {
  return [layer.animate([{ opacity: 1 }, { opacity: 0 }], { ...timing, fill: 'forwards' })];
}

const settle = (animations) =>
  Promise.all(animations.map((animation) => animation.finished.catch(() => {})));

export function flyOpen({ document, link, home, timing }) {
  const iconBox = link.querySelector(ICON_SELECTOR);
  if (!iconBox || !isMeasurable(iconBox.getBoundingClientRect())) {
    return null;
  }
  const parts = { ...buildLayer(document, iconBox), home };
  const scene = measureScene({ iconBox, home, layer: parts.layer });
  if (!isMeasurable(scene.viewport)) {
    parts.layer.remove();
    return null;
  }
  link.classList.add('is-launching');
  const animations = play(parts, scene, { timing, order: keepOrder });
  return { link, parts, animations, done: settle(animations) };
}

export function flyClose({ link, parts, animations: openAnimations }, { timing }) {
  // The home has to be at rest to measure where the icon sits now (the screen may have turned while
  // the game was open). Cancelling and restarting in one task means no frame shows the gap.
  openAnimations.forEach((animation) => animation.cancel());
  const iconBox = link.querySelector(ICON_SELECTOR);
  const scene = measureScene({ iconBox, home: parts.home, layer: parts.layer });
  const animations = isMeasurable(scene.from)
    ? play(parts, scene, { timing, order: reverseKeyframes })
    : fadeOut(parts.layer, timing);
  return settle(animations).then(() => {
    parts.layer.remove();
    parts.home.style.removeProperty('transform-origin');
    link.classList.remove('is-launching');
    animations.forEach((animation) => animation.cancel());
  });
}
