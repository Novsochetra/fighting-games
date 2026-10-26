import { Link } from 'react-router';
import { useArcade } from '../arcade/arcade-context';
import { HeartIcon } from '../arcade/icons';
import { EVENTS } from './analytics-events.js';
import { useHome } from './home-context';
import { DismissIcon } from './home-icons';
import { InstallBanner } from './InstallBanner';

function SupportBanner() {
  const { support } = useHome().banners;
  const { analytics } = useArcade();

  return (
    <aside
      className="install install--support"
      id="support"
      aria-labelledby="support-title"
      hidden={!support.shown}
    >
      <span className="support-badge" aria-hidden="true">
        <HeartIcon />
      </span>
      <div className="install__text">
        <p className="install__title" id="support-title">
          Enjoying the arcade?
        </p>
        <p className="install__hint">Every game is free. A small gift keeps it that way.</p>
      </div>
      <Link
        className="pill-button pill-button--primary install__add"
        id="support-give"
        to="/supporters/#give"
        onClick={() => analytics.track(EVENTS.supporters, { placement: 'banner' })}
      >
        Support
      </Link>
      <button
        className="install__close"
        id="support-close"
        type="button"
        aria-label="Not now"
        onClick={support.notNow}
      >
        <DismissIcon />
      </button>
    </aside>
  );
}

function ConsentText() {
  return (
    <>
      <span className="consent-badge" aria-hidden="true">
        <svg className="icon icon--bold" viewBox="0 0 24 24">
          <path d="M5 19.5v-6M12 19.5v-15M19 19.5v-10" />
        </svg>
      </span>
      <div className="install__text">
        <p className="install__title" id="consent-title">
          Help make the arcade better
        </p>
        <p className="install__hint">
          Can we count visits and taps with Google Analytics? It uses cookies.
        </p>
      </div>
    </>
  );
}

function ConsentBanner() {
  const { consent } = useHome().banners;

  return (
    <aside
      className="install install--consent"
      id="consent"
      aria-labelledby="consent-title"
      hidden={!consent.shown}
    >
      <ConsentText />
      <div className="consent__actions">
        <button
          className="pill-button install__add consent__refuse"
          id="consent-refuse"
          type="button"
          onClick={consent.refuse}
        >
          No thanks
        </button>
        <button
          className="pill-button pill-button--primary install__add"
          id="consent-allow"
          type="button"
          onClick={consent.allow}
        >
          Allow
        </button>
      </div>
    </aside>
  );
}

// Saying no later must be as easy as saying yes, so the foot of the arcade asks again.
export function PrivacyChoices() {
  const { consent } = useHome().banners;

  return (
    <p className="privacy-choices" id="privacy-choices" hidden={!consent.canAskAgain}>
      <button
        className="privacy-choices__button"
        id="privacy-open"
        type="button"
        onClick={consent.askAgain}
      >
        Privacy choices
      </button>
    </p>
  );
}

// The banners float over the arcade's foot: the analytics question first, then install, then a
// word for the supporters, one at a time.
export function Banners() {
  return (
    <>
      <InstallBanner />
      <SupportBanner />
      <ConsentBanner />
    </>
  );
}
