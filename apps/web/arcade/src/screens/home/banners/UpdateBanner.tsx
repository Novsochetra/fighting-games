import { useArcadeUrl } from '@/services/arcade-context';
import { useHome } from '@/screens/home/home-context';
import { DismissIcon } from '@/screens/home/home-icons';

const UpdateText = () => (
  <div className="install__text">
    <p className="install__title" id="update-title">
      New version ready
    </p>
    <p className="install__hint">Reload to get it.</p>
  </div>
);

// A deploy replaced the build this page runs, and the new one is all in, so Reload opens it at once.
export function UpdateBanner() {
  const { update } = useHome().banners;
  const url = useArcadeUrl();

  return (
    <aside
      className="install install--update"
      id="update"
      aria-labelledby="update-title"
      hidden={!update.shown}
    >
      <img
        className="install__icon"
        src={url('assets/icons/icon-192.png')}
        alt=""
        width="48"
        height="48"
      />
      <UpdateText />
      <button
        className="pill-button pill-button--primary install__add"
        id="update-reload"
        type="button"
        onClick={update.reload}
      >
        Reload
      </button>
      <button
        className="install__close"
        id="update-close"
        type="button"
        aria-label="Not now"
        onClick={update.notNow}
      >
        <DismissIcon />
      </button>
    </aside>
  );
}
