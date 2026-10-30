import { useQuery } from '@tanstack/react-query';
import { useArcade, useArcadeUrl } from '@/services/arcade-context';
import { boardPath, fetchBoard } from './leaderboard-client.js';

export type Period = 'week' | 'all';

export interface Run {
  name: string;
  score: number;
  mission: number;
  hero: string;
  difficulty: number;
  seconds: number;
  cleared: boolean;
  date: string;
}

export interface BoardData {
  weekStart: string;
  week: Run[];
  allTime: Run[];
}

// The server reads the board once for every reader for a while (board-cache.js), so asking each time
// a screen shows it costs nothing; the Details sheet asks only while it is open.
export function useBoard(gameId: string, enabled = true) {
  const { fetch } = useArcade();
  const url = useArcadeUrl();

  return useQuery({
    queryKey: ['leaderboard', gameId],
    queryFn: (): Promise<BoardData> => fetchBoard(fetch, url(boardPath(gameId))),
    enabled,
  });
}
