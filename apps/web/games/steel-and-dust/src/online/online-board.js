import { readJson, writeJson } from '../platform/storage.js';
import { OFFLINE_MESSAGE, BoardRefusal } from './board-api.js';
import { cleanName, nameProblem, readStoredName } from './player-name.js';
import { readBoard } from './read-board.js';
import { rankText, scoreBody } from './score-body.js';

const NAME_KEY = 'sd_name';
// the board is read when it is opened, again only once it is this old, and a failed read is tried
// again a little sooner
const FRESH_MS = 30 * 1000;
const RETRY_MS = 10 * 1000;

const failureText = (error) => (error instanceof BoardRefusal ? error.message : OFFLINE_MESSAGE);

// what the menus show of the online board: its runs as last read, and the run being posted;
// `onChange` draws the open panel again as an answer comes in
export function createOnlineBoard({ api, ticket, storage, now = Date.now, drawPoster = null }) {
  const online = {
    status: 'idle',
    runs: null,
    triedAt: -Infinity,
    posting: false,
    posted: null,
    note: '',
    name: readStoredName(readJson(storage, NAME_KEY, '')),
    onChange() {},

    startRun() {
      ticket.start();
      Object.assign(online, { posted: null, note: '' });
    },

    canPost: (run) => !!run && !!ticket.current() && online.posted?.run !== run,

    rankOf: (run) => (run && online.posted?.run === run ? online.posted.rank : null),

    load: () => loadBoard(online, { api, now }),

    // a name the server would turn away for its length or its letters is caught here, at once
    async post(run, typed) {
      const name = cleanName(typed);
      const problem = nameProblem(name);

      if (online.posting || !online.canPost(run) || problem) {
        online.note = problem ?? online.note;
        online.onChange();
        return;
      }

      Object.assign(online, { posting: true, note: 'Posting…' });
      online.onChange();
      await sendRun(online, { api, ticket, storage, drawPoster }, { run, name });
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

async function sendRun(online, ports, { run, name }) {
  const { api, ticket, storage } = ports;
  const runTicket = ticket.current();

  try {
    const answer = await api.postScore(scoreBody(run, name, runTicket));
    const posted = answer.score?.name ?? name;

    ticket.spend();
    writeJson(storage, NAME_KEY, posted);
    Object.assign(online, {
      posted: { run, rank: answer.rank, name: posted },
      note: `Posted! ${rankText(answer.rank)}`,
      name: posted,
      triedAt: -Infinity,
    });
    sendPoster(ports, { run, name: posted, ticket: runTicket });
  } catch (error) {
    online.note = failureText(error);
  }
}

// the poster goes up behind the note that the run is posted, and one that does not is no loss: the
// run is on the board either way
function sendPoster({ api, drawPoster }, { run, name, ticket }) {
  if (!drawPoster) {
    return;
  }

  drawPoster(run, name)
    .then((images) => api.postPoster({ ticket, images }))
    .catch(() => {});
}
