// its wall runs on below the boards' top, so no gap opens under it as the layers slide
export const STAND = {
  left: 20,
  right: 840,
  roof: 114,
  under: 122,
  upper: 126,
  balcony: 152,
  lower: 159,
  wall: 184,
  foot: 190,
};

export const TIERS = [
  { top: STAND.upper, bottom: STAND.balcony, pitch: 4, light: -1, salt: 1 },
  { top: STAND.lower, bottom: STAND.wall, pitch: 5, light: 0, salt: 2 },
];

export const AISLE_EVERY = 104;

export const AISLE_WIDTH = 4;

export const LAMP_EVERY = 52;

export const BANNERS = [
  { x: 128, width: 26, kind: 'flag' },
  { x: 318, width: 20, kind: 'naga' },
  { x: 522, width: 26, kind: 'flag' },
  { x: 706, width: 20, kind: 'naga' },
];

export const isAisle = (x) =>
  (((x - STAND.left) % AISLE_EVERY) + AISLE_EVERY) % AISLE_EVERY < AISLE_WIDTH;
