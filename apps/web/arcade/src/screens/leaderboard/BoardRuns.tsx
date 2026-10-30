import { useArcadeUrl } from '@/services/arcade-context';
import type { GameCard } from '@/api/catalog/game-card';
import type { Period } from '@/api/leaderboard/use-board';
import { BoardList, type BoardView } from '@/components/board/BoardParts';
import { Podium } from '@/components/board/Podium';
import { PODIUM_SIZE } from '@/components/board/view-model.js';
import { RunSheet } from './run-sheet/RunSheet';
import { useRunSheet } from './run-sheet/use-run-sheet';

const PERIOD_LABELS: Record<Period, string> = { week: 'this week', all: 'all time' };

interface BoardRunsProps {
  game: GameCard;
  view: BoardView;
  period: Period;
}

// The podium and the rest of a board, each run opening in a sheet with its poster.
export function BoardRuns({ game, view, period }: BoardRunsProps) {
  const url = useArcadeUrl();
  const sheet = useRunSheet();
  const art = { src: url(game.bannerSrc), isSmooth: Boolean(game.smoothArt) };

  return (
    <>
      <Podium rows={view.podium} art={art} onPick={sheet.open} />
      <BoardList rows={view.rows.slice(PODIUM_SIZE)} onPick={sheet.open} />
      <RunSheet
        row={sheet.row}
        isOpen={sheet.isOpen}
        periodLabel={PERIOD_LABELS[period]}
        onClose={sheet.close}
      />
    </>
  );
}
