import { describe, expect, it, vi } from 'vitest';
import {
  canShareFiles,
  fetchWallpaper,
  shareWallpaper,
} from '@/screens/wallpapers/wallpaper-share.js';

const DOWNLOAD = {
  url: 'https://files.example.test/w/desktop.png',
  name: 'kulen-desktop.png',
  type: 'image/png',
};
const failingWith = (name) => vi.fn(async () => Promise.reject(new DOMException('no', name)));

describe('canShareFiles', () => {
  it('asks the browser whether it can share a picture file', () => {
    const canShare = vi.fn(() => true);

    expect(canShareFiles({ canShare })).toBe(true);
    expect(canShare.mock.calls[0][0].files[0].type).toBe('image/jpeg');
  });

  it('is false where the browser cannot share files at all', () => {
    expect(canShareFiles({})).toBe(false);
    expect(canShareFiles({ canShare: () => false })).toBe(false);
  });

  it('is false where files cannot even be made', () => {
    class NoFiles {
      constructor() {
        throw new TypeError('no File here');
      }
    }

    expect(canShareFiles({ canShare: () => true }, NoFiles)).toBe(false);
  });
});

describe('fetchWallpaper', () => {
  it('makes a file of its kind, named as it saves, from what the address sends', async () => {
    const fetchFile = vi.fn(async () => new Response(new Blob(['png bytes'])));
    const file = await fetchWallpaper(fetchFile, DOWNLOAD);

    expect(fetchFile).toHaveBeenCalledWith(DOWNLOAD.url);
    expect(file).toMatchObject({ name: 'kulen-desktop.png', type: 'image/png' });
    expect(await file.text()).toBe('png bytes');
  });

  it('fails when the address does not send the file', async () => {
    const fetchFile = async () => new Response('', { status: 404 });

    await expect(fetchWallpaper(fetchFile, DOWNLOAD)).rejects.toThrow(/answered 404/);
  });
});

describe('shareWallpaper', () => {
  const file = new File(['jpeg'], 'kulen-phone.jpg', { type: 'image/jpeg' });

  it('hands the file to the share sheet', async () => {
    const share = vi.fn(async () => {});

    await expect(shareWallpaper({ share }, file)).resolves.toBe('shared');
    expect(share).toHaveBeenCalledWith({ files: [file] });
  });

  it('takes a sheet closed without a pick as no failure', async () => {
    await expect(shareWallpaper({ share: failingWith('AbortError') }, file)).resolves.toBe(
      'cancelled',
    );
  });

  it('waits for another tap when the download outlasted the tap that asked for it', async () => {
    await expect(shareWallpaper({ share: failingWith('NotAllowedError') }, file)).resolves.toBe(
      'needs-tap',
    );
  });

  it('lets any other failure through', async () => {
    await expect(shareWallpaper({ share: failingWith('DataError') }, file)).rejects.toThrow('no');
  });
});
