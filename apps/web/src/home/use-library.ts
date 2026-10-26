import { useState } from 'react';
import { useArcade } from '../arcade/arcade-context';
import { EVENTS } from './analytics-events.js';
import type { GameCard } from './game-card';
import { isFilter, libraryPage } from './library-filter.js';

export type Filter = 'all' | 'recent' | 'favorites';

type Preferences = ReturnType<typeof useArcade>['preferences'];

const listsOf = (preferences: Preferences) => ({
  favorites: preferences.favorites(),
  recent: preferences.recent(),
});

// The library reads the favorites and the games played when it changes filter or page, and when
// asked: a game opened is in Recent once the arcade is back from it, not while its card flies.
export function useLibrary(cards: GameCard[]) {
  const { preferences, sound, analytics } = useArcade();
  const [state, setState] = useState(() => ({
    filter: 'all' as Filter,
    expanded: false,
    lists: listsOf(preferences),
  }));
  // read now, not when React gets to the change, by when a game may have been opened
  const update = (changes: Partial<typeof state>) => {
    const lists = listsOf(preferences);

    setState((was) => ({ ...was, ...changes, lists }));
  };

  return {
    filter: state.filter,
    page: libraryPage(cards, { filter: state.filter, expanded: state.expanded, ...state.lists }),
    setFilter(filter: string) {
      if (!isFilter(filter) || filter === state.filter) {
        return false;
      }

      sound.play('switch');
      update({ filter: filter as Filter, expanded: false });
      analytics.track(EVENTS.filter, { filter });

      return true;
    },

    showMore() {
      update({ expanded: true });
      analytics.track(EVENTS.showMore);
    },

    refreshIf(filter: Filter) {
      const lists = listsOf(preferences);

      setState((was) => (was.filter === filter ? { ...was, lists } : was));
    },
  };
}

export type Library = ReturnType<typeof useLibrary>;
