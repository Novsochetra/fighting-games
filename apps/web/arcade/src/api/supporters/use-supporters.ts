import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useArcade, useArcadeUrl } from '@/services/arcade-context';
import { fetchSupporters } from './supporters-client.js';

export const SUPPORTERS_QUERY = ['supporters'];

export type Phase = 'loading' | 'error' | 'list' | 'empty';

export function useSupporters() {
  const { fetch } = useArcade();
  const url = useArcadeUrl();

  return useQuery({
    queryKey: SUPPORTERS_QUERY,
    queryFn: () => fetchSupporters(fetch, url('api/supporters')),
  });
}

// What the screen shows: loading again after an error shows the spinner, while loading again after
// a gift keeps the list up until the new one is in, so it never blinks out.
export function phaseOf(query: ReturnType<typeof useSupporters>): Phase {
  if (query.data) {
    return query.data.supporters.length === 0 ? 'empty' : 'list';
  }

  return query.isError && !query.isFetching ? 'error' : 'loading';
}

// A gift from this device stops the home page asking for one, and puts the giver on the list.
export function useGiven() {
  const { preferences, now } = useArcade();
  const queryClient = useQueryClient();

  return () => {
    preferences.recordGift(now());
    queryClient.invalidateQueries({ queryKey: SUPPORTERS_QUERY });
  };
}
