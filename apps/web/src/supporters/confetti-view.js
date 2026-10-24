import { prefersReducedMotion, readDuration } from '../home/motion-tokens.js';
import { launchPieces, opacityAt, stepPieces } from './confetti.js';

const CONFETTI_COLORS = 6;
// A frame after a long pause (a hidden tab) moves the paper as if only this much time passed.
const MAX_STEP_SECONDS = 0.05;

function readColors(window, canvas) {
  const style = window.getComputedStyle(canvas);
  return Array.from({ length: CONFETTI_COLORS }, (_, i) =>
    style.getPropertyValue(`--color-confetti-${i + 1}`).trim(),
  ).filter(Boolean);
}

// In the top layer the canvas covers the whole screen, above the sheet; a browser without popovers
// keeps it inside the sheet, which is all it then covers.
function raise(canvas) {
  if (typeof canvas.showPopover === 'function' && !canvas.matches(':popover-open')) {
    canvas.showPopover();
  }
}

function lower(canvas) {
  if (typeof canvas.hidePopover === 'function' && canvas.matches(':popover-open')) {
    canvas.hidePopover();
  }
}

function fitCanvas(window, canvas, context) {
  const ratio = window.devicePixelRatio || 1;
  const { left, top, width, height } = canvas.getBoundingClientRect();
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  return { left, top, width, height };
}

function centerOf(element, box) {
  const { left, top, width, height } = element.getBoundingClientRect();
  return { x: left + width / 2 - box.left, y: top + height / 2 - box.top };
}

// Scaling one axis by the cosine of the flip turns each strip like paper tumbling in the air.
function drawPiece(context, piece) {
  context.save();
  context.translate(piece.x, piece.y);
  context.rotate(piece.rotation);
  context.scale(1, Math.cos(piece.flip));
  context.fillStyle = piece.color;
  context.fillRect(-piece.size / 2, -piece.size / 4, piece.size, piece.size / 2);
  context.restore();
}

function animate({ window, context, pieces, duration, clear, finish }) {
  let started = null;
  let last = null;
  let frame = 0;

  function draw(time) {
    started ??= time;
    stepPieces(pieces, Math.min((time - (last ?? time)) / 1000, MAX_STEP_SECONDS));
    last = time;
    clear();
    context.globalAlpha = opacityAt(time - started, duration);
    pieces.forEach((piece) => drawPiece(context, piece));
    if (time - started < duration) {
      frame = window.requestAnimationFrame(draw);
    } else {
      finish();
    }
  }

  frame = window.requestAnimationFrame(draw);
  return () => {
    window.cancelAnimationFrame(frame);
    finish();
  };
}

// Bursts from the middle of the from element, wherever the page has put it.
export function playConfetti({ document, canvas, from }) {
  const window = document.defaultView;
  const context = canvas.getContext?.('2d');
  const colors = context ? readColors(window, canvas) : [];
  const duration = readDuration(document, '--duration-confetti');
  if (!context || colors.length === 0 || duration <= 0 || prefersReducedMotion(window)) {
    return () => {};
  }
  raise(canvas);
  const box = fitCanvas(window, canvas, context);
  const pieces = launchPieces({ origin: centerOf(from, box), colors });
  const clear = () => context.clearRect(0, 0, box.width, box.height);
  const finish = () => {
    clear();
    lower(canvas);
  };
  return animate({ window, context, pieces, duration, clear, finish });
}
