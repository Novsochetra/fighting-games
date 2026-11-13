export function createGame({ records, settings }) {
  return { screen: 'title', run: null, records, settings, summary: null, events: [] };
}
