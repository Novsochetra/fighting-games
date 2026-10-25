import { EVENTS } from './analytics-events.js';
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

function wireButtons({ elements, state, actions, listen }) {
  const { sound, snooze, refresh, track } = actions;
  listen(elements.add, 'click', () => {
    const { prompt } = state;
    state.prompt = null;
    refresh();
    sound.play('sheetOpen');
    track(EVENTS.install);
    prompt?.prompt();
    prompt?.userChoice.then(({ outcome }) => {
      track(EVENTS.installChoice, { outcome });
      if (outcome !== 'accepted') {
        snooze();
      }
    });
  });
  listen(elements.close, 'click', () => {
    snooze();
    refresh();
    sound.play('sheetClose');
    track(EVENTS.installDismiss);
  });
}

function currentOffer({ installer, preferences, state }) {
  return installOffer({
    isInstalled: installer.isInstalled(),
    isSnoozed: isSnoozed(preferences.installDismissedAt(), installer.now()),
    hasPrompt: state.prompt !== null,
    isIos: installer.isIos,
  });
}

export function wireInstallBanner({ document, installer, preferences, sound, signal, track }) {
  const elements = findElements(document);
  const state = { prompt: null };
  const listen = (target, type, listener) => target.addEventListener(type, listener, { signal });
  const refresh = () => {
    const wasHidden = elements.banner.hidden;
    const offer = currentOffer({ installer, preferences, state });
    showOffer(elements.banner, offer);
    if (offer && wasHidden) {
      track(EVENTS.installShown, { offer });
    }
  };
  listen(installer.events, 'beforeinstallprompt', (event) => {
    // Chrome would otherwise put its own install bar on top of the banner.
    event.preventDefault();
    state.prompt = event;
    refresh();
  });
  listen(installer.events, 'appinstalled', () => {
    state.prompt = null;
    refresh();
    track(EVENTS.installed);
  });
  const snooze = () => preferences.dismissInstall(installer.now());
  wireButtons({ elements, state, actions: { sound, snooze, refresh, track }, listen });
  installer.registerWorker();
  refresh();
  return { elements, refresh };
}
