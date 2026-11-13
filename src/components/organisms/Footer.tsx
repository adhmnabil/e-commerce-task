import { useState, type FormEvent, type ReactNode } from 'react';
import { ChevronDown, ChevronRight, Mail } from 'lucide-react';
import { SocialIcon } from '@/components/atoms';
import { Logo } from './Logo';

const COLUMNS: { title: string; links: string[] }[] = [
  { title: 'Shop', links: ['My account', 'Login', 'Wishlist', 'Cart'] },
  { title: 'Information', links: ['Shipping Policy', 'Returns & Refunds', 'Cookies Policy', 'Frequently asked'] },
  { title: 'Company', links: ['About us', 'Privacy Policy', 'Terms & Conditions', 'Contact Us'] },
];

const SOCIALS: { label: string; href: string; icon: ReactNode }[] = [
  { label: 'Facebook', href: '#', icon: <SocialIcon network="facebook" className="size-[18px]" /> },
  { label: 'Instagram', href: '#', icon: <SocialIcon network="instagram" className="size-[18px]" /> },
  { label: 'Twitter', href: '#', icon: <SocialIcon network="twitter" className="size-[18px]" /> },
  { label: 'Email us', href: 'mailto:hello@example.com', icon: <Mail aria-hidden strokeWidth={1.5} className="size-[18px]" /> },
];

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'ar', label: 'العربية' },
];
const CURRENCIES = ['USD', 'EGP', 'GBP', 'EUR'].map((c) => ({ value: c, label: c }));
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function UsFlag({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 14" aria-hidden className={className}>
      <rect width="20" height="14" rx="1.5" fill="#fff" />
      {[0, 2, 4, 6, 8, 10, 12].map((y) => (
        <rect key={y} y={y} width="20" height="1" fill="#d22f27" />
      ))}
      <rect width="9" height="7" fill="#1e50a0" />
    </svg>
  );
}

function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'invalid' | 'done'>('idle');

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!EMAIL_PATTERN.test(email.trim())) {
      setStatus('invalid');
      return;
    }
    setStatus('done');
    setEmail('');
  };

  return (
    <form noValidate onSubmit={handleSubmit} className="relative mt-10 w-[298px] max-w-full" aria-label="Newsletter signup">
      <div className="flex items-center gap-8 border-b border-[#8a8a8a] focus-within:border-ink has-[[aria-invalid=true]]:border-danger">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          type="email"
          autoComplete="email"
          placeholder="Get latest offers to your inbox"
          value={email}
          aria-invalid={status === 'invalid' || undefined}
          aria-describedby="newsletter-status"
          onChange={(e) => {
            setEmail(e.target.value);
            if (status !== 'idle') setStatus('idle');
          }}
          className="h-9 min-w-0 flex-1 bg-transparent text-base font-medium tracking-[0.01em] text-ink placeholder:text-[#787a7c] focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Subscribe"
          className="inline-flex h-9 w-[52px] shrink-0 items-center justify-center rounded-lg bg-ink text-white transition-colors hover:bg-black/80"
        >
          <ChevronRight aria-hidden strokeWidth={1.5} className="size-5" />
        </button>
      </div>
      <p id="newsletter-status" role="status" className="absolute left-0 top-full mt-0.5 text-[11px]">
        {status === 'invalid' && <span className="text-danger">Please enter a valid email address.</span>}
        {status === 'done' && <span className="text-success">Thanks! You&apos;re subscribed.</span>}
      </p>
    </form>
  );
}

function FooterSelect({
  label,
  icon,
  options,
  defaultValue,
}: {
  label: string;
  icon?: ReactNode;
  options: { value: string; label: string }[];
  defaultValue: string;
}) {
  return (
    <label className="relative inline-flex items-center gap-2 text-sm font-medium leading-6 text-[#121212]">
      <span className="sr-only">{label}</span>
      {icon}
      <select defaultValue={defaultValue} className="cursor-pointer appearance-none bg-transparent pr-5 focus:outline-none">
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden strokeWidth={1.5} className="pointer-events-none absolute right-0 size-[18px]" />
    </label>
  );
}

export function Footer() {
  return (
    <footer className="mt-14 bg-surface lg:mt-20">
      <div className="mx-auto max-w-(--container-page) px-5 pb-8 pt-[62px] sm:px-6 lg:pt-[72px]">
        <div className="flex flex-col gap-12 lg:flex-row lg:justify-between">
          <div>
            <Logo />
            <NewsletterForm />
            <ul className="mt-5 flex gap-4" aria-label="Social media">
              {SOCIALS.map(({ label, href, icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    aria-label={label}
                    className="inline-flex size-9 items-center justify-center rounded-full bg-white text-ink transition-colors hover:bg-ink hover:text-white"
                  >
                    {icon}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-[134px_134px] gap-x-[58px] gap-y-[25px] lg:flex lg:gap-[120px]">
            {COLUMNS.map((column) => (
              <nav key={column.title} aria-label={column.title} className="lg:w-[134px]">
                <h2 className="text-lg font-medium leading-6 text-[#121212] lg:text-sm lg:font-semibold">{column.title}</h2>
                <ul className="mt-3.5 space-y-3 lg:mt-4">
                  {column.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm leading-[22px] text-[#3e3e59] transition-colors hover:text-ink hover:underline lg:text-ink">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-6 dash-t pt-9 lg:mt-[72px] lg:flex-row lg:items-center lg:justify-between lg:pt-6">
          <p className="text-sm leading-[22px] text-[#3e3e59]">© John Lewis plc 2001 - {new Date().getFullYear()}</p>
          <div className="flex items-center gap-4 self-end lg:gap-8 lg:self-auto">
            <FooterSelect label="Language" icon={<UsFlag className="h-3.5 w-[18px] rounded-[1px]" />} options={LANGUAGES} defaultValue="en" />
            <FooterSelect label="Currency" options={CURRENCIES} defaultValue="USD" />
          </div>
        </div>
      </div>
    </footer>
  );
}
