import { readJson, writeJson } from '../platform/storage.js';

const TICKET_KEY = 'sd_ticket';
const MAX_TICKET_LENGTH = 200;

const readTicket = (stored) =>
  typeof stored === 'string' && stored.length <= MAX_TICKET_LENGTH ? stored : null;

// the online board's ticket for the run under way, asked for as it starts; it is kept with the saved
// run, so a run picked up again on a later visit can still post. Only one run is saved at a time,
// and a new run asks for a new ticket, so the ticket kept is always the saved run's
export function createRunTicket({ api, storage }) {
  let ticket = readTicket(readJson(storage, TICKET_KEY, null));
  let asked = 0;

  function keep(value) {
    ticket = value;
    writeJson(storage, TICKET_KEY, value);
  }

  return {
    start() {
      asked += 1;
      const mine = asked;

      keep(null);
      // offline, or the board refused: the run plays on and stays off the online board
      api.requestTicket().then(
        (given) => mine === asked && keep(readTicket(given)),
        () => {},
      );
    },

    current: () => ticket,

    spend() {
      keep(null);
    },
  };
}
