import { useConsent } from './use-consent';
import { useInstall } from './use-install';
import { useSupport } from './use-support';

// While the analytics question or the install offer is up, the support banner waits for another visit.
export function useBanners() {
  const consent = useConsent();
  const install = useInstall();
  const support = useSupport({ othersUp: consent.shown || install.offer !== null });

  return { consent, install, support };
}
