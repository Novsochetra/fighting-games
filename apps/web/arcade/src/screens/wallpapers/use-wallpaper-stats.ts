import {
  useCountDownload,
  useWallpaperCounts,
  useWallpaperLikes,
} from '@/api/wallpapers/use-wallpaper-counts';

// Every wallpaper's likes and downloads, this device's likes, and the way to add to either.
export function useWallpaperStats() {
  return { ...useWallpaperCounts(), ...useWallpaperLikes(), countDownload: useCountDownload() };
}

export type WallpaperStats = ReturnType<typeof useWallpaperStats>;
