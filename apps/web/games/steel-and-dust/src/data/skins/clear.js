import { handheldSkin } from './handheld.js';

const COLOURS = {
  lotus: ['Clear Lotus', 'See-through lotus purple'],
  ember: ['Clear Ember', 'See-through ember red'],
  jade: ['Clear Jade', 'See-through jade green'],
  mekong: ['Clear Mekong', 'See-through Mekong blue'],
  smoke: ['Clear Smoke', 'See-through smoke grey'],
};

const clearSkin = (colour, [name, plastic]) =>
  handheldSkin({
    id: `clear-${colour}`,
    name,
    // one line on a phone held sideways, so the bar clears the keys under it
    about: `${plastic}, its insides showing`,
    prefix: 'clear',
    tint: `clear-${colour}`,
    // shaped as the pill art is (assets/skins/clear/key-pill.webp, 386 by 170)
    pillAspect: 0.44,
  });

// one shell in five colours of see-through plastic, our own handheld drawn in CSS over our own
// insides art (assets/skins/clear/)
export const CLEAR_SKINS = Object.fromEntries(
  Object.entries(COLOURS).map(([colour, words]) => [`clear-${colour}`, clearSkin(colour, words)]),
);
