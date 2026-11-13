import { memo, useId, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { Checkbox } from '@/components/atoms';
import { cn } from '@/utils/cn';

export interface FilterOption {
  value: string;
  label: ReactNode;
}

export interface FilterGroup {
  id: string;
  title: string;
  options: FilterOption[];
  selected: readonly string[];
}

export interface ReviewFilterProps {
  title?: string;
  groups: FilterGroup[];
  onToggle: (groupId: string, value: string) => void;
  className?: string;
}

function FilterSection({ group, onToggle }: { group: FilterGroup; onToggle: ReviewFilterProps['onToggle'] }) {
  const [open, setOpen] = useState(true);
  const panelId = useId();

  return (
    <div className="dash-t py-6 first-of-type:bg-none first-of-type:pt-0 last:pb-0">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-base font-semibold leading-[1.4] tracking-[-0.2px] text-ink"
      >
        {group.title}
        <ChevronDown aria-hidden strokeWidth={1.5} className={cn('size-3 text-[#0b0f0e] transition-transform', open && 'rotate-180')} />
      </button>
      <fieldset id={panelId} hidden={!open} className="mt-3 space-y-3">
        <legend className="sr-only">{group.title}</legend>
        {group.options.map((option) => (
          <Checkbox
            key={option.value}
            label={option.label}
            checked={group.selected.includes(option.value)}
            onChange={() => onToggle(group.id, option.value)}
          />
        ))}
      </fieldset>
    </div>
  );
}

export const ReviewFilter = memo(function ReviewFilter({
  title = 'Reviews Filter',
  groups,
  onToggle,
  className,
}: ReviewFilterProps) {
  return (
    <aside aria-label={title} className={cn('rounded-lg dash-box p-6', className)}>
      <h3 className="mb-6 dash-b pb-4 text-xl font-semibold leading-[1.4] tracking-[-0.2px] text-[#292929]">{title}</h3>
      {groups.map((group) => (
        <FilterSection key={group.id} group={group} onToggle={onToggle} />
      ))}
    </aside>
  );
});
