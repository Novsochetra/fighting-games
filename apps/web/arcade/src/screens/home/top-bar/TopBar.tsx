import { useState } from 'react';
import { Link } from 'react-router';
import { useArcade, useArcadeUrl } from '@/services/arcade-context';
import { HeartIcon, TrophyIcon } from '@/components/icons';
import { boardRoute } from '@/navigation/routes/board-route.js';
import { EVENTS, onOff } from '@/services/analytics/analytics-events.js';
import { useHome } from '@/screens/home/home-context';

function AppearanceToggle() {
  const { appearance, sound, analytics } = useArcade();
  const [isDark, setDark] = useState(() => appearance.current() === 'dark');

  return (
    <button
      className="glass-button appearance-toggle"
      id="appearance-toggle"
      type="button"
      aria-pressed={isDark}
      aria-label="Dark mode"
      onClick={() => {
        appearance.toggle();
        setDark(appearance.current() === 'dark');
        sound.play('appearance');
        analytics.track(EVENTS.appearance, { appearance: appearance.current() });
      }}
    >
      <svg className="icon appearance-toggle__moon" viewBox="0 0 24 24" aria-hidden="true">
        <path
          className="icon__fill"
          d="M20.2 14.6A8.4 8.4 0 0 1 9.4 3.8a8.4 8.4 0 1 0 10.8 10.8z"
        />
      </svg>
      <svg className="icon appearance-toggle__sun" viewBox="0 0 24 24" aria-hidden="true">
        <circle className="icon__fill" cx="12" cy="12" r="4.2" />
        <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
      </svg>
    </button>
  );
}

function SoundToggle() {
  const { preferences, sound, analytics } = useArcade();
  const [isOn, setOn] = useState(() => preferences.isSoundOn());

  return (
    <button
      className="glass-button"
      id="sound-toggle"
      type="button"
      aria-pressed={isOn}
      aria-label="Sound effects"
      onClick={() => {
        preferences.setSound(!preferences.isSoundOn());
        setOn(preferences.isSoundOn());
        sound.play('soundOn');
        analytics.track(EVENTS.sound, { sound: onOff(preferences.isSoundOn()) });
      }}
    >
      <svg className="icon sound-on" viewBox="0 0 24 24" aria-hidden="true">
        <path className="icon__fill" d="M2.5 9h3.8L11.5 4.8v14.4L6.3 15H2.5z" />
        <path d="M15.2 8.6a5 5 0 0 1 0 6.8M18.4 5.6a9.2 9.2 0 0 1 0 12.8" />
      </svg>
      <svg className="icon sound-off" viewBox="0 0 24 24" aria-hidden="true">
        <path className="icon__fill" d="M2.5 9h3.8L11.5 4.8v14.4L6.3 15H2.5z" />
        <path d="M15.5 9.2l5.6 5.6M21.1 9.2l-5.6 5.6" />
      </svg>
    </button>
  );
}

// the leaderboard and the supporters, each a screen pushed over the arcade; the trophy opens the
// board of the game in the carousel, when it has one
function ScreenLinks() {
  const { analytics } = useArcade();
  const { cards, selected } = useHome();
  const shown = cards[selected];

  return (
    <>
      <Link
        className="glass-button trophy-link"
        id="leaderboard-link"
        to={boardRoute(shown?.board ? shown.id : null)}
        aria-label="Leaderboard"
        onClick={() => analytics.track(EVENTS.leaderboard, { placement: 'top_bar' })}
      >
        <TrophyIcon />
      </Link>
      <Link
        className="glass-button glass-button--labeled support-link"
        id="supporters-link"
        to="/supporters/"
        aria-label="Supporters"
        onClick={() => analytics.track(EVENTS.supporters, { placement: 'top_bar' })}
      >
        <HeartIcon />
        <span className="glass-button__label">Supporters</span>
      </Link>
    </>
  );
}

export function TopBar() {
  const url = useArcadeUrl();

  return (
    <header className="topbar scroll-edge">
      <h1 className="topbar__title" id="home-title">
        <img
          className="topbar__logo"
          src={url('assets/icons/icon-192.png')}
          alt=""
          width="28"
          height="28"
        />
        <span className="topbar__name">Retro Arcade</span>
      </h1>
      <div className="topbar__actions">
        <ScreenLinks />
        <AppearanceToggle />
        <SoundToggle />
      </div>
    </header>
  );
}
