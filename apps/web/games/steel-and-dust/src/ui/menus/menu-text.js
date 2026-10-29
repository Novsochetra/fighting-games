import { rankOf } from '../../data/leaderboard.js';
import { WEAPONS } from '../../data/weapons/index.js';
import { hasLivesLeft } from '../../sim/stage/lives.js';

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

export function continueSavedLabel(checkpoint) {
  return `Continue mission ${checkpoint.mission + 1}`;
}

function livesLeftHtml(lives) {
  if (lives === 1) {
    return '<b>last life</b>';
  }
  return lives > 0 ? `lives left <b>${lives}</b>` : '<b>no lives left</b>';
}

export function boardPlace(game) {
  const rank = rankOf(game.leaderboard, game.lastRun);
  return rank ? `#${rank}` : '';
}

// a fall with lives left has not ended the run, so the place shown would be the last run's
function boardPlaceHtml(game) {
  const place = hasLivesLeft(game) ? '' : boardPlace(game);
  return place ? `<br><span class="keep">Leaderboard <b>${place}</b></span>` : '';
}

// the place the online board gave the run, once it is posted
function onlinePlaceHtml(rank) {
  return rank ? `<br><span class="keep">Online <b>#${rank.week}</b> this week</span>` : '';
}

export function overNoteHtml(game, onlineRank = null) {
  const mission = `Mission <b>${game.missionIndex + 1}</b>`;
  const note = `${mission} &nbsp;·&nbsp; score <b>${game.score}</b> &nbsp;·&nbsp; ${livesLeftHtml(game.lives)}`;
  return note + boardPlaceHtml(game) + onlinePlaceHtml(onlineRank);
}

export function weaponButtonLabel(game) {
  return `Weapon: ${WEAPONS[game.player.weapon.id].name}`;
}
