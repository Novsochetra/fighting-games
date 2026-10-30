import { useRef } from 'react';
import { SheetClose } from '@/components/sheet/SheetClose';
import { useSheet } from '@/components/sheet/use-sheet';
import { DonateForm } from './DonateForm';
import { DonatePay, DonateThanks } from './DonateSteps';
import { useDonateFlow } from './use-donate-flow';
import type { Given } from '@/api/supporters/use-send-donation';
import './donate.css';
import './tier.css';

interface DonateSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onGiven: (supporter: Given) => void;
}

// In the top layer the canvas covers the whole screen, above the sheet (confetti-view.js).
const Confetti = () => (
  <canvas className="donate__confetti" id="donate-confetti" popover="manual" aria-hidden="true" />
);

// The sheet for a gift: the form, then the KHQR code to pay with, then thanks.
export function DonateSheet({ isOpen, onClose, onGiven }: DonateSheetProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const flow = useDonateFlow({ onGiven });

  useSheet({ dialog, closeButton }, isOpen, () => {
    flow.reset();
    onClose();
  });

  return (
    <dialog
      className="sheet donate-sheet"
      id="donate-sheet"
      aria-labelledby="donate-title"
      tabIndex={-1}
      data-step={flow.step}
      ref={dialog}
    >
      <Confetti />
      <SheetClose id="donate-close" closeRef={closeButton} />
      <DonateForm flow={flow} />
      <DonatePay flow={flow} />
      <DonateThanks flow={flow} onDone={onClose} />
    </dialog>
  );
}
