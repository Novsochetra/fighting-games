import { isRelativeUrl } from '@/api/catalog/view-models.js';

const STATES = ['not-saved', 'saving', 'saved', 'failed'];
const LABELS = { 'not-saved': 'Save offline', saved: 'Remove offline copy', failed: 'Try again' };
const TIPS = {
  'not-saved': 'Save for offline',
  saved: 'Remove offline copy',
  failed: 'Save failed. Try again',
};

// Only the worker answers it (src/service-worker/routes.js): where none runs (npm run dev, a browser
// without one) the sheet hears nothing it knows and offers no save.
export const saveAddress = (id) => `api/offline/${id}`;

// a game the arcade keeps: one of its own, not a teaser nor a game on a site of its own
export const canSave = (card) => Boolean(card) && !card.isComingSoon && isRelativeUrl(card.href);

export function readSaveStatus(body) {
  if (!STATES.includes(body?.state)) {
    return null;
  }

  if (body.state !== 'saving') {
    return { state: body.state, percent: body.state === 'saved' ? 100 : 0 };
  }

  const share = body.total > 0 ? Math.min(1, body.done / body.total) : 0;

  return { state: 'saving', percent: Math.floor(share * 100) };
}

export async function askSave(fetch, address, method = 'GET') {
  try {
    const response = await fetch(address, { method, cache: 'no-store' });

    return response.ok ? readSaveStatus(await response.json()) : null;
  } catch {
    return null;
  }
}

export const saveLabel = (status) =>
  status.state === 'saving' ? `Saving ${status.percent}%` : LABELS[status.state];

// what a save button's tooltip says, in one short line: what a tap does, or how far the save is
export const saveTip = (status) =>
  status.state === 'saving' ? `Saving… ${status.percent}%` : TIPS[status.state];

// a save button's name, which says the game it is for, as a tile's button sits beside others
export function saveName(status, title) {
  switch (status.state) {
    case 'saving':
      return `Saving ${title} for offline, ${status.percent}%`;
    case 'saved':
      return `Remove the offline copy of ${title}`;
    case 'failed':
      return `Try saving ${title} for offline again`;
    default:
      return `Save ${title} for offline`;
  }
}
