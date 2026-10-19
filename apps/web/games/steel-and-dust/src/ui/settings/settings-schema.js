import { DIFFICULTIES } from '../../data/difficulty.js';

const onOff = (value) => (value ? 'On' : 'Off');
const pick = (labels) => (value) => labels[value];

// `visible` gets { isTouchOn, canVibrate, settings }
export const SETTINGS_SCHEMA = [
  { group: 'Sound' },
  { key: 'music', label: 'Music', range: true },
  { key: 'sfx', label: 'Sound effects', range: true },
  { group: 'Gameplay' },
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
    visible: ({ isTouchOn }) => isTouchOn(),
  },
  { group: 'Screen' },
  {
    key: 'shake',
    label: 'Screen shake',
    options: [0, 1, 2],
    format: pick(['Off', 'Low', 'Full']),
    note: 'Also the zoom punch on big hits',
  },
  { key: 'flash', label: 'Flashes', options: [false, true], format: onOff },
  { key: 'numbers', label: 'Damage numbers', options: [false, true], format: onOff },
  { group: 'Touch controls' },
  {
    key: 'touch',
    label: 'Touch controls',
    options: ['auto', 'on', 'off'],
    format: pick({ auto: 'Auto', on: 'On', off: 'Off' }),
  },
  {
    key: 'stick',
    label: 'Joystick',
    options: ['fixed', 'float'],
    format: pick({ fixed: 'Fixed', float: 'Floating' }),
    note: 'Fixed stays in the corner; floating appears where you touch',
  },
  {
    key: 'buttonSize',
    label: 'Button size',
    options: [0, 1, 2],
    format: pick(['Small', 'Medium', 'Large']),
  },
  {
    key: 'haptics',
    label: 'Vibration',
    options: [false, true],
    format: onOff,
    visible: ({ canVibrate }) => canVibrate,
  },
  { group: 'Training' },
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
