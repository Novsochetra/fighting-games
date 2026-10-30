import { useState } from 'react';
import { useArcade, useArcadeUrl } from '@/services/arcade-context';
import { postDonation } from './donate-client.js';

export type Donation = { name: string; amount: number; message: string };
export type Given = Donation & { date?: string };

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
