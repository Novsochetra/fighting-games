import { useQuery } from '@tanstack/react-query';
import { useArcade, useArcadeUrl } from '../arcade/arcade-context';
import { fetchCatalog } from './catalog-client.js';
import { withComingSoon } from './coming-soon.js';
import type { GameCard } from './game-card';
import { toGameCards } from './view-models.js';

export type HomePhase = 'loading' | 'error' | 'empty' | 'games';

const NO_CARDS: GameCard[] = [];

export function useCatalog() {
  const { fetch } = useArcade();
  const url = useArcadeUrl();
  const query = useQuery({
    queryKey: ['games'],
    queryFn: async (): Promise<GameCard[]> =>
      withComingSoon(toGameCards(await fetchCatalog(fetch, url('api/games')))),
  });

  return { query, cards: query.data ?? NO_CARDS, phase: phaseOf(query) };
}

// Loading again after an error shows the spinner again.
function phaseOf(query: ReturnType<typeof useQuery<GameCard[]>>): HomePhase {
  if (query.data) {
    return query.data.length === 0 ? 'empty' : 'games';
  }

  return query.isError && !query.isFetching ? 'error' : 'loading';
}
