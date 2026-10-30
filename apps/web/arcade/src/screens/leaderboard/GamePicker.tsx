import { useArcadeUrl } from '@/services/arcade-context';
import type { GameCard } from '@/api/catalog/game-card';

interface PickerProps {
  games: GameCard[];
  picked: string | null;
  onPick: (gameId: string) => void;
}

// One board shows at a time, the game's own, picked from a row of its games like the App Store's
// categories; a phone scrolls the row. With one game there is nothing to pick, so it waits until a
// second game has a board.
export function GamePicker({ games, picked, onPick }: PickerProps) {
  const url = useArcadeUrl();

  if (games.length < 2) {
    return null;
  }

  return (
    <div className="game-picker" id="board-games" role="group" aria-label="Which game">
      {games.map((game) => (
        <button
          className="game-picker__game"
          type="button"
          key={game.id}
          data-game={game.id}
          aria-pressed={game.id === picked}
          onClick={() => game.id !== picked && onPick(game.id)}
        >
          <img
            className={game.smoothArt ? 'game-picker__icon is-smooth' : 'game-picker__icon'}
            src={url(game.coverSrc)}
            alt=""
            width="28"
            height="28"
          />
          {game.title}
        </button>
      ))}
    </div>
  );
}
