import { useRef, type RefObject } from 'react';
import { useArcade } from '@/services/arcade-context';
import type { GameCard } from '@/api/catalog/game-card';
import { findLaunchSource } from '@/screens/home/home-parts';
import { createLauncher } from './launcher.js';

// The page changes only once the card has filled the screen (launcher.js); made on the first launch,
// once the arcade is on the page.
export function useLauncher(home: RefObject<HTMLElement | null>) {
  const { window, navigate } = useArcade();
  const launcher = useRef<ReturnType<typeof createLauncher> | null>(null);
  const made = () =>
    (launcher.current ??= createLauncher({
      document: window.document,
      home: home.current!,
      findSource: (index: number) => findLaunchSource(home.current!, index),
      navigate,
    }));

  return {
    launch: (game: { index: number; card: GameCard }) => made().launch(game),
    land: () => made().land(),
    isFlying: () => launcher.current?.isFlying() ?? false,
  };
}

export type Launcher = ReturnType<typeof useLauncher>;
