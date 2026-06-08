import type { SupportedLocale } from '@/lib/i18n/locales';
import { getPublicNavigationCopy } from '@/lib/i18n/messages';

export type HeaderLinkIcon =
  | 'alert'
  | 'building'
  | 'calendar'
  | 'file'
  | 'trees'
  | 'users'
  | 'wrench';

export type FrontendHeaderLink = {
  type: 'link';
  label: string;
  href: string;
  description?: string;
  icon?: HeaderLinkIcon;
};

export type FrontendHeaderDropdownColumn = {
  title: string;
  items: FrontendHeaderLink[];
};

export type FrontendHeaderCallout = {
  title: string;
  description: string;
  meta?: string;
  cta?: FrontendHeaderLink;
};

export type FrontendHeaderDropdown = {
  type: 'dropdown';
  label: string;
  columns: FrontendHeaderDropdownColumn[];
  callout?: FrontendHeaderCallout;
};

export type FrontendHeaderMainItem = FrontendHeaderLink | FrontendHeaderDropdown;

export type FrontendHeaderNavigation = {
  utilityLinks: FrontendHeaderLink[];
  items: FrontendHeaderMainItem[];
  search: {
    label: string;
    placeholder: string;
  };
};

export type FrontendFooterLink = {
  label: string;
  href: string;
};

export type FrontendFooterColumn = {
  title: string;
  links: FrontendFooterLink[];
};

export type FrontendFooterNavigation = {
  columns: FrontendFooterColumn[];
  actionLinks: FrontendFooterLink[];
  legalLinks: FrontendFooterLink[];
};

export function getFrontendHeaderNavigation(
  locale: SupportedLocale,
): FrontendHeaderNavigation {
  const copy = getPublicNavigationCopy(locale);

  return {
    utilityLinks: [
      link(copy.labels.payBill, '/pay'),
      link(copy.labels.reportIssue, '/report'),
      link(copy.labels.meetings, '/meetings'),
      link(copy.labels.contact, '/contact'),
    ],
    search: copy.search,
    items: [
      link(copy.labels.home, '/'),
      {
        type: 'dropdown',
        label: copy.labels.residents,
        columns: [
          {
            title: copy.labels.services,
            items: [
              link(copy.labels.waterSewer, '/residents/water-sewer', {
                description: copy.descriptions.waterSewer,
                icon: 'wrench',
              }),
              link(copy.labels.trashCollection, '/residents/trash-collection', {
                description: copy.descriptions.trashCollection,
                icon: 'file',
              }),
              link(copy.labels.permits, '/residents/permits', {
                description: copy.descriptions.permits,
                icon: 'building',
              }),
              link(copy.labels.parks, '/residents/parks', {
                description: copy.descriptions.parks,
                icon: 'trees',
              }),
            ],
          },
          {
            title: copy.labels.community,
            items: [
              link(copy.labels.calendar, '/calendar', {
                description: copy.descriptions.calendar,
                icon: 'calendar',
              }),
              link(copy.labels.publicNotices, '/notices', {
                description: copy.descriptions.publicNotices,
                icon: 'file',
              }),
              link(copy.labels.alerts, '/alerts', {
                description: copy.descriptions.alerts,
                icon: 'alert',
              }),
              link(copy.labels.council, '/government/council', {
                description: copy.descriptions.council,
                icon: 'users',
              }),
            ],
          },
        ],
        callout: {
          title: copy.labels.calloutTitle,
          meta: copy.labels.calloutMeta,
          description: copy.labels.calloutDescription,
          cta: link(copy.labels.calloutCta, '/meetings/agenda'),
        },
      },
      link(copy.labels.business, '/business'),
      link(copy.labels.government, '/government'),
      link(copy.labels.departments, '/departments'),
    ],
  };
}

export function getFrontendFooterNavigation(
  locale: SupportedLocale,
): FrontendFooterNavigation {
  const copy = getPublicNavigationCopy(locale);

  return {
    columns: [
      {
        title: copy.labels.services,
        links: [
          footerLink(copy.labels.waterSewer, '/residents/water-sewer'),
          footerLink(copy.labels.trashCollection, '/residents/trash-collection'),
          footerLink(copy.labels.permitsInspections, '/residents/permits'),
          footerLink(copy.labels.parks, '/residents/parks'),
        ],
      },
      {
        title: copy.labels.government,
        links: [
          footerLink(copy.labels.council, '/government/council'),
          footerLink(copy.labels.meetingAgendas, '/meetings/agenda'),
          footerLink(copy.labels.publicNotices, '/notices'),
          footerLink(copy.labels.departments, '/departments'),
        ],
      },
      {
        title: copy.labels.access,
        links: [
          footerLink(copy.labels.calendar, '/calendar'),
          footerLink(copy.labels.payBill, '/pay'),
          footerLink(copy.labels.reportIssue, '/report'),
          footerLink(copy.labels.alerts, '/alerts'),
        ],
      },
    ],
    actionLinks: [
      footerLink(copy.labels.actionContactHall, '/contact'),
      footerLink(copy.labels.actionReportConcern, '/report'),
      footerLink(copy.labels.actionViewNotices, '/notices'),
    ],
    legalLinks: [
      footerLink(copy.labels.legalAccessibility, '/accessibility'),
      footerLink(copy.labels.legalPrivacy, '/privacy'),
      footerLink(copy.labels.legalPublicRecords, '/records'),
    ],
  };
}

function link(
  label: string,
  href: string,
  options: {
    description?: string;
    icon?: HeaderLinkIcon;
  } = {},
): FrontendHeaderLink {
  return {
    type: 'link',
    label,
    href,
    description: options.description,
    icon: options.icon,
  };
}

function footerLink(label: string, href: string): FrontendFooterLink {
  return {
    label,
    href,
  };
}
