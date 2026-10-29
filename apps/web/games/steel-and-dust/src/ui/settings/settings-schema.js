import { DIFFICULTIES } from '../../data/difficulty.js';
import { SKINS } from '../../data/skins/skins.js';

const onOff = (value) => (value ? 'On' : 'Off');
const pick = (labels) => (value) => labels[value];
const skinName = (id) => (SKINS[id] ?? SKINS.classic).name;
const isTouchOn = ({ isTouchOn: touchOn }) => touchOn();

const SOUND = [
  { key: 'music', label: 'Music', range: true },
  { key: 'sfx', label: 'Sound effects', range: true },
];

const GAMEPLAY = [
  {
    key: 'difficulty',
    label: 'Difficulty',
    options: [0, 1, 2],
    format: (value) => DIFFICULTIES[value].name,
    note: 'Easy: raiders hit softer and attack one at a time',
  },
  {
    key: 'aim',
    label: 'Auto-aim',
    options: [false, true],
    format: onOff,
    note: 'Attacks turn toward the nearest raider',
  },
  {
    key: 'holdToCombo',
    label: 'Hold ATTACK to combo',
    options: [false, true],
    format: onOff,
    note: 'Touch: keep the button held to keep swinging',
    visible: isTouchOn,
  },
  {
    key: 'haptics',
    label: 'Vibration',
    options: [false, true],
    format: onOff,
    note: 'Rumbles the gamepad or phone you play with, and ticks as you press the touch controls',
    visible: ({ canVibrate }) => canVibrate,
  },
];

const SCREEN = [
  {
    key: 'shake',
    label: 'Screen shake',
    options: [0, 1, 2],
    format: pick(['Off', 'Low', 'Full']),
    note: 'Also the zoom punch on big hits',
  },
  { key: 'flash', label: 'Flashes', options: [false, true], format: onOff },
  { key: 'numbers', label: 'Damage numbers', options: [false, true], format: onOff },
];

const TOUCH_CONTROLS = [
  {
    key: 'touch',
    label: 'Touch controls',
    options: ['auto', 'on', 'off'],
    format: pick({ auto: 'Auto', on: 'On', off: 'Off' }),
  },
  {
    key: 'skin',
    label: 'Skin and layout',
    action: 'skins',
    format: skinName,
    note: 'Pick the skin you play with, and move or resize its controls',
    visible: isTouchOn,
  },
  {
    key: 'padOpacity',
    label: 'Controls opacity',
    options: [1, 0.8, 0.6, 0.4],
    format: (value) => `${Math.round(value * 100)}%`,
    note: 'Lets more of the fight show through the buttons',
    visible: isTouchOn,
  },
  {
    key: 'stick',
    label: 'Joystick',
    options: ['fixed', 'float', 'hidden'],
    format: pick({ fixed: 'Fixed', float: 'Floating', hidden: 'Hidden' }),
    note: 'Fixed stays in the corner; floating appears where you touch; hidden clears the left side',
  },
  {
    key: 'padHidesTouch',
    label: 'Hide with a gamepad',
    options: [false, true],
    format: onOff,
    note: 'Touch controls step aside while you play with a gamepad; a touch brings them back',
  },
  {
    key: 'buttonSize',
    label: 'Button size',
    options: [0, 1, 2],
    format: pick(['Small', 'Medium', 'Large']),
    note: 'Large grows them as far as your screen has room for',
  },
];

const TRAINING = [
  {
    key: 'training',
    label: 'Training tools',
    options: [false, true],
    format: onOff,
    note: '1–4 swap weapons, 0 fills ULT, H hitboxes; weapon switch in the pause menu',
  },
  {
    key: 'hitboxes',
    label: 'Show hitboxes',
    options: [false, true],
    format: onOff,
    visible: ({ settings }) => settings.training,
  },
];

// a row's `visible` gets { isTouchOn, canVibrate, settings }; a row with an `action` has an Edit
// button that opens that menu instead of a stepper. A section's `note` names
// only rows every player sees, as the others come and go with the device
export const SETTINGS_SECTIONS = [
  { id: 'sound', title: 'Sound', note: 'Music and sound effects', rows: SOUND },
  { id: 'gameplay', title: 'Gameplay', note: 'Difficulty and auto-aim', rows: GAMEPLAY },
  { id: 'screen', title: 'Screen', note: 'Shake, flashes and damage numbers', rows: SCREEN },
  { id: 'touch', title: 'Touch controls', note: 'Joystick and buttons', rows: TOUCH_CONTROLS },
  { id: 'training', title: 'Training', note: 'Weapon swaps and hitboxes', rows: TRAINING },
];

export const SETTINGS_SCHEMA = SETTINGS_SECTIONS.flatMap((section) => section.rows);

// steppers clamp; Enter / A cycles round to the first option again
export function steppedValue(definition, current, { step, wrap }) {
  if (definition.range) {
    return Math.min(100, Math.max(0, current + step * 10));
  }
  const { options } = definition;
  const next = options.indexOf(current) + step;
  if (wrap) {
    return options[(next + options.length) % options.length];
  }
  return options[Math.min(options.length - 1, Math.max(0, next))];
}
