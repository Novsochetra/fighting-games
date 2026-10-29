import { useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { fadeOutButtons, riseInButtons, settleUnseen } from './action-swap.js';
import type { GameCard } from './game-card';

interface RowState {
  shown: GameCard;
  fading: boolean;
  // counts the changes made unseen, each of which rises the buttons back
  rises: number;
}

const modeOf = (card: GameCard) => (card.isComingSoon ? 'soon' : 'game');

// Moving between a game and a teaser changes which buttons show. Swapped in one frame, Play jumped
// across the row and the others blinked out, so the row fades out, changes unseen, and rises back.
// Each button fades on its own: an opacity on their row would cut the glass buttons' blur off from
// the art behind them. Swipes that land while it fades are folded into the one change. Returns the
// card the row shows.
export function useActionRow(card: GameCard, animate: boolean, row: RefObject<HTMLElement | null>) {
  const [state, setState] = useState<RowState>({ shown: card, fading: false, rises: 0 });
  const latest = useRef(card);
  const fades = useRef<Animation[]>([]);

  if (!state.fading && state.shown !== card) {
    const shouldFade = animate && modeOf(card) !== modeOf(state.shown);

    setState(shouldFade ? { ...state, fading: true } : { ...state, shown: card });
  }

  useLayoutEffect(() => {
    latest.current = card;
  });

  useLayoutEffect(() => {
    if (!state.fading) {
      return;
    }

    const settle = () =>
      setState((was) => ({ shown: latest.current, fading: false, rises: was.rises + 1 }));

    fades.current = fadeOutButtons(row.current!);

    if (fades.current.length === 0) {
      setState((was) => ({ ...was, shown: latest.current, fading: false }));
    } else {
      Promise.all(fades.current.map((fade) => fade.finished)).then(settle, settle);
    }
  }, [state.fading, row]);

  useLayoutEffect(() => {
    if (state.rises > 0) {
      settleUnseen(row.current!);
      riseInButtons(row.current!);
      fades.current.splice(0).forEach((fade) => fade.cancel());
    }
  }, [state.rises, row]);

  return state.shown;
}
