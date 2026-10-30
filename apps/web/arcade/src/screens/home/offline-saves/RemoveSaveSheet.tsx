import type { RefObject } from 'react';
import { useHome } from '@/screens/home/home-context';

function Answers({
  onRemove,
  cancelRef,
}: {
  onRemove: () => void;
  cancelRef: RefObject<HTMLButtonElement | null>;
}) {
  return (
    <div className="sheet__actions">
      <button
        className="pill-button pill-button--destructive"
        id="remove-save-confirm"
        type="button"
        onClick={onRemove}
      >
        Remove
      </button>
      <button
        className="pill-button pill-button--surface"
        id="remove-save-cancel"
        type="button"
        ref={cancelRef}
      >
        Cancel
      </button>
    </div>
  );
}

// Asks before a saved game is removed, since saving it again costs the player's data.
export function RemoveSaveSheet() {
  const { removal, saves } = useHome();
  const { card, dialogRef, cancelRef } = removal;
  const remove = () => {
    if (card) {
      saves.remove(card.id);
    }

    removal.finish();
  };

  return (
    <dialog
      className="sheet sheet--confirm"
      id="remove-save"
      aria-labelledby="remove-save-title"
      aria-describedby="remove-save-text"
      tabIndex={-1}
      ref={dialogRef}
    >
      <div className="sheet__body">
        <h2 className="sheet__title" id="remove-save-title">
          Remove offline copy?
        </h2>
        <p className="sheet__description" id="remove-save-text">
          {card?.title} will need the internet to play again. You can save it again any time.
        </p>
        <Answers onRemove={remove} cancelRef={cancelRef} />
      </div>
    </dialog>
  );
}
