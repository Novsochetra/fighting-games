import { useMemo, useRef, useState } from 'react';
import { useArcade } from '@/services/arcade-context';
import { canShareFiles, fetchWallpaper, shareWallpaper } from './wallpaper-share.js';

export type ShareState = 'idle' | 'loading' | 'ready' | 'failed';

interface Download {
  url: string;
  name: string;
  type: string;
}

// Offered on a touch screen that can share a file. The file stays once fetched, so the tap a slow
// download needed, or a second share, sends it at once.
export function useWallpaperShare(download: Download) {
  const { window, fetch: fetchFile } = useArcade();
  const [state, setState] = useState<ShareState>('idle');
  const file = useRef<File | null>(null);
  const isOffered = useMemo(
    () => window.matchMedia('(pointer: coarse)').matches && canShareFiles(window.navigator),
    [window],
  );

  async function share() {
    try {
      if (!file.current) {
        setState('loading');
        file.current = await fetchWallpaper(fetchFile, download);
      }

      const result = await shareWallpaper(window.navigator, file.current);

      setState(result === 'needs-tap' ? 'ready' : 'idle');
    } catch {
      setState('failed');
    }
  }

  return { isOffered, state, share: () => state !== 'loading' && share() };
}
