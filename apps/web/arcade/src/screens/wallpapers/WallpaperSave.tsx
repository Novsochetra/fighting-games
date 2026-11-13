import { useArcade } from '@/services/arcade-context';
import { EVENTS } from '@/services/analytics/analytics-events.js';
import { useWallpaperShare, type ShareState } from './use-wallpaper-share';
import { DownloadIcon, ShareIcon } from './wallpaper-icons';
import type { Shape, WallpaperCard } from './wallpaper-types';

const SHARE_LABELS: Record<ShareState, string> = {
  idle: 'Share',
  loading: 'Getting it…',
  ready: 'Share now',
  failed: 'Try again',
};

interface SaveProps {
  card: WallpaperCard;
  shape: Shape;
  // a download or a share that went through, which the wallpaper's download count takes in
  onSaved: () => void;
}

function ShareButton({ card, shape, onSaved }: SaveProps) {
  const { analytics } = useArcade();
  const { isOffered, state, share } = useWallpaperShare(card.downloads[shape], onSaved);

  return isOffered ? (
    <>
      <button
        className="pill-button pill-button--surface wallpaper-save__button"
        id="wallpaper-share"
        type="button"
        data-state={state}
        aria-busy={state === 'loading'}
        onClick={() => {
          share();
          analytics.track(EVENTS.wallpaperShare, { wallpaper: card.id, shape });
        }}
      >
        <ShareIcon />
        {SHARE_LABELS[state]}
      </button>
      <p className="wallpaper-save__hint">On iPhone, Share then Save Image puts it in Photos.</p>
    </>
  ) : null;
}

// The download is sent as an attachment (upload-wallpapers.js), so a tap saves it rather than
// opening it, though it comes from CloudFront, where a link's download attribute is ignored.
export function WallpaperSave({ card, shape, onSaved }: SaveProps) {
  const { analytics } = useArcade();
  const download = card.downloads[shape];

  return (
    <div className="wallpaper-save">
      <div className="wallpaper-save__buttons">
        <a
          className="pill-button pill-button--primary wallpaper-save__button"
          id="wallpaper-download"
          href={download.url}
          download={download.name}
          onClick={() => {
            onSaved();
            analytics.track(EVENTS.wallpaperDownload, { wallpaper: card.id, shape });
          }}
        >
          <DownloadIcon />
          Download
        </a>
        <ShareButton key={download.url} card={card} shape={shape} onSaved={onSaved} />
      </div>
      <p className="wallpaper-save__size" id="wallpaper-size">
        {download.sizeLabel}
      </p>
    </div>
  );
}
