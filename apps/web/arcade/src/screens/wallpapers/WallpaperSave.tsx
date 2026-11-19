import { useArcade } from '@/services/arcade-context';
import { EVENTS } from '@/services/analytics/analytics-events.js';
import { DownloadIcon } from './wallpaper-icons';
import type { Shape, WallpaperCard } from './wallpaper-types';

interface SaveProps {
  card: WallpaperCard;
  shape: Shape;
  onSaved: () => void;
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
      </div>
      <p className="wallpaper-save__size" id="wallpaper-size">
        {download.sizeLabel}
      </p>
    </div>
  );
}
