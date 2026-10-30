import { animateWith, readDuration, readTiming, readToken } from '@/styles/motion-tokens.js';

const FADE_OUT = [{ opacity: 1 }, { opacity: 0 }];

const shownButtons = (row) => [...row.children].filter((button) => !button.hidden);

export function fadeOutButtons(row) {
  const timing = readTiming(row.ownerDocument, {
    duration: '--duration-swap-out',
    easing: '--easing-standard',
  });

  return shownButtons(row)
    .map((button) => animateWith(button, FADE_OUT, { ...timing, fill: 'forwards' }))
    .filter(Boolean);
}

// Backwards fill holds each button unseen through its stagger, so none shows early.
export function riseInButtons(row) {
  const document = row.ownerDocument;
  const offset = readToken(document, '--offset-rise') || '0px';
  const timing = readTiming(document, { duration: '--duration-rise', easing: '--easing-spring' });
  const stagger = readDuration(document, '--duration-stagger') / 2;
  const frames = [
    { opacity: 0, transform: `translateY(${offset})` },
    { opacity: 1, transform: 'none' },
  ];

  shownButtons(row).forEach((button, i) =>
    animateWith(button, frames, { ...timing, delay: i * stagger, fill: 'backwards' }),
  );
}

// The buttons change color while unseen; their own color transitions would play as they rise back,
// and Play would turn from frosted white to black in view. Called once the buttons have changed and
// before the browser styles them again, it lets their new look apply with the transitions off.
export function settleUnseen(row) {
  const buttons = [...row.children];

  buttons.forEach((button) => {
    button.style.transition = 'none';
  });
  row.getBoundingClientRect();
  buttons.forEach((button) => button.style.removeProperty('transition'));
}
