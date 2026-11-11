// An iPhone puts a picture in Photos only from the share sheet (Save Image); a download lands in
// Files, from where a wallpaper cannot be picked.
export function canShareFiles(navigator, FileType = globalThis.File) {
  try {
    const probe = new FileType([], 'wallpaper.jpg', { type: 'image/jpeg' });

    return Boolean(navigator.canShare?.({ files: [probe] }));
  } catch {
    return false;
  }
}

export async function fetchWallpaper(fetchFile, { url, name, type }, FileType = globalThis.File) {
  const answer = await fetchFile(url);

  if (!answer.ok) {
    throw new Error(`${url} answered ${answer.status}`);
  }

  return new FileType([await answer.blob()], name, { type });
}

// The share sheet opens only just after a tap, and a slow download can outlast that: the file then
// waits for a second tap (needs-tap). Closing the sheet without picking is no failure.
export async function shareWallpaper(navigator, file) {
  try {
    await navigator.share({ files: [file] });

    return 'shared';
  } catch (error) {
    if (error.name === 'AbortError') {
      return 'cancelled';
    }

    if (error.name === 'NotAllowedError') {
      return 'needs-tap';
    }

    throw error;
  }
}
