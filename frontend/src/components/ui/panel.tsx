import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/styles/cn';

type PanelProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  tone?: 'default' | 'soft';
};

export function Panel({ children, className, tone = 'default', ...props }: PanelProps) {
  return (
    <div
      className={cn(
        'border border-townhall-border bg-townhall-panel shadow-townhall-card',
        tone === 'soft' && 'bg-townhall-subtle',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
