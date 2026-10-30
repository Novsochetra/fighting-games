import { useArcadeUrl } from '@/services/arcade-context';
import { useHome } from '@/screens/home/home-context';
import { DismissIcon } from '@/screens/home/home-icons';

// Safari on iOS installs only from its Share menu, so there the banner says where to tap.
function InstallText() {
  return (
    <div className="install__text">
      <p className="install__title" id="install-title">
        Retro Arcade
      </p>
      <p className="install__hint install__hint--prompt">Install it and open it like any app.</p>
      <p className="install__hint install__hint--ios">
        Tap{' '}
        <svg className="icon install__share" viewBox="0 0 24 24" aria-label="Share" role="img">
          <path d="M12 3.5v11M8.5 7 12 3.5 15.5 7M8.5 10.5h-2v10h11v-10h-2" />
        </svg>{' '}
        then Add to Home Screen.
      </p>
    </div>
  );
}

export function InstallBanner() {
  const { install } = useHome().banners;
  const url = useArcadeUrl();

  return (
    <aside
      className="install"
      id="install"
      aria-labelledby="install-title"
      hidden={!install.offer}
      data-offer={install.offer ?? undefined}
    >
      <img
        className="install__icon"
        src={url('assets/icons/icon-192.png')}
        alt=""
        width="48"
        height="48"
      />
      <InstallText />
      <button
        className="pill-button pill-button--primary install__add"
        id="install-add"
        type="button"
        onClick={install.add}
      >
        Install
      </button>
      <button
        className="install__close"
        id="install-close"
        type="button"
        aria-label="Not now"
        onClick={install.notNow}
      >
        <DismissIcon />
      </button>
    </aside>
  );
}
