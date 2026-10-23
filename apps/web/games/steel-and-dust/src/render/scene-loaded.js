import { missionAt } from '../data/missions/index.js';
import { keepMissionEnemies, missionEnemiesSettled } from './fighters/enemy-sheets.js';
import { heroSheetFor, keepPickedHero } from './fighters/hero-sheets.js';
import { backdropFor, backdropPieces, missionRoadLoaded } from './scene/backdrop.js';

// the clock holds and the loading screen stays up until the mission's road, its enemies' sheets and
// the picked Shade's strips are in, so neither the hero nor a raider shows as the bare body drawn
// for fighters without a sprite; a Shade picked to go on as loads then
export function sceneLoaded(view, game) {
  keepPickedHero(view, game.settings.hero);
  const enemies = missionEnemiesSettled(view.enemySheets, game.missionIndex);
  return (
    missionRoadLoaded(view, game.missionIndex) &&
    enemies &&
    heroSheetFor(view, game.settings.hero).settled
  );
}

// the share of those files that has settled, each road layer, enemy sheet and strip counting once
export function sceneProgress(view, game) {
  const pieces = backdropPieces(backdropFor(view, missionAt(game.missionIndex).theme));
  const sheet = heroSheetFor(view, game.settings.hero);
  const strips = Object.keys(sheet.images).length;
  const enemySheets = view.enemySheets;
  keepMissionEnemies(enemySheets, game.missionIndex);
  const enemies = enemySheets.needed.filter((id) => enemySheets.settled[id]).length;
  const settled = pieces.filter((piece) => piece.settled).length + strips - sheet.waiting + enemies;
  return settled / (pieces.length + strips + enemySheets.needed.length);
}

// what the loading screen shows during play: the share in while the scene waits, else null; on
// the title or a menu the canvas waits unseen behind them
export function missionWait(view, game) {
  return game.mode === 'play' && !sceneLoaded(view, game) ? sceneProgress(view, game) : null;
}
