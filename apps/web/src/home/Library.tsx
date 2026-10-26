import { useLayoutEffect, useRef, type CSSProperties, type Ref, type RefObject } from 'react';
import { Segmented } from '../arcade/Segmented';
import type { GameCard } from './game-card';
import { GameArt } from './GameArt';
import { useHome } from './home-context';
import { LibraryFooter } from './LibraryFooter';
import { OfflineTag } from './OfflineTag';
import { SaveButton } from './SaveButton';
import type { Filter } from './use-library';

const FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'recent', label: 'Recent' },
  { value: 'favorites', label: 'Favorites' },
] as const;

interface TileProps {
  card: GameCard;
  index: number;
  order: number;
  isSelected: boolean;
}

// A tile's save button sits on its art's corner, beside the tile's own button rather than in it,
// since a button cannot hold another; both rise in on the tile's turn.
function Tile({ card, index, order, isSelected }: TileProps) {
  const home = useHome();

  return (
    <li className="library__slot" style={{ '--order': order } as CSSProperties}>
      <button
        className={`tile${isSelected ? ' is-selected' : ''}`}
        type="button"
        data-game-index={index}
        aria-current={isSelected || undefined}
        onClick={() => home.pickTile(index)}
      >
        <span className="tile__media">
          <span className="tile__ring" aria-hidden="true" />
          <span className="tile__frame">
            <GameArt card={card} loading="lazy" />
            <OfflineTag card={card} />
          </span>
        </span>
        <span className="tile__text">
          <span className="tile__title">{card.title}</span>
          <span className="tile__genre">{card.genre}</span>
        </span>
      </button>
      <SaveButton card={card} id={`tile-save-${card.id}`} place="tile" />
    </li>
  );
}

function Header() {
  const { library } = useHome();

  return (
    <header className="library__header">
      <div className="library__heading">
        <h2 className="library__title" id="library-title">
          {library.page.title}
        </h2>
        <p className="library__count" id="library-count">
          {library.page.label}
        </p>
      </div>
      <Segmented<Filter>
        id="filters"
        label="Filter games"
        options={FILTER_OPTIONS}
        value={library.filter}
        onChange={library.setFilter}
      />
    </header>
  );
}

function More() {
  const { library } = useHome();

  return (
    <div className="library__more">
      <button
        className="pill-button pill-button--surface"
        id="show-more"
        type="button"
        hidden={!library.page.canShowMore}
        onClick={library.showMore}
      >
        Show more games
      </button>
      <p className="library__end" id="library-end" hidden={!library.page.isAtEnd}>
        You have seen every game
      </p>
    </div>
  );
}

// The keys move the focus along the tiles with the selection, as they do along the cards.
function useTileFocus(grid: RefObject<HTMLElement | null>) {
  const { selection } = useHome();

  useLayoutEffect(() => {
    if (selection?.focus === 'library') {
      grid.current
        ?.querySelector<HTMLElement>(`.tile[data-game-index="${selection.index}"]`)
        ?.focus({ preventScroll: false });
    }
  }, [selection, grid]);
}

export function Library({ libraryRef }: { libraryRef: Ref<HTMLElement> }) {
  const { library, selected, phase } = useHome();
  const { entries, emptyMessage } = library.page;
  const grid = useRef<HTMLUListElement>(null);

  useTileFocus(grid);

  return (
    <section
      className="library"
      id="library"
      aria-labelledby="library-title"
      hidden={phase !== 'games'}
      ref={libraryRef}
    >
      <Header />
      <ul className="library__grid" id="library-grid" aria-labelledby="library-title" ref={grid}>
        {entries.map(({ card, index }: { card: GameCard; index: number }, order: number) => (
          <Tile
            key={card.id}
            card={card}
            index={index}
            order={order}
            isSelected={index === selected}
          />
        ))}
      </ul>
      <p className="library__empty" id="library-empty" hidden={emptyMessage === ''}>
        {emptyMessage}
      </p>
      <More />
      <LibraryFooter />
    </section>
  );
}
