import { difficultyOf } from '../../data/difficulty.js';
import { MISSIONS } from '../../data/missions/index.js';
import { WEAPONS } from '../../data/weapons/index.js';
import { formatClock } from '../../render/hud/clock.js';

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

// each record is kept whole, so a narrow phone breaks the line between them, never inside one
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
  const records = parts.map((part) => `<span class="keep">${part}</span>`);
  return records.join('<span class="dot"> · </span>') + separator + tip;
}

function livesLeftHtml(lives) {
  if (lives === 1) {
    return '<b>last life</b>';
  }
  return lives > 0 ? `lives left <b>${lives}</b>` : '<b>no lives left</b>';
}

export function overNoteHtml(game) {
  const mission = `Mission <b>${game.missionIndex + 1}</b>`;
  return `${mission} &nbsp;·&nbsp; score <b>${game.score}</b> &nbsp;·&nbsp; ${livesLeftHtml(game.lives)}`;
}

export function clearStatsHtml(game) {
  const best = game.newBestScore ? ' <span class="new">new best!</span>' : '';
  const rows = [
    ['Missions', `${game.missionIndex + 1} / ${MISSIONS.length}`],
    ['Time', formatClock(game.playTime)],
    ['Score', game.score + best],
    ['Best combo', `${game.records.bestCombo} hits`],
    ['Continues', game.continues],
    ['Lives left', game.lives],
    ['Difficulty', difficultyOf(game.settings).name],
  ];
  return rows.map(([name, value]) => `<dt>${name}</dt><dd>${value}</dd>`).join('');
}

export function weaponButtonLabel(game) {
  return `Weapon: ${WEAPONS[game.player.weapon.id].name}`;
}
