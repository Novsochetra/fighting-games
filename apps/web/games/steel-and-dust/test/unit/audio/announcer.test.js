import { describe, expect, it } from 'vitest';
import { announce, createAnnouncer, primeAnnouncer } from '../../../src/audio/announcer.js';

class FakeUtterance {
  constructor(text) {
    this.text = text;
  }
}

function fakeSpeech(voices = []) {
  const said = [];
  const synth = {
    cancelled: 0,
    getVoices: () => voices,
    cancel() {
      synth.cancelled++;
    },
    speak: (utterance) => said.push(utterance),
  };
  return {
    scope: { speechSynthesis: synth, SpeechSynthesisUtterance: FakeUtterance },
    said,
    synth,
  };
}

const gameWith = ({ muted = false, sfx = 80 } = {}) => ({ muted, settings: { sfx } });

describe('the announcer', () => {
  it('speaks a line low and steady at the sound effects volume, cutting off the one before', () => {
    const { scope, said, synth } = fakeSpeech();
    const announcer = createAnnouncer(scope);
    announce(announcer, gameWith(), 'Mission 1 complete!');
    expect(said).toHaveLength(1);
    expect(said[0]).toMatchObject({ text: 'Mission 1 complete!', lang: 'en-US', volume: 0.8 });
    expect(said[0].pitch).toBeLessThan(1);
    expect(synth.cancelled).toBe(1);
  });

  it('keeps quiet when the game is muted or its sound effects are off', () => {
    const { scope, said } = fakeSpeech();
    const announcer = createAnnouncer(scope);
    announce(announcer, gameWith({ muted: true }), 'Mission 2, start!');
    announce(announcer, gameWith({ sfx: 0 }), 'Mission 2, start!');
    expect(said).toEqual([]);
  });

  it("picks an English voice on the device over one from a server, or the browser's own", () => {
    const voices = [
      { name: 'Remote', lang: 'en-US', localService: false },
      { name: 'Français', lang: 'fr-FR', localService: true },
      { name: 'Local', lang: 'en-GB', localService: true },
    ];
    const { scope, said } = fakeSpeech(voices);
    announce(createAnnouncer(scope), gameWith(), 'Mission 3, start!');
    expect(said[0].voice.name).toBe('Local');
    const bare = fakeSpeech();
    announce(createAnnouncer(bare.scope), gameWith(), 'Mission 3, start!');
    expect(bare.said[0].voice).toBeUndefined();
  });

  it('says nothing, once, on the first tap, so a phone lets it speak later', () => {
    const { scope, said } = fakeSpeech();
    const announcer = createAnnouncer(scope);
    primeAnnouncer(announcer);
    primeAnnouncer(announcer);
    expect(said).toHaveLength(1);
    expect(said[0]).toMatchObject({ text: '', volume: 0 });
  });

  it('goes quietly on in a browser that cannot speak or refuses to', () => {
    const none = createAnnouncer({});
    expect(() => announce(none, gameWith(), 'Mission 4, start!')).not.toThrow();
    expect(() => primeAnnouncer(none)).not.toThrow();
    const { scope, synth } = fakeSpeech();
    synth.speak = () => {
      throw new Error('not allowed');
    };
    expect(() => announce(createAnnouncer(scope), gameWith(), 'Mission 4, start!')).not.toThrow();
  });
});
