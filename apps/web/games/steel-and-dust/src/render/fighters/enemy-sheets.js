import { ENEMY_SPRITES } from '../../data/enemies/enemy-sprites.js';
import { MISSIONS } from '../../data/missions/index.js';
import { missionEnemySheets } from '../../data/missions/mission-enemies.js';
import { createTintCache } from './tint.js';

// the sheets cut down to their painted pieces (tools/pack_enemy_sheets.py): a browser keeps every
// pixel of a sheet it draws, and the grid sheets the art is drawn in are mostly empty cells
const DIRECTORY = 'assets/sprites/enemies/packed/';

// nothing loads until a mission asks for its enemies, or a fighter is drawn whose sheet is not in
export function loadEnemySprites({ createImage, createCanvas, baseUrl }) {
  return {
    images: {},
    ready: {},
    settled: {},
    mission: null,
    needed: [],
    upcoming: [],
    tints: createTintCache(createCanvas),
    loaders: { createImage, baseUrl },
  };
}

function requestSheet(sheets, id) {
  if (sheets.images[id]) {
    return;
  }
  const image = sheets.loaders.createImage();
  // a sheet let go before it came in is not marked as in when it does
  const settle = (ready) => () => {
    if (sheets.images[id] === image) {
      sheets.settled[id] = true;
      sheets.ready[id] = ready;
    }
  };
  image.onload = settle(true);
  image.onerror = settle(false);
  sheets.images[id] = image;
  image.src = `${sheets.loaders.baseUrl}${DIRECTORY}${ENEMY_SPRITES[id].file}`;
}

function releaseSheet(sheets, id) {
  delete sheets.images[id];
  delete sheets.ready[id];
  delete sheets.settled[id];
}

// a mission's enemies load as it starts and the next mission's once they are in; every other sheet
// is let go, so a run holds a road or two of raiders and bosses, never the whole game's
export function keepMissionEnemies(sheets, missionIndex) {
  if (sheets.mission === missionIndex) {
    return;
  }
  sheets.mission = missionIndex;
  sheets.needed = [...missionEnemySheets(missionIndex)];
  sheets.upcoming = MISSIONS[missionIndex + 1] ? [...missionEnemySheets(missionIndex + 1)] : [];
  const kept = new Set([...sheets.needed, ...sheets.upcoming]);
  for (const id of Object.keys(sheets.images)) {
    if (!kept.has(id)) {
      releaseSheet(sheets, id);
    }
  }
  sheets.needed.forEach((id) => requestSheet(sheets, id));
}

// whether every sheet the mission's road can call for has loaded or failed
export function missionEnemiesSettled(sheets, missionIndex) {
  keepMissionEnemies(sheets, missionIndex);
  const settled = sheets.needed.every((id) => sheets.settled[id]);
  if (settled) {
    sheets.upcoming.forEach((id) => requestSheet(sheets, id));
  }
  return settled;
}

// asks for a sheet the mission did not list, the first time a fighter needs it; it stays until the
// mission changes
export function enemySheetReady(sheets, id) {
  if (!id) {
    return false;
  }
  requestSheet(sheets, id);
  return Boolean(sheets.ready[id]);
}
