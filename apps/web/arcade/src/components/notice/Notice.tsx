import type { Ref } from 'react';

interface NoticeProps {
  // a screen's own prefix for the notice's ids (supporters-notice, supporters-status…), or none
  idPrefix?: string;
  tone: 'loading' | 'error' | 'empty';
  message: string;
  hidden: boolean;
  onRetry: () => void;
  // the arcade's hero is art, so its Try again is glass; elsewhere it sits on the page's surface
  retryLook?: 'glass' | 'surface';
  noticeRef?: Ref<HTMLDivElement>;
}

// A screen waiting on the server shows Apple's activity indicator, then what went wrong with Try
// again (notice.css).
export function Notice(props: NoticeProps) {
  const { idPrefix, tone, message, hidden, onRetry, retryLook = 'surface', noticeRef } = props;
  const id = (name: string) => (idPrefix ? `${idPrefix}-${name}` : name);

  return (
    <div className="notice" id={id('notice')} data-tone={tone} hidden={hidden} ref={noticeRef}>
      <p className="notice__message" id={id('status')} role="status">
        {message}
      </p>
      <button
        className={`pill-button pill-button--${retryLook}`}
        id={id('retry')}
        type="button"
        hidden={tone !== 'error'}
        onClick={onRetry}
      >
        Try again
      </button>
    </div>
  );
}
