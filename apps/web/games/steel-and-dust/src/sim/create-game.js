import { createInput } from './input/create-input.js';
import { resetRun } from './reset-run.js';

const SILENT_IO = {
  sfx() {},
  announce() {},
  vibrate() {},
  saveRecords() {},
  saveHints() {},
  saveSettings() {},
  setMuted() {},
};

function createCamera() {
  return {
    x: 0,
    shakeTime: 0,
    shakeAmount: 0,
    kickX: 0,
    kickY: 0,
    zoom: { time: 0, duration: 1, x: 0, y: 0, amount: 0 },
  };
}

export function createGame({ settings, device, records, hintsSeen, io }) {
  const game = {
    mode: 'title',
    tickCount: 0,
    settings,
    device,
    records,
    hintsSeen,
    io: { ...SILENT_IO, ...io },
    muted: false,
    newBestScore: false,
    hint: null,
    fadeIn: 0,
    input: createInput(),
    camera: createCamera(),
  };
  resetRun(game);
  return game;
}
