import type { Ref } from 'react';
import { CloseIcon } from './icons';

export function SheetClose({ id, closeRef }: { id: string; closeRef: Ref<HTMLButtonElement> }) {
  return (
    <button
      className="glass-button sheet__close"
      id={id}
      type="button"
      aria-label="Close"
      ref={closeRef}
    >
      <CloseIcon />
    </button>
  );
}
