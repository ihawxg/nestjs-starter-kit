import Link from 'next/link';
import type { ReactNode } from 'react';

import { cn } from '@/lib/styles/cn';

type ActionCardProps = {
  title: string;
  href: string;
  children: ReactNode;
};

export function ActionCard({ title, href, children }: ActionCardProps) {
  return (
    <article className="group overflow-hidden border border-townhall-border bg-townhall-panel shadow-townhall-card transition hover:shadow-md">
      <Link
        className={cn(
          'flex min-h-36 flex-col gap-3 border-l-4 border-townhall-gold p-5 text-townhall-slate no-underline transition hover:bg-townhall-cream',
        )}
        href={href}
      >
        <span className="text-xl font-bold leading-tight text-townhall-navy">{title}</span>
        <span className="text-sm font-semibold leading-6 text-townhall-muted">{children}</span>
      </Link>
    </article>
  );
}
