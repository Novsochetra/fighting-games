import { createContext, use, useReducer, type RefObject } from 'react';
import { useArcade } from '../arcade/arcade-context';
import { homeActions } from './home-actions';
import { useBanners } from './use-banners';
import { useCatalog } from './use-catalog';
import { useDetails } from './use-details';
import { useLauncher } from './use-launcher';
import { useLibrary } from './use-library';
import { useSelection } from './use-selection';

// The arcade's state and what its controls do, for every part of the home screen.
export function useHomeState(homeRef: RefObject<HTMLElement | null>) {
  const arcade = useArcade();
  const catalog = useCatalog();
  const { cards } = catalog;
  const choice = useSelection(cards);
  const library = useLibrary(cards);
  const launcher = useLauncher(homeRef);
  const details = useDetails();
  const banners = useBanners();
  const [favorites, favoritesChanged] = useReducer((count: number) => count + 1, 0);
  const parts = { arcade, cards, choice, library, launcher, homeRef, favoritesChanged };

  return {
    ...catalog,
    ...choice,
    library,
    launcher,
    details,
    banners,
    favorites,
    ...homeActions(parts),
  };
}

export type HomeState = ReturnType<typeof useHomeState>;

export const HomeContext = createContext<HomeState | null>(null);

export function useHome(): HomeState {
  const home = use(HomeContext);

  if (!home) {
    throw new Error('useHome needs the home screen above it');
  }

  return home;
}
