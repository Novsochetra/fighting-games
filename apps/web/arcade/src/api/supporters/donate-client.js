export const DONATE_URL = '../api/supporters';
export const SEND_FAILED = 'Your name was not added. Check your connection and try again.';

async function post(fetchFn, url, donation) {
  try {
    return await fetchFn(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(donation),
    });
  } catch {
    throw new Error(SEND_FAILED);
  }
}

export async function postDonation(fetchFn, donation, url = DONATE_URL) {
  const response = await post(fetchFn, url, donation);
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.supporter) {
    throw new Error(typeof payload?.error === 'string' ? payload.error : SEND_FAILED);
  }
  return payload.supporter;
}
