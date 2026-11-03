import { ASIA_STADIUM } from '../../venues/asia-stadium.js';

// The save cam at the Asian Youth Championship by night: the World Stadium's floodlit stand behind
// the goal (SAVE_CAM_ART) in the venue's own deep blue night, its crowd and its glowing boards.
// Ramps run deep to light
export const SAVE_CAM_ASIA = {
  sky: [ASIA_STADIUM.sky[0], ASIA_STADIUM.sky[3]],
  glow: [ASIA_STADIUM.sky[5]],
  lamp: [ASIA_STADIUM.glow, ASIA_STADIUM.lamp],
  stand: ASIA_STADIUM.concrete.slice(0, 4),
  crowd: ASIA_STADIUM.crowd.shirts.map((shirt) => shirt[1]),
  flashBulb: ASIA_STADIUM.lamp,
  boards: [
    ASIA_STADIUM.led.back,
    ASIA_STADIUM.led.frame,
    ASIA_STADIUM.ads[1].back,
    ASIA_STADIUM.ads[0].back,
    ASIA_STADIUM.ads[2].back,
  ],
  grass: ASIA_STADIUM.grass.slice(2, 7),
  line: ASIA_STADIUM.line,
  goal: {
    post: ASIA_STADIUM.post,
    net: ['#3a4462', '#6a7896', '#a8b4cc'],
  },
};
