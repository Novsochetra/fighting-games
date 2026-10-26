import { useEffect, useRef, type RefObject } from 'react';
import { createSheet } from '../home/sheet.js';
import { useArcade } from './arcade-context';

interface SheetParts {
  dialog: RefObject<HTMLDialogElement | null>;
  closeButton: RefObject<HTMLButtonElement | null>;
}

// A sheet (sheet.js) shows while isOpen holds. Escape, a tap on the dimmed page and its close button
// close it with its animation, then onClosed says so; a screen that goes away takes its sheet down
// at once, so the page under it does not stay held still.
export function useSheet(
  { dialog, closeButton }: SheetParts,
  isOpen: boolean,
  onClosed: () => void,
) {
  const { window, sound } = useArcade();
  const sheet = useRef<ReturnType<typeof createSheet> | null>(null);
  const closed = useRef(onClosed);

  useEffect(() => {
    closed.current = onClosed;
  });

  useEffect(() => {
    const lifetime = new AbortController();
    const { signal } = lifetime;
    const parts = { dialog: dialog.current!, closeButton: closeButton.current! };
    const made = createSheet({ ...parts, document: window.document, sound, signal });

    // a close fires a task later, by when React's development checks may have opened it again
    const onClose = () => !parts.dialog.open && closed.current();

    parts.dialog.addEventListener('close', onClose, { signal });
    sheet.current = made;

    return () => {
      lifetime.abort();
      made.finish();
    };
  }, [dialog, closeButton, window, sound]);

  useEffect(() => {
    if (isOpen) {
      sheet.current?.open();
    } else {
      sheet.current?.close();
    }
  }, [isOpen]);

  // takes the sheet down at once, without its animation, for a link that leaves the screen
  return { finish: () => sheet.current?.finish() };
}
