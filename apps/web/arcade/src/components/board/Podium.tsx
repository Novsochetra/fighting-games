import type { BoardRow } from './BoardParts';
import { RunAvatar } from './RunAvatar';

// what shows across the first place when its run has no poster: the game's own painting
export interface BoardArt {
  src: string;
  isSmooth: boolean;
}

type OnPick = (row: BoardRow) => void;

const detailOf = (row: BoardRow) => [row.heroName, row.reachedLabel].filter(Boolean).join(' · ');

function Champion({ row, art, onPick }: { row: BoardRow; art: BoardArt; onPick: OnPick }) {
  const artClass = art.isSmooth
    ? 'board-place__poster is-art is-smooth'
    : 'board-place__poster is-art';

  return (
    <button className="board-place board-place--champion" type="button" onClick={() => onPick(row)}>
      <span className="board-place__media">
        <img
          className={row.poster ? 'board-place__poster' : artClass}
          src={row.poster?.previewSrc ?? art.src}
          alt=""
          width="640"
          height="336"
          decoding="async"
        />
      </span>
      <span className="board-place__info">
        <span className="board-place__medal" aria-hidden="true">
          {row.place}
        </span>
        <span className="board-place__who">
          <span className="board-place__name">{row.name}</span>
          <span className="board-place__detail">{detailOf(row)}</span>
        </span>
        <span className="board-place__score">{row.scoreLabel}</span>
      </span>
    </button>
  );
}

function RunnerUp({ row, onPick }: { row: BoardRow; onPick: OnPick }) {
  return (
    <button className="board-place board-place--runner" type="button" onClick={() => onPick(row)}>
      <RunAvatar row={row} medal />
      <span className="board-place__who">
        <span className="board-place__name">{row.name}</span>
        <span className="board-place__score">{row.scoreLabel}</span>
        <span className="board-place__detail">{row.heroName || row.reachedLabel}</span>
      </span>
    </button>
  );
}

// The first place stands across the board with its poster, second and third side by side under it;
// each opens its run.
export function Podium({ rows, art, onPick }: { rows: BoardRow[]; art: BoardArt; onPick: OnPick }) {
  return (
    <ol className="board-podium">
      {rows.map((row) => (
        <li className="board-podium__place" data-medal={row.medal} key={row.key}>
          {row.place === 1 ? (
            <Champion row={row} art={art} onPick={onPick} />
          ) : (
            <RunnerUp row={row} onPick={onPick} />
          )}
        </li>
      ))}
    </ol>
  );
}
