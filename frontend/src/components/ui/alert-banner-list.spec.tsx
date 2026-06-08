import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AlertBannerList } from './alert-banner-list';

describe('AlertBannerList', () => {
  it('renders nothing when there are no active alerts', () => {
    const { container } = render(<AlertBannerList alerts={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders active alert text with a custom severity class', () => {
    render(
      <AlertBannerList
        alerts={[{ id: 1, title: 'Important', message: 'Office closed', severity: 'warning' }]}
      />,
    );

    expect(screen.getByRole('region', { name: 'Active alerts' })).toHaveClass('max-w-7xl');
    expect(screen.getByText('Important')).toBeInTheDocument();
    expect(screen.getByText('Office closed')).toBeInTheDocument();
    expect(screen.getByText('Important').closest('article')).toHaveClass(
      'border-l-townhall-warning',
    );
  });
});
