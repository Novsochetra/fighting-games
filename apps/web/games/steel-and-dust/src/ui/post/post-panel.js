import { escapeHtml } from '../../lib/html.js';
import { stepLetter } from '../../online/initials.js';

const PROMPT = 'Pick 3 letters for the online board.';

function letterHtml(letter, slot) {
  return (
    `<div class="initial" data-slot="${slot}">` +
    `<button type="button" class="initial-step up" data-slot="${slot}" data-d="1" ` +
    `aria-label="Letter ${slot + 1}: next" tabindex="-1"></button>` +
    `<span class="initial-letter">${letter}</span>` +
    `<button type="button" class="initial-step down" data-slot="${slot}" data-d="-1" ` +
    `aria-label="Letter ${slot + 1}: previous" tabindex="-1"></button></div>`
  );
}

function runLine(run) {
  const reached = run.cleared ? 'All clear' : `Mission ${run.mission}`;

  return `Score <b>${run.score}</b> &nbsp;·&nbsp; ${reached}`;
}

// once posted, the button takes the player to the board their run is on
function actionHtml(online, run) {
  if (online.rankOf(run)) {
    return '<button class="mbtn primary" data-act="leaderboard">See the board</button>';
  }

  const disabled = online.posting ? ' disabled' : '';

  return `<button class="mbtn primary" data-act="sendScore"${disabled}>Post</button>`;
}

export function postHtml({ run, letters, online }) {
  if (!run) {
    return '';
  }

  return (
    `<p class="post-run">${runLine(run)}</p>` +
    `<div class="initials" role="group" aria-label="Your initials">${letters.map(letterHtml).join('')}</div>` +
    `<p class="post-note" role="status">${escapeHtml(online.note || PROMPT)}</p>` +
    `<div class="mlist">${actionHtml(online, run)}</div>`
  );
}

// the letters start as the ones last posted, so a returning player posts with one press
export function createPostPanel({ root, game, online }) {
  const state = { letters: [...online.initials] };

  return {
    state,

    build() {
      root.innerHTML = postHtml({ run: game.lastRun, letters: state.letters, online });
    },

    reset() {
      state.letters = [...online.initials];

      if (!online.posting) {
        online.note = '';
      }
    },

    step(slot, step) {
      state.letters[slot] = stepLetter(state.letters[slot], step);
    },

    type(slot, letter) {
      state.letters[slot] = letter;
    },

    firstSelected: () => 0,
  };
}
