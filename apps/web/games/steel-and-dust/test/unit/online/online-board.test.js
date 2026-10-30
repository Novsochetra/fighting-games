import { describe, expect, it, vi } from 'vitest';
import { BoardRefusal, createBoardApi } from '../../../src/online/board-api.js';
import { createRunTicket } from '../../../src/online/run-ticket.js';
import { memoryStorage } from '../../support/memory-storage.js';
import { createTestOnline, fakeBoardApi } from '../../support/online-board.js';

const settle = () => new Promise((resolve) => setTimeout(resolve, 0));
const run = { score: 4200, mission: 3, hero: 'moss', difficulty: 1, time: 600, cleared: false };

describe('the board API', () => {
  const answer = (status, json) => ({ ok: status < 400, status, json: async () => json });

  it('reads the board by address from the game page, for this game', async () => {
    const fetch = vi.fn(async () => answer(200, { week: [] }));
    await createBoardApi(fetch).loadBoard();
    expect(fetch).toHaveBeenCalledWith('../../api/leaderboard?game=steel-and-dust');
  });

  it('posts a score as JSON with the game named', async () => {
    const fetch = vi.fn(async () => answer(201, { rank: { week: 1, allTime: 1 } }));
    await createBoardApi(fetch).postScore({ name: 'Sok' });
    const [address, options] = fetch.mock.calls[0];
    expect(address).toBe('../../api/leaderboard');
    expect(options).toMatchObject({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    expect(JSON.parse(options.body)).toEqual({ game: 'steel-and-dust', name: 'Sok' });
  });

  it('posts a poster as JSON with the game named', async () => {
    const fetch = vi.fn(async () => answer(201, { poster: [] }));
    await createBoardApi(fetch).postPoster({ ticket: 'T1', images: {} });
    const [address, options] = fetch.mock.calls[0];
    expect(address).toBe('../../api/leaderboard/posters');
    expect(JSON.parse(options.body)).toEqual({ game: 'steel-and-dust', ticket: 'T1', images: {} });
  });

  it('asks for a run ticket', async () => {
    const fetch = vi.fn(async () => answer(201, { ticket: 'abc' }));
    expect(await createBoardApi(fetch).requestTicket()).toBe('abc');
    expect(fetch.mock.calls[0][0]).toBe('../../api/leaderboard/tickets');
  });

  it('passes on what the server says when it refuses, and a plain word when it says nothing', async () => {
    const refused = vi.fn(async () => answer(400, { error: 'Pick another name.' }));
    await expect(createBoardApi(refused).postScore({})).rejects.toThrow(
      new BoardRefusal('Pick another name.'),
    );
    const broken = vi.fn(async () => ({
      ok: false,
      status: 502,
      json: async () => JSON.parse('<'),
    }));
    await expect(createBoardApi(broken).loadBoard()).rejects.toThrow(/Can't reach/);
  });
});

describe('the run ticket', () => {
  it('keeps the ticket a fresh run is given, also for the next visit', async () => {
    const storage = memoryStorage();
    const ticket = createRunTicket({ api: fakeBoardApi({ ticket: 'T1' }), storage });
    ticket.start();
    expect(ticket.current()).toBeNull();
    await settle();
    expect(ticket.current()).toBe('T1');
    expect(createRunTicket({ api: fakeBoardApi(), storage }).current()).toBe('T1');
  });

  it('drops a late answer meant for a run that has since been left', async () => {
    const answers = [];
    const api = { requestTicket: () => new Promise((resolve) => answers.push(resolve)) };
    const ticket = createRunTicket({ api, storage: memoryStorage() });
    ticket.start();
    ticket.start();
    answers[1]('second');
    answers[0]('first');
    await settle();
    expect(ticket.current()).toBe('second');
  });

  it('has none for a run that started offline, and none once spent', async () => {
    const api = fakeBoardApi();
    api.requestTicket.mockRejectedValueOnce(new TypeError('offline'));
    const ticket = createRunTicket({ api, storage: memoryStorage() });
    ticket.start();
    await settle();
    expect(ticket.current()).toBeNull();
    ticket.start();
    await settle();
    ticket.spend();
    expect(ticket.current()).toBeNull();
  });

  it('ignores a kept ticket that is not one', () => {
    const storage = memoryStorage({ sd_ticket: JSON.stringify({ evil: true }) });
    expect(createRunTicket({ api: fakeBoardApi(), storage }).current()).toBeNull();
  });
});

describe('the online board', () => {
  function clockedOnline(api = fakeBoardApi()) {
    const clock = { time: 0 };
    return { clock, ...createTestOnline({ api, now: () => clock.time }) };
  }

  it('reads the board again only once it is 30 seconds old', async () => {
    const { clock, online, api } = clockedOnline();
    await online.load();
    await online.load();
    clock.time = 29999;
    await online.load();
    expect(api.loadBoard).toHaveBeenCalledTimes(1);
    clock.time = 30000;
    await online.load();
    expect(api.loadBoard).toHaveBeenCalledTimes(2);
  });

  it('tries a failed read again sooner, and tells the panel each time an answer comes in', async () => {
    const api = fakeBoardApi();
    api.loadBoard.mockRejectedValueOnce(new TypeError('offline'));
    const { clock, online } = clockedOnline(api);
    online.onChange = vi.fn();
    await online.load();
    expect(online.status).toBe('failed');
    clock.time = 10000;
    await online.load();
    expect(online.status).toBe('ready');
    expect(online.onChange).toHaveBeenCalledTimes(2);
  });

  it('sends the run its poster once posted, naming who played as the board does, with its ticket', async () => {
    const api = fakeBoardApi({
      ticket: 'T1',
      posted: { rank: { week: 1 }, score: { name: 'Dara' } },
    });
    const drawPoster = vi.fn(async () => ({ small: 'cw==', medium: 'bQ==', large: 'bA==' }));
    const { online } = createTestOnline({ api, drawPoster });
    online.startRun();
    await settle();
    await online.post(run, ' dara ');
    await settle();
    expect(drawPoster).toHaveBeenCalledWith(run, 'Dara');
    expect(api.postPoster).toHaveBeenCalledWith({
      ticket: 'T1',
      images: { small: 'cw==', medium: 'bQ==', large: 'bA==' },
    });
  });

  it('says the run is posted without waiting on its poster, and loses nothing if that fails', async () => {
    const api = fakeBoardApi();
    api.postPoster.mockRejectedValue(new TypeError('offline'));
    const drawPoster = vi.fn(() => new Promise(() => {}));
    const { online } = createTestOnline({ api, drawPoster });
    online.startRun();
    await settle();
    await online.post(run, 'Sok');
    expect(online.note).toMatch(/^Posted!/);
    expect(online.posting).toBe(false);
    const failing = createTestOnline({ api, drawPoster: vi.fn(async () => ({})) }).online;
    failing.startRun();
    await settle();
    await failing.post(run, 'Sok');
    await settle();
    expect(failing.note).toMatch(/^Posted!/);
  });

  it('sends no poster for a run the board refused', async () => {
    const api = fakeBoardApi();
    api.postScore.mockRejectedValue(new BoardRefusal('Pick another name.'));
    const drawPoster = vi.fn(async () => ({}));
    const { online } = createTestOnline({ api, drawPoster });
    online.startRun();
    await settle();
    await online.post(run, 'Sok');
    await settle();
    expect(drawPoster).not.toHaveBeenCalled();
    expect(api.postPoster).not.toHaveBeenCalled();
  });

  it('posts a run once, with its ticket, then names its places', async () => {
    const { online, api } = clockedOnline();
    online.startRun();
    await settle();
    expect(online.canPost(run)).toBe(true);
    await Promise.all([online.post(run, ' Sok  Dara '), online.post(run, 'Sok Dara')]);
    expect(api.postScore).toHaveBeenCalledTimes(1);
    expect(online.rankOf(run)).toEqual({ week: 1, allTime: 4 });
    expect(online.canPost(run)).toBe(false);
    expect(online.name).toBe('Sok Dara');
    expect(api.postScore.mock.calls[0][0].name).toBe('Sok Dara');
    online.startRun();
    expect(online.rankOf(run)).toBeNull();
  });

  it('says what is wrong with a name before sending it', async () => {
    const { online, api } = clockedOnline();
    online.startRun();
    await settle();
    await online.post(run, '   ');
    expect(online.note).toBe('Type your name.');
    expect(api.postScore).not.toHaveBeenCalled();
  });

  it('posts nothing without a ticket or a run', async () => {
    const { online, api } = clockedOnline();
    await online.post(run, 'Sok');
    expect(online.canPost(null)).toBe(false);
    expect(api.postScore).not.toHaveBeenCalled();
  });
});
