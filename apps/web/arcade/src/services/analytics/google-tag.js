import { isAnalyticsEnabled, MEASUREMENT_ID } from './analytics-config.js';

const TAG_URL = 'https://www.googletagmanager.com/gtag/js';
const NO_ADS = { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' };
const EXPIRED = new Date(0).toUTCString();

function defineGtag(window) {
  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag() {
    // gtag.js reads only Arguments objects from the data layer; an array of the same values is ignored.
    window.dataLayer.push(arguments);
  };
  return window.gtag;
}

// Google keeps its visitor id in _ga cookies on the site's top domain, so a no after a yes clears them
// there and on the host itself.
function clearGoogleCookies(document) {
  const { hostname } = document.location;
  const topDomain = hostname.split('.').slice(-2).join('.');
  document.cookie
    .split(';')
    .map((cookie) => cookie.split('=')[0].trim())
    .filter((name) => name.startsWith('_ga'))
    .forEach((name) => {
      document.cookie = `${name}=; expires=${EXPIRED}; path=/`;
      document.cookie = `${name}=; expires=${EXPIRED}; path=/; domain=.${topDomain}`;
    });
}

export function loadGoogleTag({ window, measurementId, userProperties }) {
  const gtag = defineGtag(window);
  gtag('consent', 'default', { ...NO_ADS, analytics_storage: 'granted' });
  gtag('js', new Date());
  gtag('set', 'user_properties', userProperties);
  gtag('config', measurementId, { allow_google_signals: false });
  const script = window.document.createElement('script');
  script.async = true;
  script.src = `${TAG_URL}?id=${encodeURIComponent(measurementId)}`;
  window.document.head.append(script);
  return {
    event: (name, params) => gtag('event', name, params),
    grant: () => gtag('consent', 'update', { analytics_storage: 'granted' }),
    deny: () => {
      gtag('consent', 'update', { analytics_storage: 'denied' });
      clearGoogleCookies(window.document);
    },
  };
}

export function browserAnalytics(window, { isInstalled }) {
  const measurementId = MEASUREMENT_ID;
  return {
    isEnabled: isAnalyticsEnabled({ measurementId, hostname: window.location.hostname }),
    loadTag: () =>
      loadGoogleTag({
        window,
        measurementId,
        userProperties: { display_mode: isInstalled ? 'app' : 'browser' },
      }),
  };
}
