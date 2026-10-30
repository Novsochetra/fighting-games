import { Link } from 'react-router';
import { useArcade, useArcadeUrl } from '@/services/arcade-context';
import { HeartIcon } from '@/components/icons';
import { EVENTS } from '@/services/analytics/analytics-events.js';
import { PrivacyChoices } from '@/screens/home/banners/Banners';
import { ChevronIcon } from '@/screens/home/home-icons';

function SupportCallout() {
  const { analytics } = useArcade();

  return (
    <aside className="support-callout" aria-labelledby="support-callout-title">
      <span className="support-callout__badge" aria-hidden="true">
        <HeartIcon />
      </span>
      <div className="support-callout__text">
        <h2 className="support-callout__title" id="support-callout-title">
          Free to play, thanks to our supporters
        </h2>
        <p className="support-callout__body">
          Every game here is free. The people who chip in keep the arcade running.
        </p>
      </div>
      <Link
        className="pill-button pill-button--primary support-callout__link"
        to="/supporters/"
        onClick={() => analytics.track(EVENTS.supporters, { placement: 'library' })}
      >
        See supporters
      </Link>
    </aside>
  );
}

const Hints = () => (
  <footer className="hints" aria-label="Controls">
    <p className="hints__item">
      <kbd>←</kbd>
      <kbd>→</kbd> Browse
    </p>
    <p className="hints__item">
      <kbd>Enter</kbd> Play
    </p>
    <p className="hints__item">
      <kbd>D-pad</kbd>
      <kbd>A</kbd> Gamepad
    </p>
  </footer>
);

function MadeBy() {
  const { analytics } = useArcade();
  const url = useArcadeUrl();

  return (
    <p className="made-by">
      <Link
        className="made-by__link"
        id="credits-link"
        to="/credits/"
        onClick={() => analytics.track(EVENTS.credits, {})}
      >
        <span className="made-by__avatar" aria-hidden="true">
          NS
          <img
            className="made-by__photo"
            src={url('assets/credits/portrait-small.jpg')}
            width="96"
            height="96"
            alt=""
            loading="lazy"
          />
        </span>
        <span className="made-by__text">
          Made by <span className="made-by__name">Nov Sochetra</span>
        </span>
        <span className="made-by__more">
          Credits
          <ChevronIcon />
        </span>
      </Link>
    </p>
  );
}

export function LibraryFooter() {
  return (
    <>
      <SupportCallout />
      <Hints />
      <MadeBy />
      <PrivacyChoices />
    </>
  );
}
