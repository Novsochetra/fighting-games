import { useMemo } from 'react';
import { Link } from 'react-router';
import { useArcade } from '@/services/arcade-context';
import { EVENTS } from '@/services/analytics/analytics-events.js';
import type { GameBoard, GameCard } from '@/api/catalog/game-card';
import type { BoardView } from '@/components/board/BoardParts';
import { boardRoute } from '@/navigation/routes/board-route.js';
import { useBoard } from '@/api/leaderboard/use-board';
import { boardView, PODIUM_SIZE } from '@/components/board/view-model.js';
import './peek.css';

interface PeekProps {
  card: GameCard | null;
  isOpen: boolean;
  // the sheet is taken down as the leaderboard is pushed over the arcade
  onLeave: () => void;
}

function useWeekTop(card: GameCard | null, isOpen: boolean) {
  const { locale } = useArcade();
  const query = useBoard(card?.id ?? '', Boolean(card?.board) && isOpen);
  const { data } = query;
  const view = useMemo(
    () =>
      data && card?.board
        ? (boardView(data.week.slice(0, PODIUM_SIZE), {
            board: card.board as GameBoard,
            locale,
          }) as BoardView)
        : null,
    [data, card, locale],
  );

  return { query, view };
}

function PeekBody({ view, failed }: { view: BoardView | null; failed: boolean }) {
  if (!view) {
    return <p className="board-peek__note">{failed ? 'The board did not load.' : 'Loading…'}</p>;
  }

  if (view.isEmpty) {
    return <p className="board-peek__note">No runs posted this week yet. Be the first!</p>;
  }

  return (
    <ol className="board-peek__list" id="details-board-list">
      {view.rows.map((row) => (
        <li className="board-peek__row" data-medal={row.medal} key={row.key}>
          <span className="board-peek__place">{row.place}</span>
          <span className="board-peek__name">{row.name}</span>
          <span className="board-peek__score">{row.scoreLabel}</span>
        </li>
      ))}
    </ol>
  );
}

// A game with an online board shows the week's top three in its Details sheet, the race to join
// before Play; the board is read only while the sheet is open
export function BoardPeek({ card, isOpen, onLeave }: PeekProps) {
  const { analytics } = useArcade();
  const { query, view } = useWeekTop(card, isOpen);

  if (!card?.board) {
    return null;
  }

  return (
    <section className="board-peek" id="details-board" aria-labelledby="details-board-title">
      <div className="board-peek__header">
        <h3 className="sheet__label" id="details-board-title">
          Top this week
        </h3>
        <Link
          className="board-peek__all"
          id="details-board-all"
          to={boardRoute(card.id)}
          onClick={() => {
            analytics.track(EVENTS.leaderboard, { placement: 'details' });
            onLeave();
          }}
        >
          See all
        </Link>
      </div>
      <PeekBody view={view} failed={query.isError && !query.isFetching} />
    </section>
  );
}
