import { useState } from 'react';
import { useArcade, useArcadeUrl } from '@/services/arcade-context';
import { EVENTS } from '@/services/analytics/analytics-events.js';
import { CoffeeSheet } from './CoffeeSheet';
import { CoffeeIcon, DismissIcon } from '@/screens/home/home-icons';
import { useCoffeeNote } from './use-coffee-note';

interface NoteProps {
  note: ReturnType<typeof useCoffeeNote>;
  onOpen: () => void;
}

function CoffeeNote({ note, onOpen }: NoteProps) {
  const url = useArcadeUrl();

  return (
    <aside
      className={`coffee-note${note.hiding ? ' is-hiding' : ''}`}
      id="coffee-note"
      aria-label="A note from Nov Sochetra"
      hidden={note.hidden}
    >
      <button className="coffee-note__open" id="coffee-note-open" type="button" onClick={onOpen}>
        <span className="coffee-note__from">
          <img
            className="coffee-note__avatar"
            src={url('assets/credits/portrait-small.jpg')}
            width="96"
            height="96"
            alt=""
          />
          Nov Sochetra
        </span>
        <span className="coffee-note__message" lang="km">
          អរគុណសំរាប់ការគ្រាទ្រ 🙏 នឹងស្រលាញ់ហ្គេម ១ នេះ ។
          ការគាំទ្ររបស់អ្នកពិតជាផ្ដល់កំលាំងចិត្តដល់ខ្ញុំក្នុងការបន្ដរកគំនិត ដើម្បី
          បង្កើតហ្គេមផ្សេងៗទៀត 🫶។
        </span>
      </button>
      <button
        className="coffee-note__close"
        id="coffee-note-close"
        type="button"
        aria-label="Close"
        onClick={note.hide}
      >
        <DismissIcon />
      </button>
    </aside>
  );
}

// The coffee button floats over the arcade like Buy Me a Coffee's own widget, but opens the arcade's
// sheet with both ways to give: KHQR on the supporters screen, or a card on Buy Me a Coffee.
export function Coffee() {
  const { analytics } = useArcade();
  const note = useCoffeeNote();
  const [isOpen, setOpen] = useState(false);
  const open = (placement: 'button' | 'note') => () => {
    note.hide();
    setOpen(true);
    analytics.track(EVENTS.coffee, { placement });
  };

  return (
    <>
      <button
        className="coffee-fab"
        id="coffee-open"
        type="button"
        aria-label="Buy me a coffee"
        aria-haspopup="dialog"
        onClick={open('button')}
      >
        <CoffeeIcon />
      </button>
      <CoffeeNote note={note} onOpen={open('note')} />
      <CoffeeSheet isOpen={isOpen} onClose={() => setOpen(false)} />
    </>
  );
}
