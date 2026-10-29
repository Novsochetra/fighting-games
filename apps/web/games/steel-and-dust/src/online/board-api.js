// the arcade's own API, by address from the game's page, as Back to arcade finds the arcade
const BOARD_ADDRESS = '../../api/leaderboard';
const TICKETS_ADDRESS = '../../api/leaderboard/tickets';
export const GAME_ID = 'steel-and-dust';

export const OFFLINE_MESSAGE = "Can't reach the online board. Check your connection.";

// a refusal the server explains (a name it turns away, a run too old) is shown as it says it
export class BoardRefusal extends Error {}

async function readAnswer(response) {
  const json = await response.json().catch(() => null);

  if (!response.ok) {
    throw new BoardRefusal(json?.error ?? OFFLINE_MESSAGE);
  }

  return json;
}

export function createBoardApi(fetch) {
  const send = (address, body) =>
    fetch(address, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

  return {
    async loadBoard() {
      return readAnswer(await fetch(`${BOARD_ADDRESS}?game=${GAME_ID}`));
    },

    async requestTicket() {
      return (await readAnswer(await send(TICKETS_ADDRESS, {}))).ticket;
    },

    async postScore(score) {
      return readAnswer(await send(BOARD_ADDRESS, { game: GAME_ID, ...score }));
    },
  };
}
