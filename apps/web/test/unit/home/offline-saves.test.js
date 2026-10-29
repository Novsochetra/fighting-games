import { describe, expect, it } from 'vitest';
import { ASK_EVERY_MS, createSaveStore } from '../../../src/home/offline-saves.js';

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

// a store over a worker whose answers the test sets, and timers that fire when the test says so
function setUp(answers = {}) {
  const asked = [];
  const timers = [];
  const store = createSaveStore({
    fetch: async (address, { method }) => {
      asked.push(`${method} ${address}`);

      const answer = answers[address];

      return answer === undefined
        ? new Response('Not found', { status: 404 })
        : new Response(JSON.stringify(answer));
    },
    addressOf: (id) => `offline/${id}`,
    setTimer: (callback, ms) => timers.push({ callback, ms }) - 1,
    clearTimer: (index) => {
      if (index !== null) {
        timers[index] = null;
      }
    },
  });
  const fire = async () => {
    timers.splice(0).forEach((timer) => timer?.callback());
    await flush();
  };

  store.start();

  return { store, asked, timers, answers, fire };
}

describe('the home screen’s saves for offline', () => {
  it('asks once for each game shown, however many places show it', async () => {
    const { store, asked } = setUp({ 'offline/steel-and-dust': { state: 'not-saved' } });

    store.look('steel-and-dust');
    store.look('steel-and-dust');
    await flush();
    store.look('steel-and-dust');

    expect(asked).toEqual(['GET offline/steel-and-dust']);
    expect(store.statusOf('steel-and-dust')).toEqual({ state: 'not-saved', percent: 0 });
  });

  it('tells every place showing it as a save goes, asking again only while it saves', async () => {
    const page = setUp({ 'offline/steel-and-dust': { state: 'saving', done: 1, total: 4 } });
    let heard = 0;

    page.store.subscribe(() => (heard += 1));
    page.store.save('steel-and-dust');
    await flush();

    expect(page.store.statusOf('steel-and-dust').percent).toBe(25);
    expect(page.timers.map(({ ms }) => ms)).toEqual([ASK_EVERY_MS]);
    page.answers['offline/steel-and-dust'] = { state: 'saved' };
    await page.fire();

    expect(page.store.statusOf('steel-and-dust').state).toBe('saved');
    expect(page.timers).toEqual([]);
    expect(heard).toBe(2);
    expect(page.asked).toEqual(['POST offline/steel-and-dust', 'GET offline/steel-and-dust']);
  });

  it('removes a saved game with a DELETE, and tells every place showing it', async () => {
    const page = setUp({ 'offline/steel-and-dust': { state: 'not-saved' } });
    let heard = 0;

    page.store.subscribe(() => (heard += 1));
    page.store.remove('steel-and-dust');
    await flush();

    expect(page.asked).toEqual(['DELETE offline/steel-and-dust']);
    expect(page.store.statusOf('steel-and-dust').state).toBe('not-saved');
    expect(heard).toBe(1);
  });

  it('knows no save where no worker answers', async () => {
    const { store } = setUp();

    store.look('steel-and-dust');
    await flush();

    expect(store.statusOf('steel-and-dust')).toBeNull();
  });

  it('asks every game it has asked about again, one whose first answer is on its way too', async () => {
    const page = setUp({ 'offline/steel-and-dust': { state: 'not-saved' } });

    page.store.look('steel-and-dust');
    page.store.refreshAll();
    await flush();

    expect(page.asked).toEqual(['GET offline/steel-and-dust', 'GET offline/steel-and-dust']);
  });

  it('keeps the answer to its last question when an earlier one comes back after it', async () => {
    const answers = [];
    const store = createSaveStore({
      fetch: () => new Promise((resolve) => answers.push(resolve)),
      addressOf: (id) => `offline/${id}`,
      setTimer: () => null,
      clearTimer: () => {},
    });

    store.look('steel-and-dust');
    store.refreshAll();
    answers[1](new Response(JSON.stringify({ state: 'saved' })));
    await flush();
    answers[0](new Response('Not found', { status: 404 }));
    await flush();

    expect(store.statusOf('steel-and-dust')).toEqual({ state: 'saved', percent: 100 });
  });

  it('stops asking once the home screen has gone, and asks every game again when back', async () => {
    const page = setUp({ 'offline/steel-and-dust': { state: 'saving', done: 0, total: 4 } });

    page.store.save('steel-and-dust');
    await flush();
    page.store.stop();

    expect(page.timers.filter(Boolean)).toEqual([]);
    page.store.refreshAll();
    await flush();

    expect(page.timers.filter(Boolean)).toEqual([]);
    page.store.start();

    expect(page.timers.filter(Boolean)).toHaveLength(1);
  });
});
