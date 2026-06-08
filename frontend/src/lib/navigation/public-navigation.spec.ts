import { describe, expect, it } from 'vitest';
import {
  getFrontendFooterNavigation,
  getFrontendHeaderNavigation,
} from './public-navigation';

describe('frontend public navigation', () => {
  it('returns English header navigation with utility links and residents dropdown', () => {
    const navigation = getFrontendHeaderNavigation('en');

    expect(navigation.utilityLinks.map((item) => item.label)).toEqual([
      'Pay bill',
      'Report issue',
      'Meetings',
      'Contact',
    ]);
    expect(navigation.items.map((item) => item.label)).toEqual([
      'Home',
      'Residents',
      'Business',
      'Government',
      'Departments',
    ]);

    const residents = navigation.items.find((item) => item.label === 'Residents');
    expect(residents).toMatchObject({
      type: 'dropdown',
      columns: [
        expect.objectContaining({ title: 'Services' }),
        expect.objectContaining({ title: 'Community' }),
      ],
      callout: expect.objectContaining({ title: 'Next public meeting' }),
    });
  });

  it('returns Bulgarian labels without changing route hrefs', () => {
    const navigation = getFrontendHeaderNavigation('bg');

    expect(navigation.utilityLinks[0]).toMatchObject({
      label: 'Плащане',
      href: '/pay',
    });
    expect(navigation.items[1]).toMatchObject({
      type: 'dropdown',
      label: 'Граждани',
    });
    const residents = navigation.items[1];
    expect(residents.type === 'dropdown' ? residents.columns[1]?.items[3] : null).toMatchObject({
      label: 'Общински съвет',
      href: '/government/council',
    });
  });

  it('returns footer columns, action links, and legal links', () => {
    const navigation = getFrontendFooterNavigation('en');

    expect(navigation.columns.map((column) => column.title)).toEqual([
      'Services',
      'Government',
      'Access',
    ]);
    expect(navigation.actionLinks[0]).toMatchObject({
      label: 'Contact hall',
      href: '/contact',
    });
    expect(navigation.legalLinks[2]).toMatchObject({
      label: 'Public records',
      href: '/records',
    });
  });

  it('returns fresh objects so callers cannot mutate shared navigation definitions', () => {
    const first = getFrontendFooterNavigation('en');
    first.columns[0]!.title = 'Changed';

    expect(getFrontendFooterNavigation('en').columns[0]?.title).toBe('Services');
  });
});
