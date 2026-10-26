import type { MouseEvent } from 'react';
import { useNavigate } from 'react-router';
import { cameFrom } from '../home/back-link.js';
import { isPlainClick } from '../home/input-actions.js';
import { useArcade } from './arcade-context';
import { useScreenBefore } from './ScreenStack';

// Back pops to the arcade when the arcade came from it, so it comes back as it was left; a page
// loaded from the arcade goes back through history too, and the browser brings the arcade back from
// its back/forward cache. Opened on its own, Back takes the arcade in, sliding the way Back does.
// A click that opens a tab is left to the link.
export function useBackToArcade() {
  const navigate = useNavigate();
  const { window, referrer, root } = useArcade();
  const screenBefore = useScreenBefore();

  return (event: MouseEvent<HTMLAnchorElement>) => {
    if (!isPlainClick(event)) {
      return;
    }

    event.preventDefault();
    const { history } = window;
    const firstEntry = ((history.state as { idx?: number } | null)?.idx ?? 0) === 0;

    if (
      screenBefore === 'home' ||
      (firstEntry && cameFrom(root, { referrer, historyLength: history.length }))
    ) {
      history.back();
    } else {
      navigate('/', { state: { asPop: true } });
    }
  };
}
