import {
  captionTop,
  homeKeyframes,
  isMeasurable,
  launchArtRect,
  launchKeyframes,
  resolveRadius,
  reverseKeyframes,
  toRect,
} from './launch-geometry.js';
import { sampleSplash } from './launch-splash.js';

const keepOrder = (keyframes) => keyframes;

function createPart(document, className) {
  const element = document.createElement('div');
  element.className = className;
  return element;
}

// The game's name, and an activity indicator that shows only if the game takes a moment to load.
function buildCaption(document, title) {
  const caption = createPart(document, 'launch__caption');
  const name = createPart(document, 'launch__title');
  name.textContent = title;
  caption.append(name, createPart(document, 'launch__spinner'));
  return caption;
}

// The same art, blurred and dimmed across the whole panel, so the game opens into its own colors.
function backdropOf(art) {
  const backdrop = art.cloneNode(true);
  backdrop.className = 'launch__backdrop';
  return backdrop;
}

function buildLayer(document, source, title) {
  const layer = createPart(document, 'launch');
  layer.setAttribute('aria-hidden', 'true');
  const panel = createPart(document, 'launch__panel');
  const icon = createPart(document, 'launch__icon');
  const art = source.querySelector('.art');
  if (art) {
    icon.append(art.cloneNode(true));
    panel.append(backdropOf(art));
  }
  const splash = sampleSplash(document, art);
  if (splash) {
    panel.style.setProperty('--splash-top', splash.top);
    panel.style.setProperty('--splash-bottom', splash.bottom);
  }
  const caption = buildCaption(document, title ?? '');
  layer.append(panel, icon, caption);
  document.body.append(layer);
  return { layer, panel, icon, caption };
}

// The banners and the coffee button float outside the home, so the root's class sends them off with
// it (launch.css) rather than leave them sharp over the launch.
const markLaunching = (document, isLaunching) =>
  document.documentElement.classList.toggle('is-launching', isLaunching);

function measureScene({ source, home, layer }) {
  const from = toRect(source.getBoundingClientRect());
  const { width, height } = layer.getBoundingClientRect();
  const homeBox = home.getBoundingClientRect();
  const style = source.ownerDocument.defaultView.getComputedStyle(source);
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

function placeCaption(caption, { from, viewport }) {
  caption.style.top = `${captionTop(launchArtRect(viewport, from))}px`;
}

function placeIcon(icon, { from: rect, radius }) {
  icon.style.setProperty('--radius-launch-art', `${radius}px`);
  icon.style.left = `${rect.x}px`;
  icon.style.top = `${rect.y}px`;
  icon.style.width = `${rect.width}px`;
  icon.style.height = `${rect.height}px`;
}

function play(parts, scene, { timing, order }) {
  const frames = launchKeyframes(scene);
  const options = { duration: timing.duration, easing: timing.easing, fill: 'forwards' };
  placeIcon(parts.icon, scene);
  placeCaption(parts.caption, scene);
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

// source is the framed art of a card or tile; it hides while its copy flies.
export function flyOpen({ document, source, home, timing, title }) {
  if (!source || !isMeasurable(source.getBoundingClientRect())) {
    return null;
  }
  const parts = { ...buildLayer(document, source, title), home };
  const scene = measureScene({ source, home, layer: parts.layer });
  if (!isMeasurable(scene.viewport)) {
    parts.layer.remove();
    return null;
  }
  source.classList.add('is-launching');
  markLaunching(document, true);
  const animations = play(parts, scene, { timing, order: keepOrder });
  return { source, parts, animations, done: settle(animations) };
}

export function flyClose({ source, parts, animations: openAnimations }, { timing }) {
  // The home has to be at rest to measure where the art sits now (the screen may have turned while
  // the game was open). Cancelling and restarting in one task means no frame shows the gap.
  openAnimations.forEach((animation) => animation.cancel());
  parts.caption.hidden = true;
  const scene = measureScene({ source, home: parts.home, layer: parts.layer });
  const animations =
    source.isConnected && isMeasurable(scene.from)
      ? play(parts, scene, { timing, order: reverseKeyframes })
      : fadeOut(parts.layer, timing);
  return settle(animations).then(() => {
    parts.layer.remove();
    parts.home.style.removeProperty('transform-origin');
    source.classList.remove('is-launching');
    markLaunching(parts.layer.ownerDocument, false);
    animations.forEach((animation) => animation.cancel());
  });
}
