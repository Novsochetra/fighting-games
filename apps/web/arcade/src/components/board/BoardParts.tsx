import type { CSSProperties } from 'react';
import { PosterButton, type PosterImage } from './PosterButton';

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
}

export interface BoardView {
  isEmpty: boolean;
  podium: BoardRow[];
  rows: BoardRow[];
}

// The rows rise in one after another, but never wait longer than this many steps.
const MAX_STAGGER = 8;
// how wide a poster shows on the podium (a third of the board) and in a row (board.css)
const PODIUM_POSTER_SIZES = '(min-width: 50rem) 14rem, 30vw';
const ROW_POSTER_SIZES = '4.5rem';

type OnPoster = (row: BoardRow) => void;

const detailOf = (row: BoardRow) =>
  [row.heroName, row.reachedLabel, row.difficultyName].filter(Boolean).join(' · ');

// The top three stand like a podium: second, first (raised), third.
export function Podium({ rows, onPoster }: { rows: BoardRow[]; onPoster: OnPoster }) {
  return (
    <ol className="board-podium">
      {rows.map((row) => (
        <li className="board-podium__place" data-medal={row.medal} key={row.key}>
          {row.poster ? (
            <PosterButton
              poster={row.poster}
              name={row.name}
              sizes={PODIUM_POSTER_SIZES}
              onOpen={() => onPoster(row)}
            />
          ) : null}
          <span className="board-podium__medal">{row.place}</span>
          <span className="board-podium__name">{row.name}</span>
          <span className="board-podium__score">{row.scoreLabel}</span>
          <span className="board-podium__detail">{row.heroName}</span>
          <span className="board-podium__detail">{row.reachedLabel}</span>
        </li>
      ))}
    </ol>
  );
}

export function BoardList({ rows, onPoster }: { rows: BoardRow[]; onPoster: OnPoster }) {
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
          <span className="board-list__place" aria-hidden="true">
            {row.place}
          </span>
          {row.poster ? (
            <PosterButton
              poster={row.poster}
              name={row.name}
              sizes={ROW_POSTER_SIZES}
              onOpen={() => onPoster(row)}
            />
          ) : null}
          <span className="board-list__text">
            <span className="board-list__name">{row.name}</span>
            <span className="board-list__detail">{detailOf(row)}</span>
          </span>
          <span className="board-list__end">
            <span className="board-list__score">{row.scoreLabel}</span>
            <span className="board-list__date">{row.dateLabel}</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
