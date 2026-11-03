// what each control does on the keys, a pad and the touch screen, and its notes (a tap, a hold,
// with no ball); a cap is the word printed on the key or button, or a string to say for one that
// has no word on it
export const DEVICES = ['keys', 'pad', 'touch'];

const named = (key) => ({ say: key });

export const CONTROLS = [
  {
    does: 'doMove',
    keys: ['W', 'A', 'S', 'D', named('capArrows')],
    pad: [named('capStick'), named('capDpad')],
    touch: [named('capStick')],
  },
  {
    does: 'doPass',
    notes: ['doPassTap', 'doPassHold', 'doPassFull', 'doPassAlso'],
    keys: ['J', 'Z', 'Enter', 'Space'],
    pad: ['A'],
    touch: ['PASS'],
  },
  {
    does: 'doShoot',
    notes: ['doShootAlso', 'doShootFull', 'doShootFirst', 'doShootSlide'],
    keys: ['K', 'X'],
    pad: ['X', 'B'],
    touch: ['SHOOT'],
  },
  {
    does: 'doRun',
    notes: ['doRunTwice'],
    keys: ['L', 'Shift'],
    pad: ['RB', 'RT'],
    touch: ['RUN'],
  },
  { does: 'doPause', keys: ['Esc', 'P'], pad: ['Start'], touch: ['II'] },
];

// a player on a phone learns the touch controls first, and anyone else the keys
export const firstDevice = (settings) => (settings?.touch === 'on' ? 'touch' : 'keys');
