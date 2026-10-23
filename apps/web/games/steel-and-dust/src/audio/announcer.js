// the announcer speaks in the browser's own voice: every other sound is built from oscillators and
// noise, and those cannot say a line of words
const PITCH = 0.6;
const RATE = 0.95;

export function createAnnouncer(scope) {
  const { speechSynthesis, SpeechSynthesisUtterance } = scope;
  const usable = Boolean(speechSynthesis && SpeechSynthesisUtterance);
  return {
    synth: usable ? speechSynthesis : null,
    Utterance: SpeechSynthesisUtterance,
    voice: null,
    primed: false,
  };
}

// an English voice on the device itself starts at once; one fetched from a server lags the card
function pickVoice(synth) {
  const english = synth.getVoices().filter((voice) => voice.lang?.toLowerCase().startsWith('en'));
  return english.find((voice) => voice.localService) ?? english[0] ?? null;
}

function speak(announcer, { line, volume }) {
  const { synth, Utterance } = announcer;
  const utterance = new Utterance(line);
  announcer.voice ??= pickVoice(synth);
  if (announcer.voice) {
    utterance.voice = announcer.voice;
  }
  Object.assign(utterance, { lang: 'en-US', pitch: PITCH, rate: RATE, volume });
  synth.cancel();
  synth.speak(utterance);
}

// iPhone only lets a page speak once it has spoken inside a tap, so the first tap says nothing
export function primeAnnouncer(announcer) {
  if (!announcer.synth || announcer.primed) {
    return;
  }
  announcer.primed = true;
  try {
    speak(announcer, { line: '', volume: 0 });
  } catch {
    announcer.primed = false;
  }
}

export function announce(announcer, game, line) {
  const volume = game.muted ? 0 : game.settings.sfx / 100;
  if (!announcer.synth || volume <= 0) {
    return;
  }
  try {
    speak(announcer, { line, volume });
  } catch {
    // a browser that refuses to speak leaves the cards silent; the game goes on
  }
}
