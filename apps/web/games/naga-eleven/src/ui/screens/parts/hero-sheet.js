import { STAT_LIMITS } from '../../../data/progression.js';
import { make } from '../dom.js';
import { kindString } from '../hero-moves.js';

export const STATS = [
  ['speed', 'statSpeed'],
  ['shot', 'statShot'],
  ['pass', 'statPass'],
  ['dribble', 'statDribble'],
  ['tackle', 'statTackle'],
  ['keeping', 'statKeeping'],
  ['stamina', 'statStamina'],
];

export function statRow(view, { stat, key, value }) {
  const { document } = view;
  const row = make(document, 'li', { className: `stat stat-${stat}` });
  const bar = make(document, 'span', { className: 'stat-bar' });

  bar.style.setProperty('--share', (value / STAT_LIMITS.max).toFixed(3));
  bar.append(make(document, 'span', { className: 'stat-fill' }));
  row.append(
    make(document, 'span', { className: 'stat-name', text: view.say(key) }),
    bar,
    make(document, 'span', { className: 'stat-value', text: view.number(value) }),
  );

  return row;
}

export function moveRow(view, move) {
  const { document } = view;
  const row = make(document, 'li', { className: `move kind-${move.kind}` });
  const name = move.known ? view.text(move.name) : view.say('moveLocked');

  row.classList.toggle('is-locked', !move.known);
  row.append(
    make(document, 'span', { className: 'move-kind', text: view.say(kindString(move.kind)) }),
    make(document, 'span', { className: 'move-name', text: name }),
    make(document, 'span', {
      className: 'move-cost',
      text: view.sayWith('moveCost', { cost: move.cost }),
    }),
  );

  return row;
}
