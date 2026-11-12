export function createGame({ records, settings }) {
  return {
    screen: 'title',
    resumeTo: 'play',
    run: null,
    beatsLeft: 0,
    beatLeft: 0,
    records,
    settings,
    summary: null,
    events: [],
  };
}
