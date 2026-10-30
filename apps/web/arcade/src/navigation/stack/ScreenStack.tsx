import { createContext, use, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation, useNavigationType } from 'react-router';
import { applyHead, SCREEN_HEADS } from '@/navigation/routes/screen-heads';
import { screenAtRoute, type ScreenId } from '@/navigation/routes/screens';
import {
  advanceStack,
  createStack,
  frontAndBack,
  settleStack,
  type StackModel,
} from './stack-model';
import { playMove } from './stack-motion';

export type LayerRole = 'top' | 'front' | 'back' | 'hidden';

const ScreenContext = createContext<{ id: ScreenId; role: LayerRole; isTop: boolean } | null>(null);
const TrailContext = createContext<() => ScreenId | null>(() => null);

// The screen of the tab's history entry before this one, while the arcade made it: Back pops to it.
export const useScreenBefore = () => use(TrailContext)();

// react-router numbers its entries in the tab's history (history.state.idx)
const entryIndex = (window: Window): number =>
  (window.history.state as { idx?: number } | null)?.idx ?? 0;

// Whether the screen this is inside is the one the route shows: the arcade's keys and pad are its
// own only while it is.
export function useIsTopScreen(): boolean {
  const screen = use(ScreenContext);

  return !screen || screen.isTop;
}

// What the screen this is inside does in the stack: front or back while a move slides it.
export const useScreenRole = (): LayerRole => use(ScreenContext)?.role ?? 'top';

function roleOf(stack: StackModel, id: ScreenId): LayerRole {
  const pair = frontAndBack(stack);

  if (pair?.front === id) {
    return 'front';
  }

  if (pair) {
    return pair.back === id ? 'back' : 'hidden';
  }

  return stack.top === id ? 'top' : 'hidden';
}

interface LayerProps {
  id: ScreenId;
  role: LayerRole;
  isTop: boolean;
  layerRef: (element: HTMLElement | null) => void;
  children: ReactNode;
}

// A screen left under the stack stays rendered but unseen and inert, so it comes back as it was left,
// at its own scroll: each layer is its own scroller.
function ScreenLayer({ id, role, isTop, layerRef, children }: LayerProps) {
  return (
    <section
      className={`screen-layer screen-layer--${role}`}
      data-screen={id}
      ref={layerRef}
      tabIndex={-1}
      inert={role === 'hidden'}
    >
      <ScreenContext value={{ id, role, isTop }}>{children}</ScreenContext>
    </section>
  );
}

// The stack follows the route: a move advances it, plays the slide on its two layers, then settles,
// and the screen arrived at takes the focus, as a page load would put it.
function useStackMoves(screen: ScreenId) {
  const location = useLocation();
  const navigationType = useNavigationType();
  const [stack, setStack] = useState(() => createStack(screen));
  const [routeKey, setRouteKey] = useState(location.key);
  const layers = useRef(new Map<ScreenId, HTMLElement>());

  if (routeKey !== location.key) {
    const asPop = (location.state as { asPop?: boolean } | null)?.asPop;

    setRouteKey(location.key);
    setStack((current) => advanceStack(current, screen, { navigationType, asPop }));
  }

  useLayoutEffect(() => {
    const pair = frontAndBack(stack);
    const front = pair && layers.current.get(pair.front);
    const back = pair && layers.current.get(pair.back);

    if (!pair || !front || !back || stack.move === 'none') {
      return undefined;
    }

    const move = playMove(stack.move, { front, back });

    move.finished.then(() => {
      setStack((current) => (current.id === stack.id ? settleStack(current) : current));
      layers.current.get(stack.top)?.focus({ preventScroll: true });
    });

    return move.cancel;
  }, [stack]);

  return { stack, layers };
}

function useTrail(screen: ScreenId) {
  const { key } = useLocation();
  const trail = useRef(new Map<number, ScreenId>());

  useLayoutEffect(() => {
    trail.current.set(entryIndex(window), screen);
  }, [key, screen]);

  return () => trail.current.get(entryIndex(window) - 1) ?? null;
}

export function ScreenStack({ renderScreen }: { renderScreen: (id: ScreenId) => ReactNode }) {
  const { pathname } = useLocation();
  const screen = screenAtRoute(pathname) ?? 'home';
  const { stack, layers } = useStackMoves(screen);
  const screenBefore = useTrail(screen);

  useLayoutEffect(() => applyHead(document, SCREEN_HEADS[stack.top]), [stack.top]);

  return (
    <TrailContext value={screenBefore}>
      <div className="screen-stack">
        {stack.layers.map((id) => (
          <ScreenLayer
            key={id}
            id={id}
            role={roleOf(stack, id)}
            isTop={stack.top === id}
            layerRef={(element) => {
              if (element) {
                layers.current.set(id, element);
              } else {
                layers.current.delete(id);
              }
            }}
          >
            {renderScreen(id)}
          </ScreenLayer>
        ))}
      </div>
    </TrailContext>
  );
}
