import { describe, expect, it } from 'vitest';
import { createInput } from '../../../../src/sim/input-state.js';
import {
  createSceneSession,
  drawSceneSession,
  isSceneSessionDone,
  stepSceneSession,
  tapSceneSession,
} from '../../../../src/ui/flow/scene-session.js';
import { createPixelCanvas } from '../../../support/pixel-canvas.js';

const SCENE = {
  backdrop: 'village-dawn',
  mood: 'calm',
  lines: [
    { speaker: 'ta-sok', mood: 'happy', side: 'left', text: { en: 'Hi.', km: 'សួស្តី។' } },
    { speaker: 'sochetra', mood: 'determined', side: 'right', text: { en: 'Go!', km: 'ទៅ!' } },
  ],
};

function pressPass(session, input) {
  input.sources.keys.held.pass = true;
  stepSceneSession(session, input);
  input.sources.keys.held.pass = false;
  stepSceneSession(session, input);
}

describe('a scene on its own screen', () => {
  it('plays line by line with pass, and ends after the last', () => {
    const input = createInput();
    const session = createSceneSession(SCENE, { lang: 'en', heroAge: 'child' });

    for (let i = 0; i < 6; i += 1) {
      pressPass(session, input);
    }

    expect(isSceneSessionDone(session)).toBe(true);
  });

  it('asks on a tap of the skip tag, and ends on a second', () => {
    const session = createSceneSession(SCENE, { lang: 'en', heroAge: 'child' });

    tapSceneSession(session, { x: 700, y: 28 });
    expect(session.tapped).toBe('skip');
    stepSceneSession(session, createInput());
    expect(isSceneSessionDone(session)).toBe(false);

    tapSceneSession(session, { x: 700, y: 28 });
    stepSceneSession(session, createInput());
    expect(isSceneSessionDone(session)).toBe(true);
  });

  it('draws full screen or over a match', () => {
    for (const overlay of [false, true]) {
      const canvas = createPixelCanvas(768, 432);
      const session = createSceneSession(SCENE, { lang: 'km', heroAge: 'child', overlay });

      stepSceneSession(session, createInput());

      expect(() => drawSceneSession(canvas.getContext('2d'), session, { tick: 4 })).not.toThrow();
      expect(canvas.data.some((value) => value > 0)).toBe(true);
    }
  });
});
