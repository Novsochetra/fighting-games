import { animateWith, readDuration, readTiming, readToken } from './motion-tokens.js';

const FADE_OUT = [{ opacity: 1 }, { opacity: 0 }];

const shownButtons = (row) => [...row.children].filter((button) => !button.hidden);

function fadeOut(row) {
  const timing = readTiming(row.ownerDocument, {
    duration: '--duration-swap-out',
    easing: '--easing-standard',
  });
  return shownButtons(row)
    .map((button) => animateWith(button, FADE_OUT, { ...timing, fill: 'forwards' }))
    .filter(Boolean);
}

// Backwards fill holds each button unseen through its stagger, so none shows early.
function riseIn(row) {
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
// and Play would turn from frosted white to black in view.
function changeUnseen(row, change) {
  const buttons = [...row.children];
  buttons.forEach((button) => {
    button.style.transition = 'none';
  });
  change();
  row.getBoundingClientRect();
  buttons.forEach((button) => button.style.removeProperty('transition'));
}

// Moving between a game and a teaser changes which buttons show. Swapped in one frame, Play jumped
// across the row and the others blinked out, so the row fades out, changes unseen, and rises back.
// Each button fades on its own: an opacity on their row would cut the glass buttons' blur off from
// the art behind them. Swipes that land while it fades are folded into the one change.
export function createActionSwap({ row, apply, modeOf }) {
  const state = { mode: null, latest: null, fading: null };

  function settle() {
    const outs = state.fading;
    state.fading = null;
    changeUnseen(row, () => apply(state.latest));
    riseIn(row);
    outs.forEach((animation) => animation.cancel());
  }

  return function show(card, { animate = false } = {}) {
    const mode = modeOf(card);
    const isChange = state.mode !== null && mode !== state.mode;
    state.mode = mode;
    state.latest = card;
    if (state.fading) {
      return;
    }
    const outs = animate && isChange ? fadeOut(row) : [];
    if (outs.length === 0) {
      apply(card);
      return;
    }
    state.fading = outs;
    Promise.all(outs.map((animation) => animation.finished)).then(settle, settle);
  };
}
