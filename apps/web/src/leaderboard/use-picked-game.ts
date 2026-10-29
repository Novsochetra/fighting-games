import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { useArcade } from '../arcade/arcade-context';
import { EVENTS } from '../home/analytics-events.js';
import type { GameCard } from '../home/game-card';
import { pickedGame } from './board-route.js';

// The game is read from the address as the screen comes in and kept from then on: as Back slides
// the screen away the address is the arcade's, and the board would change under the slide. A pick
// rewrites the address in place, so it can be shared and Back still leads to the arcade.
export function usePickedGame(games: GameCard[]) {
  const { sound, analytics } = useArcade();
  const [params, setParams] = useSearchParams();
  const [asked, setAsked] = useState(() => params.get('game'));
  const game = pickedGame(games, asked) as GameCard | null;

  function pick(gameId: string) {
    setAsked(gameId);
    setParams({ game: gameId }, { replace: true });
    sound.play('switch');
    analytics.track(EVENTS.leaderboardGame, { game_id: gameId });
  }

  return { game, pick };
}
