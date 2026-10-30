import type { BoardRow } from '@/components/board/BoardParts';

interface FactProps {
  label: string;
  value: string;
  // a hero's name can run to three words, so it takes two tiles' width
  isWide?: boolean;
}

function Fact({ label, value, isWide = false }: FactProps) {
  return value ? (
    <div className={isWide ? 'run-facts__fact run-facts__fact--wide' : 'run-facts__fact'}>
      <dt className="run-facts__label">{label}</dt>
      <dd className="run-facts__value">{value}</dd>
    </div>
  ) : null;
}

// What the run did, in tiles: what the board's rows have no room for too.
export function RunFacts({ row }: { row: BoardRow }) {
  return (
    <dl className="run-facts" id="run-facts">
      <Fact label="Score" value={row.scoreLabel} />
      <Fact label="Reached" value={row.reachedLabel} />
      <Fact label="Time" value={row.timeLabel} />
      <Fact label="Hero" value={row.heroName} isWide />
      <Fact label="Difficulty" value={row.difficultyName} />
    </dl>
  );
}
