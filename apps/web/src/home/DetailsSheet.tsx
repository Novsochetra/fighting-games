import { useArcadeUrl } from '../arcade/arcade-context';
import { SheetClose } from '../arcade/SheetClose';
import type { GameCard } from './game-card';
import { useHome } from './home-context';
import { PlayIcon } from './home-icons';
import { isPlainClick } from './input-actions.js';
import { OfflineTag } from './OfflineTag';
import { SaveOffline } from './SaveOffline';
import type { Details } from './use-details';
import { useSaveStatus } from './use-save-status';

function Media({ card }: { card: GameCard | null }) {
  const url = useArcadeUrl();
  const art = card?.artSrc ?? '';

  return (
    <div className="sheet__media" hidden={art === ''}>
      <img
        className={card?.smoothArt ? 'sheet__art is-smooth' : 'sheet__art'}
        id="details-art"
        src={art ? url(art) : undefined}
        alt=""
      />
      <OfflineTag card={card} />
    </div>
  );
}

function Controls({ controls }: { controls: string[] }) {
  const none = controls.length === 0;

  return (
    <>
      <h3 className="sheet__label" id="details-controls-label" hidden={none}>
        Controls
      </h3>
      <ul
        className="sheet__chips"
        id="details-controls"
        aria-labelledby="details-controls-label"
        hidden={none}
      >
        {controls.map((control) => (
          <li className="sheet__chip" key={control}>
            {control}
          </li>
        ))}
      </ul>
    </>
  );
}

function PlayLink({ card, onPlay }: { card: GameCard | null; onPlay: () => void }) {
  const url = useArcadeUrl();

  return (
    <a
      className="pill-button pill-button--primary sheet__play"
      id="details-play"
      href={card ? url(card.href) : undefined}
      aria-label={card ? `Play ${card.title}` : undefined}
      onClick={(event) => {
        if (isPlainClick(event)) {
          event.preventDefault();
          onPlay();
        }
      }}
    >
      <PlayIcon />
      Play
    </a>
  );
}

function Story({ card }: { card: GameCard | null }) {
  return (
    <>
      <h2 className="sheet__title" id="details-title">
        {card?.title}
      </h2>
      <p className="sheet__meta" id="details-meta">
        {card?.meta}
      </p>
      <p className="sheet__description" id="details-description">
        {card?.description}
      </p>
    </>
  );
}

export function DetailsSheet({ details }: { details: Details }) {
  const home = useHome();
  const { card, dialogRef, closeRef, finish } = details;
  const save = useSaveStatus(card, details.isOpen);
  // a saved game's pill asks before removing it, in a sheet of its own
  const tapSave = () => {
    if (save.status?.state === 'saved') {
      finish();
    }

    save.tap();
  };
  const play = () => {
    finish();
    home.open(home.selected, 'details');
  };

  return (
    <dialog
      className="sheet"
      id="details"
      aria-labelledby="details-title"
      tabIndex={-1}
      ref={dialogRef}
    >
      <Media card={card} />
      <SheetClose id="details-close" closeRef={closeRef} />
      <div className="sheet__body">
        <Story card={card} />
        <Controls controls={card?.controls ?? []} />
        <div className="sheet__actions">
          <PlayLink card={card} onPlay={play} />
          <SaveOffline status={save.status} onTap={tapSave} />
        </div>
      </div>
    </dialog>
  );
}
