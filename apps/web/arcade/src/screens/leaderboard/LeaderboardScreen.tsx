import { useState, type ReactNode } from 'react';
import { useArcade } from '@/services/arcade-context';
import { TrophyIcon } from '@/components/icons';
import { Notice } from '@/components/notice/Notice';
import { PageBar } from '@/components/page-bar/PageBar';
import { Segmented } from '@/components/segmented/Segmented';
import { useArriveDrawn } from '@/navigation/stack/use-arrive-drawn';
import { useCatalog } from '@/api/catalog/use-catalog';
import { GameBoard } from './GameBoard';
import { GamePicker } from './GamePicker';
import type { Period } from '@/api/leaderboard/use-board';
import { usePickedGame } from './use-picked-game';
import '@/components/board/board.css';
import './leaderboard.css';

export const LOADING_MESSAGE = 'Loading the games…';
export const ERROR_MESSAGE = 'The games did not load. Check your connection and try again.';

const PERIODS = [
  { value: 'week', label: 'This week' },
  { value: 'all', label: 'All time' },
] as const;

// The places and rows that rise in as a board comes in (board.css).
export const LEADERBOARD_ENTRANCES = ['board-rise'];

interface HeroProps {
  period: Period;
  onPeriod: (next: Period) => void;
  // the row that picks the game, over the period
  children: ReactNode;
}

function LeaderboardHero({ period, onPeriod, children }: HeroProps) {
  return (
    <section className="leaderboard-hero" aria-labelledby="leaderboard-title">
      <span className="trophy-badge" aria-hidden="true">
        <TrophyIcon />
      </span>
      <h1 className="leaderboard-hero__title" id="leaderboard-title">
        Leaderboard
      </h1>
      <p className="leaderboard-hero__lead">
        The best runs posted from the games. Finish a run, post your name and climb the board. A new
        week starts every Monday.
      </p>
      {children}
      <Segmented
        id="board-period"
        label="Which board"
        options={PERIODS}
        value={period}
        onChange={onPeriod}
      />
    </section>
  );
}

// A game's online board, this week's or every run's, like a leaderboard in Game Center; with more
// than one game, a row of them picks whose board shows.
export function LeaderboardScreen() {
  const { sound } = useArcade();
  const [period, setPeriod] = useState<Period>('week');
  const { query, cards, phase } = useCatalog();
  const screen = useArriveDrawn<HTMLDivElement>(LEADERBOARD_ENTRANCES);
  const games = cards.filter((card) => card.board);
  const { game, pick } = usePickedGame(games);
  const waiting = phase === 'loading' || phase === 'error';

  return (
    <div className="leaderboard-page" ref={screen}>
      <PageBar title="Leaderboard" titleId="leaderboard-bar-title" />
      <main className="leaderboard">
        <LeaderboardHero
          period={period}
          onPeriod={(next) => {
            setPeriod(next);
            sound.play('switch');
          }}
        >
          <GamePicker games={games} picked={game?.id ?? null} onPick={pick} />
        </LeaderboardHero>
        <Notice
          idPrefix="leaderboard"
          tone={phase === 'error' ? 'error' : 'loading'}
          message={phase === 'error' ? ERROR_MESSAGE : LOADING_MESSAGE}
          hidden={!waiting}
          onRetry={() => query.refetch()}
        />
        {game ? <GameBoard key={game.id} game={game} period={period} /> : null}
      </main>
    </div>
  );
}
