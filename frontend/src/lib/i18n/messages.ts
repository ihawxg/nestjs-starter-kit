import * as m from './paraglide/messages.js';
import type { SupportedLocale } from './locales';

export type AdminCopy = {
  shell: {
    closeNavigation: string;
    openNavigation: string;
    title: string;
    subtitle: string;
    navigationLabel: string;
    signOut: string;
    viewPublicSite: string;
    languageLabel: string;
    languages: Record<SupportedLocale, string>;
    nav: {
      dashboard: string;
      content: string;
      documents: string;
      settings: string;
    };
  };
  login: {
    title: string;
    subtitle: string;
    failedTitle: string;
    invalidEmail: string;
    missingPassword: string;
    email: string;
    password: string;
    submit: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    cards: Array<{
      title: string;
      description: string;
    }>;
  };
  notFound: {
    eyebrow: string;
    title: string;
    body: string;
    dashboard: string;
    publicSite: string;
  };
};

export type PublicNavigationCopy = {
  search: {
    label: string;
    placeholder: string;
  };
  labels: {
    access: string;
    actionContactHall: string;
    actionReportConcern: string;
    actionViewNotices: string;
    alerts: string;
    business: string;
    calendar: string;
    calloutCta: string;
    calloutDescription: string;
    calloutMeta: string;
    calloutTitle: string;
    community: string;
    contact: string;
    council: string;
    departments: string;
    government: string;
    home: string;
    legalAccessibility: string;
    legalPrivacy: string;
    legalPublicRecords: string;
    meetingAgendas: string;
    meetings: string;
    parks: string;
    payBill: string;
    permits: string;
    permitsInspections: string;
    publicNotices: string;
    reportIssue: string;
    residents: string;
    services: string;
    trashCollection: string;
    waterSewer: string;
  };
  descriptions: {
    alerts: string;
    calendar: string;
    council: string;
    parks: string;
    permits: string;
    publicNotices: string;
    trashCollection: string;
    waterSewer: string;
  };
};

export type PublicNotFoundCopy = {
  eyebrow: string;
  title: string;
  body: string;
  home: string;
  search: string;
};

export type PublicSiteFallbackCopy = {
  municipalityName: string;
  tagline: string;
  address: string;
  phone: string;
  officeHours: string;
};

export type PublicShellCopy = {
  mainLabel: string;
  header: {
    utilityNavigation: string;
    openNavigation: string;
    closeNavigation: string;
    mainMenu: string;
    mobileMenu: string;
  };
  footer: {
    officialSummary: string;
    navigationLabel: string;
    contactAria: string;
    addressLabel: string;
    phoneLabel: string;
    hoursLabel: string;
    emailLabel: string;
    copyrightPrefix: string;
    copyrightSuffix: string;
  };
};

export function getAdminCopy(locale: SupportedLocale): AdminCopy {
  return {
    shell: {
      closeNavigation: text(m.admin_shell_close_navigation, locale),
      openNavigation: text(m.admin_shell_open_navigation, locale),
      title: text(m.admin_shell_title, locale),
      subtitle: text(m.admin_shell_subtitle, locale),
      navigationLabel: text(m.admin_shell_navigation_label, locale),
      signOut: text(m.admin_shell_sign_out, locale),
      viewPublicSite: text(m.admin_shell_view_public_site, locale),
      languageLabel: text(m.admin_shell_language_label, locale),
      languages: {
        en: text(m.admin_language_en, locale),
        bg: text(m.admin_language_bg, locale),
      },
      nav: {
        dashboard: text(m.admin_nav_dashboard, locale),
        content: text(m.admin_nav_content, locale),
        documents: text(m.admin_nav_documents, locale),
        settings: text(m.admin_nav_settings, locale),
      },
    },
    login: {
      title: text(m.admin_login_title, locale),
      subtitle: text(m.admin_login_subtitle, locale),
      failedTitle: text(m.admin_login_failed_title, locale),
      invalidEmail: text(m.admin_login_invalid_email, locale),
      missingPassword: text(m.admin_login_missing_password, locale),
      email: text(m.admin_login_email, locale),
      password: text(m.admin_login_password, locale),
      submit: text(m.admin_login_submit, locale),
    },
    dashboard: {
      title: text(m.admin_dashboard_title, locale),
      subtitle: text(m.admin_dashboard_subtitle, locale),
      cards: [
        {
          title: text(m.admin_dashboard_card_content_title, locale),
          description: text(m.admin_dashboard_card_content_description, locale),
        },
        {
          title: text(m.admin_dashboard_card_accountability_title, locale),
          description: text(m.admin_dashboard_card_accountability_description, locale),
        },
        {
          title: text(m.admin_dashboard_card_publishing_title, locale),
          description: text(m.admin_dashboard_card_publishing_description, locale),
        },
        {
          title: text(m.admin_dashboard_card_api_title, locale),
          description: text(m.admin_dashboard_card_api_description, locale),
        },
      ],
    },
    notFound: {
      eyebrow: text(m.admin_not_found_eyebrow, locale),
      title: text(m.admin_not_found_title, locale),
      body: text(m.admin_not_found_body, locale),
      dashboard: text(m.admin_not_found_dashboard, locale),
      publicSite: text(m.admin_not_found_public_site, locale),
    },
  };
}

export function getPublicNavigationCopy(locale: SupportedLocale): PublicNavigationCopy {
  return {
    search: {
      label: text(m.public_nav_search_label, locale),
      placeholder: text(m.public_nav_search_placeholder, locale),
    },
    labels: {
      access: text(m.public_nav_access_title, locale),
      actionContactHall: text(m.public_nav_action_contact_hall, locale),
      actionReportConcern: text(m.public_nav_action_report_concern, locale),
      actionViewNotices: text(m.public_nav_action_view_notices, locale),
      alerts: text(m.public_nav_alerts_label, locale),
      business: text(m.public_nav_business_label, locale),
      calendar: text(m.public_nav_calendar_label, locale),
      calloutCta: text(m.public_nav_callout_cta, locale),
      calloutDescription: text(m.public_nav_callout_description, locale),
      calloutMeta: text(m.public_nav_callout_meta, locale),
      calloutTitle: text(m.public_nav_callout_title, locale),
      community: text(m.public_nav_community_title, locale),
      contact: text(m.public_nav_contact_label, locale),
      council: text(m.public_nav_council_label, locale),
      departments: text(m.public_nav_departments_label, locale),
      government: text(m.public_nav_government_label, locale),
      home: text(m.public_nav_home_label, locale),
      legalAccessibility: text(m.public_nav_legal_accessibility, locale),
      legalPrivacy: text(m.public_nav_legal_privacy, locale),
      legalPublicRecords: text(m.public_nav_legal_public_records, locale),
      meetingAgendas: text(m.public_nav_meeting_agendas_label, locale),
      meetings: text(m.public_nav_meetings_label, locale),
      parks: text(m.public_nav_parks_label, locale),
      payBill: text(m.public_nav_pay_bill_label, locale),
      permits: text(m.public_nav_permits_label, locale),
      permitsInspections: text(m.public_nav_permits_inspections_label, locale),
      publicNotices: text(m.public_nav_public_notices_label, locale),
      reportIssue: text(m.public_nav_report_issue_label, locale),
      residents: text(m.public_nav_residents_label, locale),
      services: text(m.public_nav_services_title, locale),
      trashCollection: text(m.public_nav_trash_collection_label, locale),
      waterSewer: text(m.public_nav_water_sewer_label, locale),
    },
    descriptions: {
      alerts: text(m.public_nav_alerts_description, locale),
      calendar: text(m.public_nav_calendar_description, locale),
      council: text(m.public_nav_council_description, locale),
      parks: text(m.public_nav_parks_description, locale),
      permits: text(m.public_nav_permits_description, locale),
      publicNotices: text(m.public_nav_public_notices_description, locale),
      trashCollection: text(m.public_nav_trash_collection_description, locale),
      waterSewer: text(m.public_nav_water_sewer_description, locale),
    },
  };
}

export function getPublicNotFoundCopy(locale: SupportedLocale): PublicNotFoundCopy {
  return {
    eyebrow: text(m.public_not_found_eyebrow, locale),
    title: text(m.public_not_found_title, locale),
    body: text(m.public_not_found_body, locale),
    home: text(m.public_not_found_home, locale),
    search: text(m.public_not_found_search, locale),
  };
}

export function getPublicSiteFallbackCopy(locale: SupportedLocale): PublicSiteFallbackCopy {
  return {
    municipalityName: text(m.public_site_fallback_municipality_name, locale),
    tagline: text(m.public_site_fallback_tagline, locale),
    address: text(m.public_site_fallback_address, locale),
    phone: text(m.public_site_fallback_phone, locale),
    officeHours: text(m.public_site_fallback_office_hours, locale),
  };
}

export function getPublicShellCopy(locale: SupportedLocale): PublicShellCopy {
  return {
    mainLabel: text(m.public_shell_main_label, locale),
    header: {
      utilityNavigation: text(m.public_shell_header_utility_navigation, locale),
      openNavigation: text(m.public_shell_header_open_navigation, locale),
      closeNavigation: text(m.public_shell_header_close_navigation, locale),
      mainMenu: text(m.public_shell_header_main_menu, locale),
      mobileMenu: text(m.public_shell_header_mobile_menu, locale),
    },
    footer: {
      officialSummary: text(m.public_shell_footer_official_summary, locale),
      navigationLabel: text(m.public_shell_footer_navigation_label, locale),
      contactAria: text(m.public_shell_footer_contact_aria, locale),
      addressLabel: text(m.public_shell_footer_address_label, locale),
      phoneLabel: text(m.public_shell_footer_phone_label, locale),
      hoursLabel: text(m.public_shell_footer_hours_label, locale),
      emailLabel: text(m.public_shell_footer_email_label, locale),
      copyrightPrefix: text(m.public_shell_footer_copyright_prefix, locale),
      copyrightSuffix: text(m.public_shell_footer_copyright_suffix, locale),
    },
  };
}

type EmptyMessage = (
  inputs?: Record<string, never>,
  options?: { locale?: SupportedLocale },
) => unknown;

function text(message: EmptyMessage, locale: SupportedLocale): string {
  return String(message({}, { locale }));
}
