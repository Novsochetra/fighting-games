// The story's dialogue: temple gold on a deep night blue, with the red of a Khmer silk for the
// speaker's name. Each ramp turns as it goes, the gold toward red-brown in its shadows and toward
// cream in its lights, the blue toward violet as it darkens.
export const GOLD = ['#3e170c', '#7d3812', '#c0701c', '#e8a734', '#ffd76e', '#fff5cc'];

export const NIGHT = ['#060819', '#0d1342', '#141d62', '#1b2a80', '#2a3fa2', '#5677d8', '#a7c6ff'];

export const PANEL = ['#1e2d86', '#1a2777', '#162067', '#121a58', '#0e1449'];

export const SILK = ['#2e0712', '#5c1020', '#931c2e', '#c8343e', '#ef6a5a'];

// the letters the dialogue's pixel maps are drawn in
export const ART_KEYS = {
  o: NIGHT[0],
  0: GOLD[0],
  1: GOLD[1],
  2: GOLD[2],
  3: GOLD[3],
  4: GOLD[4],
  5: GOLD[5],
  a: NIGHT[1],
  b: NIGHT[2],
  c: NIGHT[3],
  d: NIGHT[4],
  e: NIGHT[5],
  f: NIGHT[6],
  k: SILK[0],
  l: SILK[1],
  m: SILK[2],
  n: SILK[3],
  p: SILK[4],
  v: PANEL[0],
  w: PANEL[1],
  x: PANEL[2],
  y: PANEL[3],
  z: PANEL[4],
};

export const DIALOGUE = {
  text: '#fff3d6',
  textShadow: NIGHT[0],
  name: '#fff1c2',
  nameShadow: SILK[0],
  narration: '#f8eccc',
  narrationShadow: '#000000',
  caption: '#03040e',
  captionAlpha: 0.8,
  boxShadow: '#000000',
  boxShadowAlpha: 0.4,
  letterbox: '#000000',
  fade: '#000000',
  skip: '#fff3d6',
  skipAsking: GOLD[4],
  skipPlate: NIGHT[0],
  skipPlateAlpha: 0.92,
  skipEdgeLight: GOLD[3],
  skipEdge: GOLD[1],
  skipEdgeAsking: GOLD[5],
  skipFill: GOLD[4],
  skipTrack: NIGHT[3],
};
