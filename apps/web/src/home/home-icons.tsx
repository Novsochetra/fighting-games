export const PlayIcon = () => (
  <svg className="icon icon--solid" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 3.8c0-.9 1-1.5 1.8-1l12 7.4c.8.5.8 1.6 0 2l-12 7.5c-.8.5-1.8-.1-1.8-1z" />
  </svg>
);

// the banners' Not now, thinner than a sheet's close
export const DismissIcon = () => (
  <svg className="icon icon--bold" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 7l10 10M17 7 7 17" />
  </svg>
);

const COFFEE_PATHS = (
  <>
    <path d="M4.5 9.5h11v4a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z" />
    <path d="M15.5 11h1.25a2.25 2.25 0 0 1 0 4.5H15" />
    <path d="M8 3.5c-.7.9-.7 1.8 0 2.7M11.5 3.5c-.7.9-.7 1.8 0 2.7" />
  </>
);

export const CoffeeIcon = ({ hidden = true }: { hidden?: boolean }) => (
  <svg className="icon icon--bold" viewBox="0 0 24 24" aria-hidden={hidden || undefined}>
    {COFFEE_PATHS}
  </svg>
);

// a trailer: a play sign in a frame, as Apple marks a video
export const TrailerIcon = () => (
  <svg className="icon icon--bold" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="3.5" />
    <path
      className="icon__fill"
      d="M10.25 9.4v5.2a.5.5 0 0 0 .77.43l4.17-2.6a.5.5 0 0 0 0-.86l-4.17-2.6a.5.5 0 0 0-.77.43z"
    />
  </svg>
);

export const ChevronIcon = () => (
  <svg className="icon icon--bold" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M9 5.5l6.5 6.5L9 18.5" />
  </svg>
);

// Save offline: a cloud with an arrow down out of it, as Apple marks a download
export const SaveIcon = () => (
  <svg className="icon icon--bold" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 17.5h-.5a4 4 0 0 1-.5-7.97 6 6 0 0 1 11.66-1.4A4.75 4.75 0 0 1 17.5 17.5H17" />
    <path d="M12 11.5v8.5M9 17l3 3 3-3" />
  </svg>
);

// a saved game's button removes it
export const TrashIcon = () => (
  <svg className="icon icon--bold" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M4.5 6.5h15M9.5 6.5V5c0-.83.67-1.5 1.5-1.5h2c.83 0 1.5.67 1.5 1.5v1.5M6.5 6.5l.8 12.1c.06.8.73 1.4 1.53 1.4h6.34c.8 0 1.47-.6 1.53-1.4l.8-12.1M10 10.5v6M14 10.5v6" />
  </svg>
);

// the Offline tag on a saved game's art
export const SavedIcon = () => (
  <svg className="icon icon--bold" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5.5 12.5l4.5 4.5 8.5-9.5" />
  </svg>
);

// how much of a game is saved, filling clockwise from the top
export const SaveRing = ({ percent }: { percent: number }) => (
  <svg className="icon save-ring" viewBox="0 0 24 24" aria-hidden="true">
    <circle className="save-ring__track" cx="12" cy="12" r="8.5" />
    <circle
      className="save-ring__value"
      cx="12"
      cy="12"
      r="8.5"
      pathLength={100}
      style={{ strokeDashoffset: 100 - percent }}
    />
  </svg>
);
