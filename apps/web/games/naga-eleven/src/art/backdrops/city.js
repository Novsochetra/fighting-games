// Phnom Penh: shophouses against the sunset, tuk-tuks and wires; the federation office over the
// city by day; the airport's glass wall; a hotel room above someone else's city at night.

const SUNSET = ['#26244e', '#433064', '#723c70', '#a84a66', '#d8644e', '#f2924a', '#fcc46a'];

export const CITY_STREET_ART = {
  sky: SUNSET,
  sun: { core: '#fff2c2', rim: '#ffd884', glow: [SUNSET[6], '#ffd884', '#ffe8a8'] },
  cloud: ['#5a3466', '#8a3e62', '#f2924a'],
  far: ['#8a4a6e', '#a8546a'],
  walls: [
    ['#3a2a44', '#56385a', '#d8644e'],
    ['#3a3042', '#5a4a5a', '#f2924a'],
    ['#2e2a40', '#4a3e58', '#d8644e'],
  ],
  dark: '#1a1424',
  rail: '#6a5468',
  lit: ['#ffd884', '#f2924a', '#fcc46a'],
  signs: ['#a83a3a', '#3a6a8a', '#c8902e'],
  wire: '#140f1c',
  road: ['#1e1828', '#2c2234', '#4a3444', '#a8546a'],
  canopy: ['#2a5a6a', '#3a8a8a', '#8a2a3a', '#c8463e'],
  plant: '#2e4a32',
};

const DAY = ['#3c70c0', '#5486cc', '#6e9cd6', '#8cb2dc', '#aec8e0'];

export const FEDERATION_ART = {
  sky: DAY,
  towers: [
    ['#7a8aa8', '#94a4bc', '#b8c4d4'],
    ['#8a8c9a', '#a8aab4', '#c8c8cc'],
  ],
  river: ['#6a8aa0', '#8aa8bc'],
  trees: ['#4a6a4a', '#6a8a5a'],
  wall: ['#2a2224', '#4a3a36', '#6e5648', '#94765c', '#b89878', '#d8bc98'],
  wood: ['#2a1612', '#4a2618', '#6e3a20', '#94562c', '#b8783e'],
  paper: ['#b8ac98', '#e8e0cc', '#fffaf0'],
  seal: '#b8282e',
  green: ['#2e4a2a', '#4a7034'],
  gold: ['#8a6420', '#d8a83a', '#f8dc7a'],
  blind: '#d8d0c0',
};

export const AIRPORT_ART = {
  sky: ['#4a7ac8', '#6a92d0', '#8aacd8', '#b0c8e0', '#d8e0e4'],
  tarmac: ['#4a4c58', '#6a6c78', '#8a8c94'],
  grass: ['#5a7a44', '#7a9a52'],
  plane: ['#7a8494', '#b4bcc8', '#e4e8ee', '#ffffff'],
  stripe: ['#b8282e', '#1e3a8a'],
  frame: ['#1a1c24', '#2e323e', '#4a5060'],
  floor: ['#2a2c36', '#3e424e', '#5a606c', '#8a90a0'],
  board: ['#0c0e14', '#1a1e28', '#f0b030', '#a87420'],
  seat: ['#1e3a6a', '#2e5a9a'],
};

const NIGHT = ['#06081a', '#0c1230', '#141c44', '#1e2a58', '#2e3c6a'];

export const HOTEL_NIGHT_ART = {
  sky: NIGHT,
  towers: ['#0a0e22', '#121a36', '#1a2444'],
  windows: ['#ffd884', '#f0b05a', '#a8c8f0', '#5a6a9a'],
  beacon: '#ff4040',
  room: ['#0e0a14', '#1a121e', '#2a1a24', '#40262c', '#5e3832', '#86523e', '#b0744e', '#dca066'],
  curtain: ['#2a1420', '#4a2030', '#6e3040'],
  sheet: ['#5a5a7a', '#8a8aa8', '#c8c4d8', '#f0ecf4'],
  shirt: ['#7a1420', '#b8202e', '#f0e8e0'],
  lamp: ['#fff4c8', '#ffd884'],
};
