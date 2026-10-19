export const PROGRAMS = [
  'L 9 L 9 L 9 L 9 L',
  'L 9 L 9 K',
  'K 14 K 14 K',
  'down+L 12 L 9 L 9 L',
  'up+L 18 L 8 L 8 L 8 K',
  'down+K',
  'up+K 14 L 8 L 8 L 8 K',
  'jump 10 L 8 L 8 L 8 K',
  'jump 14 down+L 16 down+L',
  'jump 12 down+K',
  'dash 4 L',
  'dash 4 K',
  'K:70',
  'K:30',
  'L 9 L 9 L 9 L 4 K:70',
  'dash 8 dash',
  'K 14 K:40',
];

const DEFAULT_HOLD = { K: 2 };
const TOKEN = /^(?:(up|down)\+)?(\w+)(?::(\d+))?$/;

function parseToken(token) {
  const [, modifier, key, hold] = TOKEN.exec(token);
  return { modifier, key, hold: hold ? Number(hold) : (DEFAULT_HOLD[key] ?? 1) };
}

export function compileProgram(source, startTick) {
  const events = [];
  let tick = startTick;
  for (const token of source.split(' ')) {
    if (/^\d+$/.test(token)) {
      tick += Number(token);
      continue;
    }
    const { modifier, key, hold } = parseToken(token);
    const keys = modifier ? [modifier, key] : [key];
    for (const name of keys) {
      events.push({ tick, type: 'press', key: name });
      events.push({ tick: tick + hold, type: 'release', key: name });
    }
  }
  return events;
}
