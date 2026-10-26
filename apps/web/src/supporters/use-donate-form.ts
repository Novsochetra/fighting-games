import { useState } from 'react';
import { useArcade } from '../arcade/arcade-context';
import { readDonationForm } from './donate-form.js';

export type Field = 'amount' | 'name' | 'message';
export type Fields = Record<Field, string>;
export type Donation = { name: string; amount: number; message: string };
export type Given = Donation & { date?: string };

const NO_FIELDS: Fields = { amount: '', name: '', message: '' };

type FormError = { field: Field; error: string };

export function useDonateForm() {
  const [fields, setFields] = useState(NO_FIELDS);
  const [error, setError] = useState<FormError | null>(null);
  const { window } = useArcade();

  return {
    fields,
    error,
    setError,
    setField: (field: Field, value: string) => setFields((was) => ({ ...was, [field]: value })),
    clear: () => setFields(NO_FIELDS),
    // the donation the form holds, or none, with what is wrong said and its field in focus
    read(): Donation | null {
      const read = readDonationForm(fields);

      if (read.donation) {
        setError(null);
        return read.donation as Donation;
      }

      setError({ field: read.field as Field, error: read.error });
      window.document.getElementById(`donate-${read.field}`)?.focus();

      return null;
    },
  };
}
