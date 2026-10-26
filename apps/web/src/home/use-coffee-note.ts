import { useEffect, useLayoutEffect, useState } from 'react';
import { useArcade } from '../arcade/arcade-context';
import { placeCoffeeNote } from './coffee-note-spot.js';
import { prefersReducedMotion, readDuration } from './motion-tokens.js';

// The note waits for the button to pop in, says thank you for a while, then steps back into it.
export const COFFEE_NOTE_DELAY_MS = 2400;
export const COFFEE_NOTE_MS = 9000;

type NotePhase = 'waiting' | 'shown' | 'hiding' | 'gone';

const fadeOf = (window: Window) =>
  prefersReducedMotion(window) ? 0 : readDuration(window.document, '--duration-fade');

function placeNote(document: Document) {
  placeCoffeeNote({
    note: document.getElementById('coffee-note'),
    button: document.getElementById('coffee-open'),
    actions: document.querySelector('.spotlight__actions'),
    document,
  });
}

// Its exit runs on a timer the length of its token, as the sheets' does, since a browser may never
// send animationend for a hidden page.
function useNoteTimers(phase: NotePhase, setPhase: (phase: NotePhase) => void) {
  const { window } = useArcade();

  useEffect(() => {
    const steps = {
      waiting: [COFFEE_NOTE_DELAY_MS, 'shown'],
      shown: [COFFEE_NOTE_MS, fadeOf(window) > 0 ? 'hiding' : 'gone'],
      hiding: [fadeOf(window), 'gone'],
    } as const;

    if (phase === 'gone') {
      return undefined;
    }

    const [wait, next] = steps[phase];
    const later = setTimeout(() => setPhase(next), wait);

    return () => clearTimeout(later);
  }, [phase, setPhase, window]);
}

export function useCoffeeNote() {
  const { window } = useArcade();
  const [phase, setPhase] = useState<NotePhase>('waiting');

  useNoteTimers(phase, setPhase);
  useLayoutEffect(() => {
    if (phase === 'shown') {
      placeNote(window.document);
    }
  }, [phase, window]);

  return {
    hidden: phase === 'waiting' || phase === 'gone',
    hiding: phase === 'hiding',
    hide() {
      if (phase === 'shown' && fadeOf(window) > 0) {
        setPhase('hiding');
      } else if (phase !== 'hiding') {
        setPhase('gone');
      }
    },
  };
}
