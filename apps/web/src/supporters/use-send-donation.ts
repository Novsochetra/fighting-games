import { useState } from 'react';
import { useArcade, useArcadeUrl } from '../arcade/arcade-context';
import { postDonation } from './donate-client.js';
import type { Donation, Given } from './use-donate-form';

export function useSendDonation({ onSent }: { onSent: (supporter: Given) => void }) {
  const { fetch } = useArcade();
  const url = useArcadeUrl();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  async function send(donation: Donation) {
    setSending(true);
    setError('');

    try {
      onSent(await postDonation(fetch, donation, url('api/supporters')));
    } catch (failure) {
      setError((failure as Error).message);
    } finally {
      setSending(false);
    }
  }

  return { sending, error, setError, send };
}
