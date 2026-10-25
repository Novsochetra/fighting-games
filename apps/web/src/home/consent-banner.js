function findElements(document) {
  const byId = (id) => document.getElementById(id);
  return {
    banner: byId('consent'),
    allow: byId('consent-allow'),
    refuse: byId('consent-refuse'),
    choices: byId('privacy-choices'),
    reopen: byId('privacy-open'),
  };
}

// The root's class lets a short screen lift the hero's buttons above the banner, and keeps the
// install and support banners out of its place until the player answers.
function showBanner(banner, isShown) {
  banner.hidden = !isShown;
  banner.ownerDocument.documentElement.classList.toggle('has-consent-banner', isShown);
}

export function wireConsentBanner({ document, analytics, sound, signal }) {
  const elements = findElements(document);
  const listen = (target, listener) => target.addEventListener('click', listener, { signal });
  const answer = (choose) => () => {
    choose();
    showBanner(elements.banner, false);
    sound.play('sheetClose');
  };
  listen(elements.allow, answer(analytics.allow));
  listen(elements.refuse, answer(analytics.refuse));
  // Saying no later must be as easy as saying yes, so the foot of the page asks again.
  listen(elements.reopen, () => {
    showBanner(elements.banner, true);
    sound.play('sheetOpen');
  });
  elements.choices.hidden = !analytics.isEnabled();
  showBanner(elements.banner, analytics.needsAnswer());
  return { elements };
}
