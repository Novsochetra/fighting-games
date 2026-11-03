import { FRAME } from '../view.js';

// The village's goal from in front, as the venue draws it (goal-style.js, bambooGoal): two bamboo
// poles ringed with a node every few pixels and a bar laid across them that sags in the middle,
// running a little past each post and lashed to it with rope. `post` runs deep to light
const WIDTH = 3;
const SAG = 2;
const OVERHANG = 4;
const TOP = FRAME.bar - 1;
const BAR = { left: FRAME.left - WIDTH - OVERHANG, right: FRAME.right + WIDTH - 1 + OVERHANG };

const barTop = (x) =>
  TOP + Math.round(SAG * Math.sin((Math.PI * (x - BAR.left)) / (BAR.right - BAR.left)));

function pole(pen, left, post) {
  const height = FRAME.line - TOP + 1;

  pen.rect([left - 1, TOP, WIDTH + 2, height + 1], post[0]);
  pen.rect([left, TOP, WIDTH, height], post[2]);
  pen.rect([left, TOP, 1, height], post[3]);
  pen.rect([left + WIDTH - 1, TOP, 1, height], post[1]);

  for (let y = FRAME.line - 6, i = 0; y > TOP + 4; y -= 7 + (i % 3), i += 1) {
    pen.rect([left - 1, y, WIDTH + 2, 1], post[0]);
    pen.dot(left, y + 1, post[3]);
    pen.dot(left + WIDTH - 1, y - 1, post[0]);
  }
}

// the bar in runs of one height, its nodes every so often and its cut ends dark
function bar(pen, post) {
  let start = BAR.left;

  for (let x = BAR.left + 1; x <= BAR.right + 1; x += 1) {
    if (x > BAR.right || barTop(x) !== barTop(start)) {
      const y = barTop(start);
      const width = x - start;

      pen.rect([start, y - 1, width, WIDTH + 2], post[0]);
      pen.rect([start, y, width, 1], post[3]);
      pen.rect([start, y + 1, width, 1], post[2]);
      pen.rect([start, y + 2, width, 1], post[1]);
      start = x;
    }
  }

  for (let x = BAR.left + 9; x < BAR.right - 4; x += 11 + (x % 3)) {
    pen.rect([x, barTop(x), 1, WIDTH], post[0]);
    pen.dot(x + 1, barTop(x), post[3]);
  }

  pen.rect([BAR.left - 1, barTop(BAR.left) - 1, 1, WIDTH + 2], post[0]);
  pen.rect([BAR.right + 1, barTop(BAR.right) - 1, 1, WIDTH + 2], post[0]);
}

// rope wound round each joint of bar and post, a loose end hanging down
function lashing(pen, left, rope) {
  const [shade, light] = rope;
  const y = barTop(left);

  for (let i = 0; i < 4; i += 1) {
    pen.dot(left - 1 + i, y - 1 + i, light);
    pen.dot(left + 2 - i, y - 1 + i, light);
    pen.dot(left - 1 + i, y + i, shade);
  }

  pen.rect([left + WIDTH, y + 3, 1, 3], light);
  pen.dot(left + WIDTH, y + 6, shade);
}

export function drawBambooFrame(pen, { post, rope }) {
  const posts = [FRAME.left - WIDTH, FRAME.right];

  posts.forEach((left) => pole(pen, left, post));
  bar(pen, post);
  posts.forEach((left) => lashing(pen, left, rope));

  for (const left of posts) {
    pen.rect([left - 2, FRAME.line + 1, WIDTH + 4, 1], post[0]);
  }
}
