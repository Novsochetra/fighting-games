import type { ArcadeStorage } from '@/services/arcade-context';

export const CONSENT = { granted: 'granted', denied: 'denied' } as const;

export const isConsentChoice = (value: unknown) =>
  Object.values(CONSENT).includes(value as (typeof CONSENT)[keyof typeof CONSENT]);

// The answer has its own key here, read through the storage alone: a browser can still hold an older
// preferences.js after a deploy, and that copy knows nothing of analytics.
export const CONSENT_KEY = 'arcade.analytics-consent';

export interface AnalyticsTag {
  event: (name: string, params: object) => void;
  grant: () => void;
  deny: () => void;
}

export interface AnalyticsSetup {
  isEnabled?: boolean;
  loadTag?: () => AnalyticsTag | null | undefined;
}

const NO_TAG: AnalyticsTag = { event: () => {}, grant: () => {}, deny: () => {} };

// Google's tag loads only once the player says yes, and an event goes out only while that yes
// stands, so a no (even one given after a yes) stops every event at once.
export function createAnalytics({
  isEnabled = false,
  loadTag = () => NO_TAG,
  storage,
}: AnalyticsSetup & { storage: ArcadeStorage }) {
  const state: { tag: AnalyticsTag | null } = { tag: null };
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

    track(name: string, params: object = {}) {
      if (isGranted()) {
        state.tag!.event(name, params);
      }
    },
  };
}
