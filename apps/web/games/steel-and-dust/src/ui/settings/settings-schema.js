import { DIFFICULTIES } from '../../data/difficulty.js';
import { SKINS } from '../../data/skins/skins.js';

const onOff = (value) => (value ? 'On' : 'Off');
const pick = (labels) => (value) => labels[value];
const skinName = (id) => (SKINS[id] ?? SKINS.classic).name;
const isTouchOn = ({ isTouchOn: touchOn }) => touchOn();

const skinRow = (key, label) => ({
  key,
  label,
  options: Object.keys(SKINS),
  format: skinName,
  note: 'Classic: a stick and round buttons. Dusk: a d-pad and glass buttons over the fight',
  visible: isTouchOn,
});

// `visible` gets { isTouchOn, canVibrate, settings }; a row with an `action` has a button that
// opens that menu instead of a stepper
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
    visible: isTouchOn,
  },
  {
    key: 'haptics',
    label: 'Vibration',
    options: [false, true],
    format: onOff,
    note: 'Rumbles the gamepad or phone you play with',
    visible: ({ canVibrate }) => canVibrate,
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
  skinRow('skinLandscape', 'Skin held sideways'),
  skinRow('skinPortrait', 'Skin held upright'),
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
  },
  {
    key: 'buttonLayout',
    label: 'Button layout',
    action: 'layout',
    format: (value) => (value ? 'Custom' : 'Default'),
    note: 'Move and resize the controls of each skin, for each way you hold the phone',
    visible: isTouchOn,
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
