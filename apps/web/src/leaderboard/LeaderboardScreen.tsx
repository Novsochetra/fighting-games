import { useState } from 'react';
import { useArcade } from '../arcade/arcade-context';
import { TrophyIcon } from '../arcade/icons';
import { Notice } from '../arcade/Notice';
import { PageBar } from '../arcade/PageBar';
import { Segmented } from '../arcade/Segmented';
import { useArriveDrawn } from '../arcade/use-arrive-drawn';
import { useCatalog } from '../home/use-catalog';
import { GameBoard } from './GameBoard';
import type { Period } from './use-board';
import './board.css';
import './leaderboard.css';

export const LOADING_MESSAGE = 'Loading the games…';
export const ERROR_MESSAGE = 'The games did not load. Check your connection and try again.';

const PERIODS = [
  { value: 'week', label: 'This week' },
  { value: 'all', label: 'All time' },
] as const;

// The places and rows that rise in as a board comes in (board.css).
export const LEADERBOARD_ENTRANCES = ['board-rise'];

function LeaderboardHero({
  period,
  onPeriod,
}: {
  period: Period;
  onPeriod: (next: Period) => void;
}) {
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

// Every game with an online board, this week's or every run's, like a leaderboard in Game Center.
export function LeaderboardScreen() {
  const { sound } = useArcade();
  const [period, setPeriod] = useState<Period>('week');
  const { query, cards, phase } = useCatalog();
  const screen = useArriveDrawn<HTMLDivElement>(LEADERBOARD_ENTRANCES);
  const games = cards.filter((card) => card.board);
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
        />
        <Notice
          idPrefix="leaderboard"
          tone={phase === 'error' ? 'error' : 'loading'}
          message={phase === 'error' ? ERROR_MESSAGE : LOADING_MESSAGE}
          hidden={!waiting}
          onRetry={() => query.refetch()}
        />
        {games.map((game) => (
          <GameBoard key={game.id} game={game} period={period} />
        ))}
      </main>
    </div>
  );
}
