import { fillSlot, make, setSlot, showSlot, slotOf } from '../dom.js';
import { moveName } from '../hero-moves.js';
import { xpFill } from '../xp-bar.js';
import { renderXpMeter } from './xp-meter.js';

function wokenRow(view, move) {
  const row = make(view.document, 'li', { className: 'woken-move' });

  row.append(
    make(view.document, 'span', { className: 'woken-label', text: view.say('newMove') }),
    make(view.document, 'span', { className: 'woken-name', text: view.text(moveName(move)) }),
  );

  return row;
}

// reading the layout between the two plays the fill again when the screen is shown again
function playFill(meter) {
  meter.classList.remove('is-filling');
  meter.getBoundingClientRect();
  meter.classList.add('is-filling');
}

function xpOf(data) {
  const before = data.xp?.before ?? { level: 1, xp: 0 };
  const after = data.xp?.after ?? before;
  const fill = xpFill(before, after);

  return { after, fill, gained: data.xp?.gained ?? fill.gained };
}

export function renderGrowth(section, data, view) {
  const { after, fill, gained } = xpOf(data);
  const meter = slotOf(section, 'xp');

  setSlot(section, 'level', view.sayWith('level', { level: after.level }));
  setSlot(section, 'xp-gain', view.sayWith('xpGained', { xp: gained }));

  if (meter) {
    renderXpMeter(meter, fill, view);
    playFill(meter);
  }

  showSlot(section, 'level-up', fill.levelUp);
  fillSlot(
    section,
    'woken',
    (data.woken ?? []).map((move) => wokenRow(view, move)),
  );
}
