import type { CSSProperties } from 'react';
import { RunAvatar } from './RunAvatar';

// A run's poster as view-model.js presents it.
export interface PosterImage {
  previewSrc: string;
  srcSet: string;
}

// A run as view-model.js puts it together.
export interface BoardRow {
  key: string;
  place: number;
  medal: string;
  name: string;
  heroName: string;
  scoreLabel: string;
  reachedLabel: string;
  difficultyName: string;
  timeLabel: string;
  dateLabel: string;
  poster: PosterImage | null;
  avatarSrc: string | null;
  initials: string;
  palette: number;
}

export interface BoardView {
  isEmpty: boolean;
  podium: BoardRow[];
  rows: BoardRow[];
}

// The rows rise in one after another, but never wait longer than this many steps.
const MAX_STAGGER = 8;

const detailOf = (row: BoardRow) => [row.heroName, row.reachedLabel].filter(Boolean).join(' · ');

// An inset grouped list, as in iOS Settings, each row opening its run.
export function BoardList({ rows, onPick }: { rows: BoardRow[]; onPick: (row: BoardRow) => void }) {
  if (rows.length === 0) {
    return null;
  }

  return (
    <ol className="board-list" start={rows[0]?.place}>
      {rows.map((row, i) => (
        <li
          className="board-list__row"
          key={row.key}
          style={{ '--order': Math.min(i, MAX_STAGGER) } as CSSProperties}
        >
          <button className="board-list__open" type="button" onClick={() => onPick(row)}>
            <RunAvatar row={row} />
            <span className="board-list__text">
              <span className="board-list__name">{row.name}</span>
              <span className="board-list__detail">{detailOf(row)}</span>
            </span>
            <span className="board-list__end">
              <span className="board-list__score">{row.scoreLabel}</span>
              <span className="board-list__date">{row.dateLabel}</span>
            </span>
          </button>
        </li>
      ))}
    </ol>
  );
}
