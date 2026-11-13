import { useEffect, useState } from 'react';

export interface AnnouncementBarProps {
  message: string;
  /** Countdown shown in the pill, in seconds. */
  countdownSeconds?: number;
}

function formatCountdown(total: number) {
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function AnnouncementBar({ message, countdownSeconds = 20 * 60 + 40 }: AnnouncementBarProps) {
  const [remaining, setRemaining] = useState(countdownSeconds);

  useEffect(() => {
    if (remaining <= 0) return;
    const timer = window.setTimeout(() => setRemaining((s) => s - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [remaining]);

  return (
    <div role="region" aria-label="Announcement" className="bg-ink text-white">
      <p className="mx-auto max-w-[243px] px-0 py-3 text-center text-sm font-medium leading-[1.2] sm:max-w-none sm:px-6">
        {message}
        <time
          aria-label="Offer ends in"
          className="ml-4 inline-flex h-[18px] -translate-y-px items-center rounded-full bg-[#383838] px-2 align-middle text-[11px] leading-none sm:text-xs"
        >
          {formatCountdown(remaining)}
        </time>
      </p>
    </div>
  );
}
