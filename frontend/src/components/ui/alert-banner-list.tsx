import type { PublicAlert } from '@/lib/api/public-shell';
import { cn } from '@/lib/styles/cn';

type AlertBannerListProps = {
  alerts: PublicAlert[];
};

export function AlertBannerList({ alerts }: AlertBannerListProps) {
  if (alerts.length === 0) return null;

  return (
    <section className="mx-auto mt-5 w-full max-w-7xl px-4 sm:px-6" aria-label="Active alerts">
      {alerts.map((alert) => (
        <article
          key={alert.id}
          className={cn(
            'border border-townhall-border bg-townhall-panel p-4 shadow-townhall-card',
            alert.severity === 'info' && 'border-l-4 border-l-townhall-blue bg-townhall-subtle',
            alert.severity === 'success' && 'border-l-4 border-l-townhall-green',
            alert.severity === 'warning' && 'border-l-4 border-l-townhall-warning',
            alert.severity === 'error' && 'border-l-4 border-l-townhall-danger',
          )}
          aria-labelledby={`alert-${alert.id}-title`}
        >
          <h2 id={`alert-${alert.id}-title`} className="text-base font-bold text-townhall-navy">
            {alert.title}
          </h2>
          <p className="mt-1 text-sm font-semibold leading-6 text-townhall-slate">{alert.message}</p>
        </article>
      ))}
    </section>
  );
}
