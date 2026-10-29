// Three letters can still spell a slur, and the board is public, so these are turned away, as
// arcade cabinets long did.
const BLOCKED = new Set([
  'ASS',
  'CNT',
  'COK',
  'CUM',
  'DIC',
  'DIK',
  'FAG',
  'FCK',
  'FUC',
  'FUK',
  'FUQ',
  'JIZ',
  'KKK',
  'KYS',
  'NGR',
  'NIG',
  'PNS',
  'SEX',
  'SHT',
  'TIT',
  'VAG',
  'XXX',
]);

export const isBlockedInitials = (initials) => BLOCKED.has(initials);
