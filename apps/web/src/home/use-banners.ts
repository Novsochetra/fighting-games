import { useConsent } from './use-consent';
import { useInstall } from './use-install';
import { useSupport } from './use-support';
import { useUpdate } from './use-update';

// While a new version, the analytics question or the install offer is up, the support banner waits
// for another visit.
export function useBanners() {
  const update = useUpdate();
  const consent = useConsent();
  const install = useInstall();
  const othersUp = update.shown || consent.shown || install.offer !== null;
  const support = useSupport({ othersUp });

  return { update, consent, install, support };
}
