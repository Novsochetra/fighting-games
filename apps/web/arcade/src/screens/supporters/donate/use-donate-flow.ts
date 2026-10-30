import { useState, type FormEvent } from 'react';
import { flushSync } from 'react-dom';
import { useArcade } from '@/services/arcade-context';
import { useConfetti } from './use-confetti';
import { useDonateForm } from './use-donate-form';
import { PAY_WAIT_SECONDS } from './pay-wait.js';
import { useCountdown } from '@/hooks/use-countdown';
import { useSendDonation, type Donation, type Given } from '@/api/supporters/use-send-donation';

export type Step = 'form' | 'pay' | 'thanks';

// Each step's title takes the focus as the step shows, so a screen reader starts there.
function useSteps() {
  const { window } = useArcade();
  const [step, setStep] = useState<Step>('form');

  return {
    step,
    setStep,
    goTo(next: Step) {
      flushSync(() => setStep(next));
      window.document
        .querySelector<HTMLElement>(`[data-step-panel="${next}"] h2`)
        ?.focus({ preventScroll: true });
    },
  };
}

function useFlowParts(onGiven: (supporter: Given) => void) {
  const { sound } = useArcade();
  const steps = useSteps();
  const confetti = useConfetti();
  const form = useDonateForm();
  const [donation, setDonation] = useState<Donation | null>(null);
  const [supporter, setSupporter] = useState<Given | null>(null);
  const sender = useSendDonation({
    onSent(given) {
      form.clear();
      setSupporter(given);
      steps.goTo('thanks');
      sound.play('cheer');
      confetti.play();
      onGiven(given);
    },
  });

  const wait = useCountdown(PAY_WAIT_SECONDS);

  return { steps, wait, confetti, form, donation, setDonation, supporter, sender };
}

type FlowParts = ReturnType<typeof useFlowParts>;

function movesOf({ steps, wait, confetti, form, donation, setDonation, sender }: FlowParts) {
  const leave = () => {
    wait.stop();
    confetti.stop();
  };

  return {
    toPay(event: FormEvent) {
      event.preventDefault();
      const read = form.read();

      if (read) {
        setDonation(read);
        sender.setError('');
        steps.goTo('pay');
        wait.start();
      }
    },

    send() {
      if (donation && !sender.sending && wait.left <= 0) {
        sender.send(donation);
      }
    },

    backToForm() {
      leave();
      steps.goTo('form');
    },

    // once the sheet has closed, so it opens again on the form, as it first did
    reset() {
      leave();
      form.setError(null);
      steps.setStep('form');
    },
  };
}

export function useDonateFlow({ onGiven }: { onGiven: (supporter: Given) => void }) {
  const parts = useFlowParts(onGiven);

  return { ...parts, step: parts.steps.step, ...movesOf(parts) };
}

export type DonateFlow = ReturnType<typeof useDonateFlow>;
