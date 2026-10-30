import { SaveIcon, SaveRing, TrashIcon } from '@/screens/home/home-icons';
import { saveLabel } from '@/api/offline/offline-save.js';
import type { SaveStatus } from './use-save-status';

function SaveSign({ status }: { status: SaveStatus }) {
  if (status.state === 'saving') {
    return <SaveRing percent={status.percent} />;
  }

  return status.state === 'saved' ? <TrashIcon /> : <SaveIcon />;
}

// The details sheet's way to keep a game for offline, beside its Play, and to remove it once
// saved. It shows only where the arcade's worker answers, so a browser without one is never offered
// a save it cannot keep. It stays focusable while it saves (aria-disabled, not disabled), so a
// keyboard's focus is not lost.
export function SaveOffline({ status, onTap }: { status: SaveStatus | null; onTap: () => void }) {
  if (!status) {
    return null;
  }

  return (
    <button
      type="button"
      className={`pill-button pill-button--surface sheet__save is-${status.state}`}
      id="details-save"
      aria-disabled={status.state === 'saving' || undefined}
      onClick={onTap}
    >
      <SaveSign status={status} />
      {saveLabel(status)}
    </button>
  );
}
