import { SaveIcon, TrashIcon } from './home-icons';
import type { GameCard } from './game-card';
import { saveName, saveTip } from './offline-save.js';
import { useSaveStatus, type SaveStatus } from './use-save-status';

// the share saved, as a ring drawn around the button, filling clockwise from the top
function ProgressRing({ percent }: { percent: number }) {
  return (
    <svg className="save-button__ring" aria-hidden="true">
      <circle className="save-button__ring-track" cx="50%" cy="50%" r="50%" />
      <circle
        className="save-button__ring-value"
        cx="50%"
        cy="50%"
        r="50%"
        pathLength={100}
        style={{ strokeDashoffset: 100 - percent }}
      />
    </svg>
  );
}

// the button's name says all of it aloud, so the tooltip is only for the eye
function Tip({ status }: { status: SaveStatus }) {
  return (
    <span className="save-tip" aria-hidden="true">
      {saveTip(status)}
    </span>
  );
}

interface SaveButtonProps {
  card: GameCard;
  id: string;
  place: 'card' | 'tile';
}

// A small round button floating on a card's corner that keeps a game for offline, and once saved
// shows a trash can and asks before removing it, with a tooltip on hover or keyboard focus that says
// what a tap does. The ring
// and the tooltip are drawn inside it, so a fade of the button takes them along. It stays focusable
// while it saves (aria-disabled, not disabled), so a keyboard's focus is not lost, and shows nothing
// where the game cannot be saved.
export function SaveButton({ card, id, place }: SaveButtonProps) {
  const { status, tap } = useSaveStatus(card);

  if (!status) {
    return null;
  }

  return (
    <button
      className={`glass-button save-button save-button--${place} is-${status.state}`}
      id={id}
      type="button"
      aria-label={saveName(status, card.title)}
      aria-disabled={status.state === 'saving' || undefined}
      onClick={tap}
    >
      {status.state === 'saved' ? <TrashIcon /> : <SaveIcon />}
      {status.state === 'saving' && <ProgressRing percent={status.percent} />}
      <Tip status={status} />
    </button>
  );
}
