export type Shape = 'phone' | 'desktop';
export type Mood = 'all' | 'day' | 'night';

interface Picture {
  src: string;
  srcSet: string;
}

export interface WallpaperDownload {
  url: string;
  name: string;
  type: string;
  width: number;
  height: number;
  sizeLabel: string;
}

// what wallpaperCards (wallpaper-list.js) makes of each wallpaper
export interface WallpaperCard {
  id: string;
  place: string;
  time: string;
  mood: Exclude<Mood, 'all'>;
  thumb: Picture;
  preview: Record<Shape, Picture>;
  downloads: Record<Shape, WallpaperDownload>;
}
