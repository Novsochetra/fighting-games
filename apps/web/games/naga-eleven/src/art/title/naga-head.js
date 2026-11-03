// One head of the great Naga, seen from the front: a flame crest, a gold face with a jade brow,
// red eyes and fangs. Letters: o outline, g G h gold dark to light, j the jade brow, J k the face,
// e eye, w the eye's light and the fangs, r the mouth.
export const NAGA_HEAD = [
  '........o.o.o........',
  '.......ohohoho.......',
  '......ohGhGhGho......',
  '.....ohGGGGGGGho.....',
  '...oohGGjJJJjGGhoo...',
  '..ohGGjJkkkkkJjGGho..',
  '.ohGGjJJkkkkkJJjGGho.',
  '.oGGjJJJJkkkJJJJjGGo.',
  'ohGGeeeJJJkJJJeeeGGho',
  'oGGewweJJJJJJJewweGGo',
  'oGGgeeeJJJJJJJeeegGGo',
  '.oGGgGjJJJJJJJjGgGGo.',
  '.ogGGGGjJJJJJjGGGGgo.',
  '..ogGGGGjJJJjGGGGgo..',
  '..oggGGGGjJjGGGGggo..',
  '...oggGGGGJGGGGggo...',
  '...ogggGGGGGGGgggo...',
  '....owrrrrrrrrrwo....',
  '.....owrrrrrrrwo.....',
  '......ogggggggo......',
  '.......ooooooo.......',
];

// where in the head its eyes catch the light
export const NAGA_EYES = [
  { x: 5, y: 9 },
  { x: 15, y: 9 },
];

export const nagaHeadKeys = (art) => ({
  o: art.gold[0],
  g: art.gold[2],
  G: art.gold[3],
  h: art.gold[4],
  j: art.jade[2],
  J: art.gold[3],
  k: art.gold[4],
  e: art.eye[0],
  w: art.eye[1],
  r: art.gold[1],
});
