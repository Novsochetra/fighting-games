// Each check takes a new key, since a key is never written twice (s3-storage.js).
export async function checkStorage({ storage, fetchFile = fetch, now = Date.now }) {
  const time = now();
  const key = `checks/storage-check-${time}.txt`;
  const body = `Arcade storage check at ${new Date(time).toISOString()}\n`;
  const { url } = await storage.putFile({ key, body, contentType: 'text/plain; charset=utf-8' });
  const answer = await fetchFile(url);
  const sent = answer.ok ? await answer.text() : '';

  return { key, url, status: answer.status, readBack: sent === body };
}
