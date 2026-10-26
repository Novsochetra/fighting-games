import { useRef } from 'react';
import { Link } from 'react-router';
import { useArcade } from '../arcade/arcade-context';
import { SheetClose } from '../arcade/SheetClose';
import { useSheet } from '../arcade/use-sheet';
import { EVENTS } from './analytics-events.js';
import { CoffeeIcon } from './home-icons';

const COFFEE_URL = 'https://buymeacoffee.com/sochetranov';

const KhqrIcon = () => (
  <svg className="icon icon--bold" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4.5 4.5h5v5h-5zM14.5 4.5h5v5h-5zM4.5 14.5h5v5h-5z" />
    <path
      className="icon__fill"
      d="M14 14h2.5v2.5H14zM17.5 17.5H20V20h-2.5zM14 17.5h2.5V20H14zM17.5 14H20v2.5h-2.5z"
    />
  </svg>
);

// KHQR leaves for the supporters screen, so the sheet is gone when the arcade comes back; a card
// opens in a new tab, so the sheet steps aside behind it.
function Choices({ onKhqr, onCard }: { onKhqr: () => void; onCard: () => void }) {
  const { analytics } = useArcade();

  return (
    <div className="coffee__choices">
      <Link
        className="pill-button pill-button--primary coffee__choice"
        id="coffee-khqr"
        to="/supporters/#give"
        onClick={() => {
          onKhqr();
          analytics.track(EVENTS.supporters, { placement: 'coffee_sheet' });
        }}
      >
        <KhqrIcon />
        Pay with KHQR
      </Link>
      <a
        className="pill-button pill-button--coffee coffee__choice"
        id="coffee-bmc"
        href={COFFEE_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          onCard();
          analytics.track(EVENTS.buyMeACoffee, {});
        }}
      >
        <CoffeeIcon />
        Buy me a coffee
      </a>
    </div>
  );
}

interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CoffeeSheet({ isOpen, onClose }: SheetProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const sheet = useSheet({ dialog: dialogRef, closeButton: closeRef }, isOpen, onClose);

  return (
    <dialog
      className="sheet coffee-sheet"
      id="coffee-sheet"
      aria-labelledby="coffee-title"
      tabIndex={-1}
      ref={dialogRef}
    >
      <SheetClose id="coffee-close" closeRef={closeRef} />
      <div className="sheet__body coffee">
        <span className="coffee__badge" aria-hidden="true">
          <CoffeeIcon hidden={false} />
        </span>
        <h2 className="sheet__title" id="coffee-title">
          Buy me a coffee
        </h2>
        <p className="sheet__description">
          Every game here is free. Pick how you would like to chip in.
        </p>
        <Choices
          onKhqr={() => {
            sheet.finish();
            onClose();
          }}
          onCard={onClose}
        />
        <p className="coffee__hint">
          KHQR works with any Cambodian bank app and puts your name on the supporters list. Buy Me a
          Coffee takes a card from anywhere.
        </p>
      </div>
    </dialog>
  );
}
