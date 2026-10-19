const REQUIRED_TEXT_FIELDS = ['id', 'title', 'tagline', 'description', 'genre', 'players', 'cover'];
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

function checkCover(entry) {
  if (!isFilledText(entry.cover) || RELATIVE_FILE_PATTERN.test(entry.cover)) {
    return [];
  }
  return ['"cover" must be a relative file path inside the game folder'];
}

function checkControls(entry) {
  if (entry.controls === undefined) {
    return [];
  }
  const isTextList = Array.isArray(entry.controls) && entry.controls.every(isFilledText);
  return isTextList ? [] : ['"controls" must be a list of non-empty strings'];
}

const CHECKS = [checkRequiredFields, checkId, checkCover, checkControls];

export function validateGameEntry(entry, folderName) {
  if (!isPlainObject(entry)) {
    return ['game.json must hold a JSON object'];
  }
  return CHECKS.flatMap((check) => check(entry, folderName));
}

export function toCatalogGame(entry) {
  const gamePath = `games/${entry.id}/`;
  return { ...entry, cover: `${gamePath}${entry.cover}`, path: gamePath };
}
