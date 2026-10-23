import { click, hiss, thump } from '../layers.js';

// heavy pressed with too little bar: a dull click and a short downward buzz that dies at once
export function heavyEmpty(live, start) {
  click(live, { start, volume: 0.06, frequency: 900 });
  thump(live, { start, from: 220, to: 110, duration: 0.12, volume: 0.12 });
  const fizz = { type: 'bandpass', from: 1400, to: 500, resonance: 3 };
  hiss(live, { start, ...fizz, attack: 0.005, duration: 0.12, volume: 0.04 });
}
