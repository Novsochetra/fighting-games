import { useMemo } from 'react';
import { useArcade, useArcadeUrl } from '@/services/arcade-context';
import { Notice } from '@/components/notice/Notice';
import type { GameBoard as Rules, GameCard } from '@/api/catalog/game-card';
import { BoardList, Podium, type BoardView } from '@/components/board/BoardParts';
import { useBoard, type Period } from '@/api/leaderboard/use-board';
import { boardView, PODIUM_SIZE, runsOf } from '@/components/board/view-model.js';
import { PosterSheet } from './poster/PosterSheet';
import { usePosterSheet } from './poster/use-poster-sheet';

export const BOARD_LOADING = 'Loading the board…';
export const BOARD_ERROR = 'The board did not load. Check your connection and try again.';

const EMPTY_TITLES: Record<Period, string> = {
  week: 'No runs posted this week yet',
  all: 'No runs posted yet',
};

function EmptyBoard({ game, period }: { game: GameCard; period: Period }) {
  const url = useArcadeUrl();

  return (
    <div className="board-empty">
      <h3 className="board-empty__title">{EMPTY_TITLES[period]}</h3>
      <p className="board-empty__body">
        Finish a run of {game.title}, post your name, and take first place.
      </p>
      <a className="pill-button pill-button--primary" href={url(game.href)}>
        Play {game.title}
      </a>
    </div>
  );
}

function useBoardView(game: GameCard, period: Period) {
  const { locale } = useArcade();
  const query = useBoard(game.id);
  const { data } = query;
  const view = useMemo(
    () =>
      data
        ? (boardView(runsOf(data, period), { board: game.board as Rules, locale }) as BoardView)
        : null,
    [data, period, game.board, locale],
  );

  return { query, view };
}

// One game's board: its icon and name with a way to play it, then its podium and the rest, each
// run's poster opening whole in a sheet
export function GameBoard({ game, period }: { game: GameCard; period: Period }) {
  const url = useArcadeUrl();
  const { query, view } = useBoardView(game, period);
  const poster = usePosterSheet();
  const failed = query.isError && !query.isFetching;
  const titleId = `board-${game.id}-title`;

  return (
    <section className="game-board" aria-labelledby={titleId} data-game={game.id}>
      <header className="game-board__header">
        <img className="game-board__icon" src={url(game.coverSrc)} alt="" width="44" height="44" />
        <h2 className="game-board__title" id={titleId}>
          {game.title}
        </h2>
        <a className="pill-button pill-button--surface game-board__play" href={url(game.href)}>
          Play
        </a>
      </header>
      <Notice
        idPrefix={`board-${game.id}`}
        tone={failed ? 'error' : 'loading'}
        message={failed ? BOARD_ERROR : BOARD_LOADING}
        hidden={view !== null}
        onRetry={() => query.refetch()}
      />
      {view?.isEmpty ? <EmptyBoard game={game} period={period} /> : null}
      {view && !view.isEmpty ? (
        <>
          <Podium rows={view.podium} onPoster={poster.open} />
          <BoardList rows={view.rows.slice(PODIUM_SIZE)} onPoster={poster.open} />
        </>
      ) : null}
      <PosterSheet row={poster.row} isOpen={poster.isOpen} onClose={poster.close} />
    </section>
  );
}
