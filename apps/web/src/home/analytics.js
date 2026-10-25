export const CONSENT = { granted: 'granted', denied: 'denied' };

export const isConsentChoice = (value) => Object.values(CONSENT).includes(value);

// The answer has its own key here, read through the storage alone: a browser can still hold an older
// preferences.js after a deploy, and that copy knows nothing of analytics.
export const CONSENT_KEY = 'arcade.analytics-consent';

const NO_TAG = { event: () => {}, grant: () => {}, deny: () => {} };

// Google's tag loads only once the player says yes, and an event goes out only while that yes
// stands, so a no (even one given after a yes) stops every event at once.
export function createAnalytics({ isEnabled = false, loadTag = () => NO_TAG, storage }) {
  const state = { tag: null };
  const answer = () => storage.read(CONSENT_KEY);
  const isGranted = () => isEnabled && answer() === CONSENT.granted;
  const startTag = () => {
    state.tag ??= loadTag() ?? NO_TAG;
    return state.tag;
  };
  if (isGranted()) {
    startTag();
  }
  return {
    isEnabled: () => isEnabled,
    needsAnswer: () => isEnabled && !isConsentChoice(answer()),
    allow() {
      if (isEnabled) {
        storage.write(CONSENT_KEY, CONSENT.granted);
        startTag().grant();
      }
    },
    refuse() {
      storage.write(CONSENT_KEY, CONSENT.denied);
      state.tag?.deny();
    },
    track(name, params = {}) {
      if (isGranted()) {
        state.tag.event(name, params);
      }
    },
  };
}
