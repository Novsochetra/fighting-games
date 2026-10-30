import type { GameCard } from '@/api/catalog/game-card';
import { SavedIcon } from '@/screens/home/home-icons';
import { useSaveStatus } from './use-save-status';

// The Available offline tag on a saved game's art, on every card and tile that shows it. The game's save button says
// the same aloud, so the tag is only for the eye.
export function OfflineTag({ card }: { card: GameCard | null }) {
  const { status } = useSaveStatus(card);

  if (status?.state !== 'saved') {
    return null;
  }

  return (
    <span className="offline-tag" aria-hidden="true">
      <SavedIcon />
      Available offline
    </span>
  );
}
