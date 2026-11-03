import { CITY_SCHOOL_STADIUM } from '../../venues/city-school-stadium.js';

// The save cam at Phnom Penh's school stadium late in the afternoon, from the penalty spot: the
// venue's own sunset, its red track and wall, its terraces of schoolchildren and the city behind,
// and the shades the low sun and a front view of its goal need. Ramps run deep to light
export const SAVE_CAM_SCHOOL = {
  sky: CITY_SCHOOL_STADIUM.sky,
  cloud: CITY_SCHOOL_STADIUM.cloud,
  sun: ['#f6c47c', '#fbdca2', '#fff0d0', '#fffbee'],
  grass: CITY_SCHOOL_STADIUM.grass,
  track: CITY_SCHOOL_STADIUM.track,
  sand: CITY_SCHOOL_STADIUM.sand,
  line: CITY_SCHOOL_STADIUM.line,
  concrete: CITY_SCHOOL_STADIUM.concrete,
  wall: CITY_SCHOOL_STADIUM.wall,
  steel: CITY_SCHOOL_STADIUM.steel,
  city: CITY_SCHOOL_STADIUM.city,
  window: CITY_SCHOOL_STADIUM.window,
  crowd: CITY_SCHOOL_STADIUM.crowd,
  banners: CITY_SCHOOL_STADIUM.banners,
  // the city far off in the evening haze, a shade toward the glow of the sky
  haze: '#d8b8a8',
  lamp: ['#8a8e98', '#c8bcaa'],
  goal: {
    post: CITY_SCHOOL_STADIUM.post,
    net: ['#8c8a8a', '#bcbcba', CITY_SCHOOL_STADIUM.net],
  },
};
