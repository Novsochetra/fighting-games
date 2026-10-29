import { escapeHtml } from '../../lib/html.js';
import { NAME_LIMITS } from '../../online/player-name.js';

const PROMPT = 'Your name goes on the online board, in Khmer or English.';

function runLine(run) {
  const reached = run.cleared ? 'All clear' : `Mission ${run.mission}`;

  return `Score <b>${run.score}</b> &nbsp;·&nbsp; ${reached}`;
}

// once posted, the name is kept as posted and the button takes the player to the board
function nameHtml(name, posted) {
  return (
    '<label class="post-label" for="postName">Your name</label>' +
    `<input class="post-name" id="postName" name="name" type="text" value="${escapeHtml(name)}" ` +
    `maxlength="${NAME_LIMITS.maxLength * 2}" autocomplete="nickname" autocapitalize="words" ` +
    `spellcheck="false" enterkeyhint="send" placeholder="Sok Dara"${posted ? ' readonly' : ''} />`
  );
}

function actionHtml(online, run) {
  if (online.rankOf(run)) {
    return '<button class="mbtn primary" type="button" data-act="leaderboard">See the board</button>';
  }

  const disabled = online.posting ? ' disabled' : '';

  return `<button class="mbtn primary" type="button" data-act="sendScore"${disabled}>Post</button>`;
}

export function postHtml({ run, name, online }) {
  if (!run) {
    return '';
  }

  return (
    `<p class="post-run">${runLine(run)}</p>` +
    `<form class="post-form" novalidate>${nameHtml(name, !!online.rankOf(run))}</form>` +
    `<p class="post-note" role="status">${escapeHtml(online.note || PROMPT)}</p>` +
    `<div class="mlist">${actionHtml(online, run)}</div>`
  );
}

// the field starts with the name last posted, so a returning player posts with one press; the
// field takes the keys as the panel opens, or the first letters typed would move the menu, while a
// touch leaves the phone's keyboard down until the player taps the field
export function createPostPanel({ root, game, online, ui }) {
  const state = { name: online.name };
  const field = () => root.querySelector('.post-name');

  return {
    state,

    build() {
      root.innerHTML = postHtml({ run: game.lastRun, name: state.name, online });
    },

    reset() {
      state.name = online.name;

      if (!online.posting) {
        online.note = '';
      }
    },

    focus(index) {
      if (index === 0 && ui.lastInput !== 'touch') {
        field()?.focus({ preventScroll: true });
      } else if (index !== 0) {
        field()?.blur();
      }
    },

    firstSelected: () => 0,
  };
}
