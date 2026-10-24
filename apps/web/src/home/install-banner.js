import { installOffer, isSnoozed } from './install-offer.js';

function findElements(document) {
  const byId = (id) => document.getElementById(id);
  return { banner: byId('install'), add: byId('install-add'), close: byId('install-close') };
}

// The root's class lets a short screen lift the hero's buttons above the banner.
function showOffer(banner, offer) {
  banner.hidden = !offer;
  banner.ownerDocument.documentElement.classList.toggle('has-install-banner', Boolean(offer));
  if (offer) {
    banner.dataset.offer = offer;
  }
}

function wireButtons({ elements, state, sound, snooze, refresh, listen }) {
  listen(elements.add, 'click', () => {
    const { prompt } = state;
    state.prompt = null;
    refresh();
    sound.play('sheetOpen');
    prompt?.prompt();
    prompt?.userChoice.then(({ outcome }) => {
      if (outcome !== 'accepted') {
        snooze();
      }
    });
  });
  listen(elements.close, 'click', () => {
    snooze();
    refresh();
    sound.play('sheetClose');
  });
}

export function wireInstallBanner({ document, installer, preferences, sound, signal }) {
  const elements = findElements(document);
  const state = { prompt: null };
  const listen = (target, type, listener) => target.addEventListener(type, listener, { signal });
  const refresh = () =>
    showOffer(
      elements.banner,
      installOffer({
        isInstalled: installer.isInstalled(),
        isSnoozed: isSnoozed(preferences.installDismissedAt(), installer.now()),
        hasPrompt: state.prompt !== null,
        isIos: installer.isIos,
      }),
    );
  listen(installer.events, 'beforeinstallprompt', (event) => {
    // Chrome would otherwise put its own install bar on top of the banner.
    event.preventDefault();
    state.prompt = event;
    refresh();
  });
  listen(installer.events, 'appinstalled', () => {
    state.prompt = null;
    refresh();
  });
  wireButtons({
    elements,
    state,
    sound,
    snooze: () => preferences.dismissInstall(installer.now()),
    refresh,
    listen,
  });
  installer.registerWorker();
  refresh();
  return { elements, refresh };
}
