import { HEART_PATH } from '@/components/icons';

export const DownloadIcon = () => (
  <svg className="icon icon--bold" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 3.5v11.5M7 10.5l5 5 5-5M4.5 19.5h15" />
  </svg>
);

export const TileHeartIcon = () => (
  <svg className="icon icon--solid wallpaper-tile__icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d={HEART_PATH} />
  </svg>
);

export const TileDownloadIcon = () => (
  <svg className="icon icon--bold wallpaper-tile__icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 3.5v11.5M7 10.5l5 5 5-5M4.5 19.5h15" />
  </svg>
);
