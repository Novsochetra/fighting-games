import { readDuration } from '@/styles/motion-tokens.js';
import {
  dragOffset,
  isOutside,
  pullOf,
  readIntent,
  shouldDismiss,
  trackVelocity,
} from './sheet-drag.js';

function follow(dialog, offset) {
  dialog.style.translate = `0 ${offset}px`;
  dialog.style.setProperty('--sheet-pull', String(pullOf(offset, dialog.offsetHeight)));
}

export function clearDrag(dialog) {
  dialog.classList.remove('is-dragging');
  dialog.style.removeProperty('translate');
  dialog.style.removeProperty('--sheet-pull');
}

function settle(dialog, settling) {
  const duration = readDuration(dialog.ownerDocument, '--duration-sheet');

  clearTimeout(settling.timer);
  dialog.classList.add('is-settling');
  clearDrag(dialog);
  settling.timer = setTimeout(() => dialog.classList.remove('is-settling'), duration);
}

function startTouch(dialog, event) {
  const [{ clientX, clientY }] = event.touches;
  const isOnSheet = !isOutside(dialog.getBoundingClientRect(), { clientX, clientY });

  if (event.touches.length !== 1 || !isOnSheet || dialog.classList.contains('is-closing')) {
    return null;
  }

  const last = { y: clientY, time: event.timeStamp, velocity: 0 };

  return { x: clientX, y: clientY, atTop: dialog.scrollTop <= 0, intent: 'undecided', last };
}

function moveTouch(dialog, touch, event) {
  const [{ clientX, clientY }] = event.touches;

  if (touch.intent === 'undecided') {
    const motion = { dx: clientX - touch.x, dy: clientY - touch.y, atTop: touch.atTop };

    touch.intent = readIntent(motion);
    touch.y = clientY;
    dialog.classList.toggle('is-dragging', touch.intent === 'drag');
  }

  if (touch.intent !== 'drag') {
    return;
  }

  // taken on the first move, before iOS Safari commits the touch to scrolling and ignores the rest
  event.preventDefault();
  touch.last = trackVelocity(touch.last, clientY, event.timeStamp);
  touch.offset = dragOffset(touch.y, clientY);
  follow(dialog, touch.offset);
}

export function wireDrag({ dialog, close, signal }) {
  const settling = { timer: null };
  let touch = null;

  const end = () => {
    const ended = touch;

    touch = null;

    if (ended?.intent !== 'drag') {
      return;
    }

    const swipe = { offset: ended.offset ?? 0, height: dialog.offsetHeight };

    if (shouldDismiss({ ...swipe, velocity: ended.last.velocity })) {
      dialog.classList.remove('is-dragging');
      close();
    } else {
      settle(dialog, settling);
    }
  };

  const options = { signal, passive: true };

  dialog.addEventListener('touchstart', (event) => (touch = startTouch(dialog, event)), options);
  dialog.addEventListener('touchmove', (event) => touch && moveTouch(dialog, touch, event), {
    signal,
    passive: false,
  });
  dialog.addEventListener('touchend', end, options);
  dialog.addEventListener('touchcancel', end, options);
  signal.addEventListener('abort', () => clearTimeout(settling.timer));
}
