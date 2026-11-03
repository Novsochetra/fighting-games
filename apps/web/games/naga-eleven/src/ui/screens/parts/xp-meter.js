import { make, setSlot, slotOf } from '../dom.js';
import { levelShare, xpLeft } from '../xp-bar.js';

// the fill runs from `from` to `to` (shares of the level), drawn by styles/meters.css
export function renderXpMeter(meter, { from, to }, view) {
  if (!meter) {
    return;
  }

  if (!meter.querySelector('.xp-fill')) {
    meter.append(make(view.document, 'span', { className: 'xp-fill' }));
  }

  meter.style.setProperty('--xp-from', from.toFixed(3));
  meter.style.setProperty('--xp-to', to.toFixed(3));
  meter.setAttribute('role', 'progressbar');
  meter.setAttribute('aria-valuemin', '0');
  meter.setAttribute('aria-valuemax', '100');
  meter.setAttribute('aria-valuenow', String(Math.round(to * 100)));
  meter.setAttribute('aria-label', view.say('xp'));
}

export function renderProgress(section, hero, view) {
  const share = levelShare(hero);
  const left = xpLeft(hero);

  setSlot(section, 'level', view.sayWith('level', { level: hero.level }));
  renderXpMeter(slotOf(section, 'xp'), { from: share, to: share }, view);
  setSlot(
    section,
    'xp-note',
    left > 0 ? view.sayWith('xpToNext', { xp: left }) : view.say('xpTop'),
  );
}
