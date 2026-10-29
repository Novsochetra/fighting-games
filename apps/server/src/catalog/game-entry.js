import { checkLeaderboard, shownLeaderboard } from './leaderboard-rules.js';

const REQUIRED_TEXT_FIELDS = ['id', 'title', 'tagline', 'description', 'genre', 'players', 'cover'];
// The cover is the square icon; banner (16:9) and poster (portrait) are the optional key art the home
// page shows behind its cards, and screenshot an optional 16:9 frame of play for the card itself.
export const ART_FIELDS = ['cover', 'banner', 'poster', 'screenshot'];
// An optional video of play the arcade's details sheet shows. It stays in assets/trailer/, which a
// saved game leaves out (offline/game-files.js), and is an MP4: the one kind every phone plays.
const FILE_FIELDS = [...ART_FIELDS, 'trailer'];
const TRAILER_PATTERN = /^assets\/trailer\/[\w-][\w.-]*\.mp4$/;
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const RELATIVE_FILE_PATTERN = /^[\w-][\w.-]*(?:\/[\w-][\w.-]*)*$/;

const isFilledText = (value) => typeof value === 'string' && value.trim() !== '';
const isPlainObject = (value) =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function checkRequiredFields(entry) {
  return REQUIRED_TEXT_FIELDS.filter((field) => !isFilledText(entry[field])).map(
    (field) => `"${field}" must be a non-empty string`,
  );
}

function checkId(entry, folderName) {
  if (!isFilledText(entry.id)) {
    return [];
  }
  if (entry.id !== folderName) {
    return [`"id" is "${entry.id}" but the folder is "${folderName}"`];
  }
  return ID_PATTERN.test(entry.id)
    ? []
    : ['"id" may only use lowercase letters, digits and dashes'];
}

function checkArtPath(entry, field) {
  const value = entry[field];
  const isMissing = field === 'cover' ? !isFilledText(value) : value === undefined;
  if (isMissing || (typeof value === 'string' && RELATIVE_FILE_PATTERN.test(value))) {
    return [];
  }
  return [`"${field}" must be a relative file path inside the game folder`];
}

const checkArt = (entry) => ART_FIELDS.flatMap((field) => checkArtPath(entry, field));

function checkTrailer({ trailer }) {
  const isVideo = typeof trailer === 'string' && TRAILER_PATTERN.test(trailer);

  return trailer === undefined || isVideo
    ? []
    : ['"trailer" must be an .mp4 file in the game\'s assets/trailer/ folder'];
}

function checkControls(entry) {
  if (entry.controls === undefined) {
    return [];
  }
  const isTextList = Array.isArray(entry.controls) && entry.controls.every(isFilledText);
  return isTextList ? [] : ['"controls" must be a list of non-empty strings'];
}

// A game hosted on its own site keeps only its game.json and art here; Play opens its url instead.
export function isSecureGameUrl(value) {
  if (typeof value !== 'string' || /\s/.test(value)) {
    return false;
  }
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.username === '' && url.password === '';
  } catch {
    return false;
  }
}

function checkUrl(entry) {
  if (entry.url === undefined || isSecureGameUrl(entry.url)) {
    return [];
  }
  return ['"url" must be an https:// address'];
}

function checkPixelArt(entry) {
  if (entry.pixelArt === undefined || typeof entry.pixelArt === 'boolean') {
    return [];
  }
  return ['"pixelArt" must be true or false'];
}

const CHECKS = [
  checkRequiredFields,
  checkId,
  checkArt,
  checkTrailer,
  checkControls,
  checkUrl,
  checkPixelArt,
  checkLeaderboard,
];

export function validateGameEntry(entry, folderName) {
  if (!isPlainObject(entry)) {
    return ['game.json must hold a JSON object'];
  }
  return CHECKS.flatMap((check) => check(entry, folderName));
}

export function toCatalogGame({ leaderboard, ...entry }) {
  const gamePath = `games/${entry.id}/`;
  const files = FILE_FIELDS.filter((field) => entry[field] !== undefined).map((field) => [
    field,
    `${gamePath}${entry[field]}`,
  ]);
  const board = leaderboard ? { leaderboard: shownLeaderboard(leaderboard) } : {};
  return { ...entry, ...Object.fromEntries(files), ...board, path: gamePath };
}
