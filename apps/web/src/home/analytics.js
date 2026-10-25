export const CONSENT = { granted: 'granted', denied: 'denied' };

export const isConsentChoice = (value) => Object.values(CONSENT).includes(value);

const NO_TAG = { event: () => {}, grant: () => {}, deny: () => {} };

// Google's tag loads only once the player says yes, and an event goes out only while that yes
// stands, so a no (even one given after a yes) stops every event at once.
export function createAnalytics({ isEnabled = false, loadTag = () => NO_TAG, preferences }) {
  const state = { tag: null };
  const isGranted = () => isEnabled && preferences.analyticsConsent() === CONSENT.granted;
  const startTag = () => {
    state.tag ??= loadTag() ?? NO_TAG;
    return state.tag;
  };
  if (isGranted()) {
    startTag();
  }
  return {
    isEnabled: () => isEnabled,
    needsAnswer: () => isEnabled && !isConsentChoice(preferences.analyticsConsent()),
    allow() {
      if (isEnabled) {
        preferences.setAnalyticsConsent(CONSENT.granted);
        startTag().grant();
      }
    },
    refuse() {
      preferences.setAnalyticsConsent(CONSENT.denied);
      state.tag?.deny();
    },
    track(name, params = {}) {
      if (isGranted()) {
        state.tag.event(name, params);
      }
    },
  };
}
