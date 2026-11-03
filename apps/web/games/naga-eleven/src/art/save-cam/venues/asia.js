import { ASIA_STADIUM } from '../../venues/asia-stadium.js';

// The save cam at the Asian Youth Championship by night, from the penalty spot: the venue's bowl
// behind the goal under its deep blue starry sky, the dark underside of its roof with the banks of
// floodlights blazing along its edge, the upper tier in the roof's shade, the ring of glowing LED
// panels between the tiers, the lower tier lit gold, its boards and its floodlit pitch. Ramps run
// deep to light
export const SAVE_CAM_ASIA = {
  sky: ASIA_STADIUM.sky.slice(0, 5),
  star: ASIA_STADIUM.star,
  roof: ASIA_STADIUM.roof,
  roofUnder: ASIA_STADIUM.roofUnder,
  steel: ASIA_STADIUM.steel,
  lamp: ASIA_STADIUM.lamp,
  glow: ASIA_STADIUM.glow,
  shadow: ASIA_STADIUM.shadow,
  concrete: ASIA_STADIUM.concrete,
  seats: ASIA_STADIUM.seats,
  crowd: ASIA_STADIUM.crowd,
  led: ASIA_STADIUM.led,
  ads: ASIA_STADIUM.ads,
  grass: ASIA_STADIUM.grass,
  line: ASIA_STADIUM.line,
  goal: {
    post: ASIA_STADIUM.post,
    net: ['#3a4462', '#6a7896', '#a8b4cc'],
  },
};
