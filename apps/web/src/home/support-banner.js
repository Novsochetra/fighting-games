import { EVENTS } from './analytics-events.js';
import {
  isBackFromGame,
  shouldOfferSupport,
  SUPPORT_RESHOW_MS,
  SUPPORT_SNOOZE_MS,
} from './support-offer.js';

function findElements(document) {
  const byId = (id) => document.getElementById(id);
  return { banner: byId('support'), give: byId('support-give'), close: byId('support-close') };
}

// The root's class lets a short screen lift the hero's buttons above the banner, as for install.
function showBanner(banner, isShown) {
  banner.hidden = !isShown;
  banner.ownerDocument.documentElement.classList.toggle('has-support-banner', isShown);
}

// The install and analytics banners take the same place, so the arcade asks one thing at a time.
const isOtherBannerUp = ({ documentElement }) =>
  ['has-install-banner', 'has-consent-banner'].some((name) =>
    documentElement.classList.contains(name),
  );

function lookForReturn(preferences) {
  const playCount = preferences.playCount();
  const isReturn = isBackFromGame({ playCount, seenPlays: preferences.supportSeenPlays() });
  preferences.markSupportSeen(playCount);
  return { isReturn, playCount };
}

export function wireSupportBanner({ document, preferences, sound, signal, now, track }) {
  const elements = findElements(document);

  function offer() {
    const isWanted = shouldOfferSupport({
      ...lookForReturn(preferences),
      hasGiven: preferences.hasGiven(),
      snoozedUntil: preferences.supportSnoozedUntil(),
      now: now(),
    });
    if (!isWanted || isOtherBannerUp(document) || !elements.banner.hidden) {
      return;
    }
    preferences.snoozeSupport(now() + SUPPORT_RESHOW_MS);
    showBanner(elements.banner, true);
    track(EVENTS.supportShown);
  }

  const notNow = () => {
    preferences.snoozeSupport(now() + SUPPORT_SNOOZE_MS);
    showBanner(elements.banner, false);
    sound.play('sheetClose');
    track(EVENTS.supportDismiss);
  };
  elements.close.addEventListener('click', notNow, { signal });
  // The back/forward cache brings this page back as it was left, banner and all, without loading it
  // again: it looks again then, and steps aside for a gift made meanwhile on the supporters page.
  const onPageShow = (event) => {
    if (!event.persisted) {
      return;
    }
    if (preferences.hasGiven()) {
      showBanner(elements.banner, false);
      return;
    }
    offer();
  };
  document.defaultView.addEventListener('pageshow', onPageShow, { signal });
  return { offer, elements };
}
