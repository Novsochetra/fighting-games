import { RECORDS_FOLDER } from './review-record.js';
import { SEGMENT_END, withoutText } from './shell-text.js';

const REDIRECT_TARGET = /\d?>>?\s*([^\s;&|<>]+)/g;
const IN_RECORDS = new RegExp(`(?:^|[\\s/=])${RECORDS_FOLDER}(?:/|\\s|$)`);
const WRITES_EVERY_PATH = new Set(['tee', 'rm', 'touch', 'mkdir']);
const WRITES_LAST_PATH = new Set(['cp', 'mv', 'ln', 'install']);

const redirectsInto = (part) =>
  [...part.matchAll(REDIRECT_TARGET)].some(([, target]) => IN_RECORDS.test(target));

// cp, mv, ln and install write only their last path and dd only its of=, so a copy out of the records
// is a read of them.
function writtenPaths(part) {
  const [tool, ...words] = part.trim().split(/\s+/);

  if (WRITES_EVERY_PATH.has(tool)) {
    return words;
  }

  if (WRITES_LAST_PATH.has(tool)) {
    return words.slice(-1);
  }

  return tool === 'dd' ? words.filter((word) => word.startsWith('of=')) : [];
}

const toolWritesInto = (part) => writtenPaths(part).some((word) => IN_RECORDS.test(word));

// Naming the records is fine, in a read, a message or a search saved elsewhere; writing into them is
// the recording hook's job.
export const writesReviewRecords = (command) =>
  withoutText(command)
    .split(SEGMENT_END)
    .some((part) => redirectsInto(part) || toolWritesInto(part));
