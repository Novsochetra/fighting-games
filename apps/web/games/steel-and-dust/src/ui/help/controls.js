import { keycap as key, table } from './key-label.js';

function touchRows(stick) {
  return [
    [
      'Run',
      stick === 'fixed'
        ? 'drag the stick in the bottom-left corner'
        : 'drag anywhere on the left half of the screen',
    ],
    ['ATTACK', 'light attack; hold it to keep the combo going'],
    ['HEAVY', 'heavy attack, uses a little ULT bar; hold to charge, let go to release'],
    ['JUMP', 'jump; push the stick sideways to jump that way'],
    ['DASH', 'quick invincible dash, works once in the air'],
    ['Launcher', 'push the stick up or down, then HEAVY'],
    ['Low sweep', 'push the stick down, then ATTACK'],
    ['Rising strike', 'push the stick up, then ATTACK'],
    ['Air pogo', 'in the air, stick down + ATTACK'],
    ['Air dive', 'in the air, stick down + HEAVY'],
    ['ULT', 'glows when half the bar is full'],
    ['Pause', 'II in the top corner'],
  ];
}

const KEY_ROWS = [
  ['Run', `${key('←')} ${key('→')} or ${key('A')} ${key('D')}`],
  ['Jump', `${key('↑')} / ${key('W')} / ${key('Space')}, hold a direction to jump that way`],
  ['Dash', `${key('Shift')} or tap ${key('←')} / ${key('→')} twice (invincible)`],
  ['Light attack', `${key('J')} or ${key('Z')}`],
  ['Heavy attack', `${key('K')} or ${key('X')}, hold to charge; uses a little ULT bar`],
  ['Launcher', `${key('↓')} + ${key('K')}, or ${key('↑')} + ${key('K')} to jump after them`],
  ['Low sweep', `${key('↓')} + ${key('J')}`],
  ['Rising strike', `${key('↑')} + ${key('J')} together`],
  ['Air pogo', `in the air, ${key('↓')} + ${key('J')}`],
  ['Air dive', `in the air, ${key('↓')} + ${key('K')}`],
  ['Ultimate', `${key('L')} or ${key('U')} when the ULT bar is half full`],
  ['Pause', `${key('Esc')} or ${key('P')}`],
  ['Full screen', key('F')],
  ['Sound', `${key('M')} mutes`],
];

const PAD_ROWS = [
  ['Run', 'left stick or d-pad'],
  ['Jump / Dash', 'A / B'],
  ['Light / Heavy', 'X / Y (hold Y to charge)'],
  ['Ultimate', 'RB or RT'],
  ['Pause', 'Start'],
];

export function controlsHtml({ touch, stick }) {
  const touchTable = table('Touch', touchRows(stick));
  const keys = table('Keyboard', KEY_ROWS);
  const pad = table('Gamepad', PAD_ROWS);
  return touch ? touchTable + keys + pad : keys + pad + touchTable;
}
