import { difficultyOf } from '../../data/difficulty.js';
import { MISSIONS } from '../../data/missions/index.js';
import { WEAPONS } from '../../data/weapons/index.js';
import { formatClock } from '../../render/hud/score.js';

function titleTip({ ui, fullscreen, isIos, padConnected }) {
  if (ui.isTouchOn()) {
    return isIos && !fullscreen.supported
      ? 'Tip: add this page to your Home Screen to play full screen.'
      : '';
  }
  if (padConnected) {
    return 'Gamepad ready: A to choose, B to go back.';
  }
  return '<kbd>Enter</kbd> choose · <kbd>Esc</kbd> back · <kbd>F</kbd> full screen';
}

export function titleNoteHtml(game, context) {
  const parts = [];
  if (game.records.bestScore) {
    parts.push(`Best score <b>${game.records.bestScore}</b>`);
  }
  if (game.records.bestCombo) {
    parts.push(`Best combo <b>${game.records.bestCombo} hits</b>`);
  }
  const tip = titleTip(context);
  const separator = parts.length && tip ? '<br>' : '';
  return parts.join(' &nbsp;·&nbsp; ') + separator + tip;
}

export function overNoteHtml(game) {
  const mission = `Mission <b>${game.missionIndex + 1}</b>`;
  return `${mission} &nbsp;·&nbsp; score <b>${game.score}</b> &nbsp;·&nbsp; continues used <b>${game.continues}</b>`;
}

export function clearStatsHtml(game) {
  const best = game.newBestScore ? ' <span class="new">new best!</span>' : '';
  const rows = [
    ['Missions', `${game.missionIndex + 1} / ${MISSIONS.length}`],
    ['Time', formatClock(game.playTime)],
    ['Score', game.score + best],
    ['Best combo', `${game.records.bestCombo} hits`],
    ['Continues', game.continues],
    ['Difficulty', difficultyOf(game.settings).name],
  ];
  return rows.map(([name, value]) => `<dt>${name}</dt><dd>${value}</dd>`).join('');
}

export function weaponButtonLabel(game) {
  return `Weapon: ${WEAPONS[game.player.weapon.id].name}`;
}
