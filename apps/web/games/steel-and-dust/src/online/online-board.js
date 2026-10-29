import { readJson, writeJson } from '../platform/storage.js';
import { OFFLINE_MESSAGE, BoardRefusal } from './board-api.js';
import { readInitials } from './initials.js';
import { readBoard } from './read-board.js';
import { rankText, scoreBody } from './score-body.js';

const INITIALS_KEY = 'sd_initials';
// the board is read when it is opened, again only once it is this old, and a failed read is tried
// again a little sooner
const FRESH_MS = 30 * 1000;
const RETRY_MS = 10 * 1000;

const failureText = (error) => (error instanceof BoardRefusal ? error.message : OFFLINE_MESSAGE);

// what the menus show of the online board: its runs as last read, and the run being posted;
// `onChange` draws the open panel again as an answer comes in
export function createOnlineBoard({ api, ticket, storage, now = Date.now }) {
  const online = {
    status: 'idle',
    runs: null,
    triedAt: -Infinity,
    posting: false,
    posted: null,
    note: '',
    initials: readInitials(readJson(storage, INITIALS_KEY, null)),
    onChange() {},

    startRun() {
      ticket.start();
      Object.assign(online, { posted: null, note: '' });
    },

    canPost: (run) => !!run && !!ticket.current() && online.posted?.run !== run,

    rankOf: (run) => (run && online.posted?.run === run ? online.posted.rank : null),

    load: () => loadBoard(online, { api, now }),

    async post(run, initials) {
      if (online.posting || !online.canPost(run)) {
        return;
      }

      Object.assign(online, { posting: true, note: 'Posting…' });
      online.onChange();
      await sendRun(online, { api, ticket, storage }, { run, initials });
      online.posting = false;
      online.onChange();
    },
  };

  return online;
}

async function loadBoard(online, { api, now }) {
  const wait = online.status === 'ready' ? FRESH_MS : RETRY_MS;

  if (online.status === 'loading' || now() - online.triedAt < wait) {
    return;
  }

  Object.assign(online, { status: 'loading', triedAt: now() });

  try {
    online.runs = readBoard(await api.loadBoard());
    online.status = 'ready';
  } catch {
    online.status = 'failed';
  }

  online.onChange();
}

async function sendRun(online, { api, ticket, storage }, { run, initials }) {
  try {
    const answer = await api.postScore(scoreBody(run, initials, ticket.current()));

    ticket.spend();
    writeJson(storage, INITIALS_KEY, initials.join(''));
    Object.assign(online, {
      posted: { run, rank: answer.rank, initials: initials.join('') },
      note: `Posted! ${rankText(answer.rank)}`,
      initials: [...initials],
      triedAt: -Infinity,
    });
  } catch (error) {
    online.note = failureText(error);
  }
}
