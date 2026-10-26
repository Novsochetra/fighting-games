import { useEffect, useEffectEvent } from 'react';
import { useArcade } from '../arcade/arcade-context';
import { useIsTopScreen } from '../arcade/ScreenStack';
import { createGamepadPoller } from './gamepad-poller.js';
import { useHome } from './home-context';
import { actionForKey, focusZone, handlesEnter, isTextField } from './input-actions.js';
import { usePageShow } from './use-page-show';

// While a sheet is up, or another screen of the arcade shows, the arcade's keys and pad are its own
// no longer.
function useIsBlocked() {
  const { window } = useArcade();
  const isTop = useIsTopScreen();

  return () => !isTop || window.document.documentElement.classList.contains('has-open-sheet');
}

function useKeys() {
  const { window } = useArcade();
  const home = useHome();
  const isBlocked = useIsBlocked();
  const onKeyDown = useEffectEvent((event: KeyboardEvent) => {
    const action = actionForKey(event);
    const target = event.target as HTMLElement | null;

    if (!action || isBlocked() || isTextField(target)) {
      return;
    }

    if (action === 'start' && handlesEnter(target)) {
      return;
    }

    if (home.handleAction(action, { focus: focusZone(target) })) {
      event.preventDefault();
    }
  });

  useEffect(() => {
    const { document } = window;

    document.addEventListener('keydown', onKeyDown);

    return () => document.removeEventListener('keydown', onKeyDown);
  }, [window]);
}

function useGamepads() {
  const { gamepads } = useArcade();
  const home = useHome();
  const isBlocked = useIsBlocked();
  const onAction = useEffectEvent((action: string) => {
    if (!isBlocked()) {
      home.handleAction(action, { source: 'gamepad' });
    }
  });

  useEffect(() => {
    if (!gamepads) {
      return undefined;
    }

    const poller = createGamepadPoller({ ...gamepads, onAction });
    const start = () => poller.start();

    gamepads.events.addEventListener('gamepadconnected', start);
    poller.start();

    return () => {
      gamepads.events.removeEventListener('gamepadconnected', start);
      poller.stop();
    };
  }, [gamepads]);
}

// Back from a game through the back/forward cache: the card takes the screen back, then the Recent
// list catches up with the game just played.
function useReturns() {
  const { sound } = useArcade();
  const { launcher, library } = useHome();

  usePageShow(() => {
    if (launcher.isFlying()) {
      sound.play('land');
    }

    launcher.land().then(() => library.refreshIf('recent'));
  });
}

export function useHomeInputs() {
  const { window } = useArcade();

  useKeys();
  useGamepads();
  useReturns();
  // iOS Safari shows :active, the pressed look of a card, only where something listens for touches.
  useEffect(() => {
    const listen = () => {};

    window.document.addEventListener('touchstart', listen, { passive: true });

    return () => window.document.removeEventListener('touchstart', listen);
  }, [window]);
}
