import { useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { IconButton } from '@/components/atoms';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';

const ROWS: [eu: string, uk: string, us: string, cm: string][] = [
  ['36', '3.5', '5', '22.5'],
  ['37', '4', '6', '23.5'],
  ['38', '5', '7', '24'],
  ['39', '6', '7.5', '25'],
  ['40', '6.5', '8', '25.5'],
  ['41', '7', '8.5', '26'],
  ['42', '8', '9', '27'],
  ['43', '9', '10', '27.5'],
  ['44', '9.5', '10.5', '28.5'],
];

export interface SizeChartDialogProps {
  open: boolean;
  onClose: () => void;
  highlight?: string;
}

export function SizeChartDialog({ open, onClose, highlight }: SizeChartDialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useLockBodyScroll(open);
  useFocusTrap(panelRef, open, onClose);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div aria-hidden className="absolute inset-0 animate-fade-in bg-black/40" onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="relative w-full max-w-md animate-fade-in rounded-lg bg-white p-5 shadow-2xl focus:outline-none"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 id={titleId} className="text-base font-bold">
            Size Chart
          </h2>
          <IconButton label="Close size chart" icon={<X aria-hidden className="size-5" />} onClick={onClose} />
        </div>
        <table className="w-full text-left text-sm">
          <thead className="dash-b text-xs uppercase text-ink-muted">
            <tr>
              {['EU', 'UK', 'US', 'Foot (cm)'].map((h) => (
                <th key={h} scope="col" className="py-2 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map(([eu, uk, us, cm]) => (
              <tr key={eu} className={eu === highlight ? 'bg-surface font-semibold' : undefined}>
                <th scope="row" className="py-1.5 font-medium">{eu}</th>
                <td>{uk}</td>
                <td>{us}</td>
                <td>{cm}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>,
    document.body,
  );
}
