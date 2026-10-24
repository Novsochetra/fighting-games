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

// The install banner takes the same place, so the arcade asks for one thing at a time.
const isInstallUp = (document) => document.documentElement.classList.contains('has-install-banner');

function lookForReturn(preferences) {
  const playCount = preferences.playCount();
  const isReturn = isBackFromGame({ playCount, seenPlays: preferences.supportSeenPlays() });
  preferences.markSupportSeen(playCount);
  return { isReturn, playCount };
}

export function wireSupportBanner({ document, preferences, sound, signal, now }) {
  const elements = findElements(document);

  function offer() {
    const isWanted = shouldOfferSupport({
      ...lookForReturn(preferences),
      hasGiven: preferences.hasGiven(),
      snoozedUntil: preferences.supportSnoozedUntil(),
      now: now(),
    });
    if (!isWanted || isInstallUp(document) || !elements.banner.hidden) {
      return;
    }
    preferences.snoozeSupport(now() + SUPPORT_RESHOW_MS);
    showBanner(elements.banner, true);
  }

  const notNow = () => {
    preferences.snoozeSupport(now() + SUPPORT_SNOOZE_MS);
    showBanner(elements.banner, false);
    sound.play('sheetClose');
  };
  elements.close.addEventListener('click', notNow, { signal });
  // The back/forward cache brings this page back without loading it again, so it looks again then.
  const onPageShow = (event) => event.persisted && offer();
  document.defaultView.addEventListener('pageshow', onPageShow, { signal });
  return { offer, elements };
}
