import { useEffect, useReducer, useRef, useState } from 'react';
import { useArcade } from '../arcade/arcade-context';
import { useRootClass } from '../arcade/use-root-class';
import { EVENTS } from './analytics-events.js';
import { installOffer, isSnoozed } from './install-offer.js';

interface InstallPrompt extends Event {
  prompt: () => void;
  userChoice: Promise<{ outcome: string }>;
}

function useInstallPrompt() {
  const { installer, analytics } = useArcade();
  const [prompt, setPrompt] = useState<InstallPrompt | null>(null);

  useEffect(() => {
    if (!installer) {
      return undefined;
    }

    const lifetime = new AbortController();
    const options = { signal: lifetime.signal };

    installer.events.addEventListener(
      'beforeinstallprompt',
      (event) => {
        // Chrome would otherwise put its own install bar on top of the banner.
        event.preventDefault();
        setPrompt(event as InstallPrompt);
      },
      options,
    );
    installer.events.addEventListener(
      'appinstalled',
      () => {
        setPrompt(null);
        analytics.track(EVENTS.installed);
      },
      options,
    );
    installer.registerWorker();

    return () => lifetime.abort();
  }, [installer, analytics]);

  return [prompt, setPrompt] as const;
}

// 'prompt' once the browser hands over its install prompt, 'ios' where Safari installs only from its
// Share menu (install-offer.js); the root's class lets a short screen lift the hero's buttons above it.
function useInstallOffer(hasPrompt: boolean) {
  const { installer, preferences, analytics } = useArcade();
  const [, snoozed] = useReducer((count: number) => count + 1, 0);
  const wasShown = useRef(false);
  const offer = installer
    ? installOffer({
        isInstalled: installer.isInstalled(),
        isSnoozed: isSnoozed(preferences.installDismissedAt(), installer.now()),
        hasPrompt,
        isIos: installer.isIos,
      })
    : null;

  useRootClass('has-install-banner', Boolean(offer));
  useEffect(() => {
    if (offer && !wasShown.current) {
      analytics.track(EVENTS.installShown, { offer });
    }

    wasShown.current = Boolean(offer);
  }, [offer, analytics]);

  return {
    offer,
    snooze() {
      preferences.dismissInstall(installer!.now());
      snoozed();
    },
  };
}

export function useInstall() {
  const { sound, analytics } = useArcade();
  const [prompt, setPrompt] = useInstallPrompt();
  const { offer, snooze } = useInstallOffer(prompt !== null);

  return {
    offer,
    add() {
      setPrompt(null);
      sound.play('sheetOpen');
      analytics.track(EVENTS.install);
      prompt?.prompt();
      prompt?.userChoice.then(({ outcome }) => {
        analytics.track(EVENTS.installChoice, { outcome });

        if (outcome !== 'accepted') {
          snooze();
        }
      });
    },

    notNow() {
      snooze();
      sound.play('sheetClose');
      analytics.track(EVENTS.installDismiss);
    },
  };
}
