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
      news: string;
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
  news: {
    actions: {
      archive: string;
      cancel: string;
      create: string;
      edit: string;
      retry: string;
      restore: string;
      save: string;
    };
    assets: {
      closePreview: string;
      csvPreviewLabel: string;
      description: string;
      download: string;
      dropzoneDescription: string;
      dropzoneLabel: string;
      dropzoneTitle: string;
      empty: string;
      filePreviewLabel: string;
      fileTypeUnknown: string;
      imagePreviewAlt: string;
      openInBrowser: string;
      pendingEmpty: string;
      pendingTitle: string;
      pdfPreviewLabel: string;
      preview: string;
      previewFailed: string;
      previewLoading: string;
      previewTitle: string;
      previewTruncated: string;
      previewUnavailable: string;
      remove: string;
      select: string;
      stagedHelp: string;
      stagedTitle: string;
      title: string;
      upload: string;
      uploadAfterCreate: string;
      uploadFailedTitle: string;
      uploadedTitle: string;
      textPreviewLabel: string;
      unsupportedPreview: string;
      view: string;
    };
    categories: {
      active: string;
      create: string;
      deactivate: string;
      description: string;
      displayOrder: string;
      empty: string;
      inactive: string;
      name: string;
      save: string;
      slug: string;
      title: string;
    };
    create: {
      title: string;
      subtitle: string;
    };
    editor: {
      blockquote: string;
      bold: string;
      bulletList: string;
      clearFormatting: string;
      headingThree: string;
      headingTwo: string;
      horizontalRule: string;
      italic: string;
      link: string;
      orderedList: string;
      paragraph: string;
      previewHtml: string;
      redo: string;
      strikethrough: string;
      title: string;
      underline: string;
      undo: string;
      unlink: string;
    };
    empty: string;
    error: string;
    fields: {
      body: string;
      categories: string;
      publishedAt: string;
      slug: string;
      sourceLanguageAdvanced: string;
      sourceLocale: string;
      sourceLocaleBg: string;
      sourceLocaleDescription: string;
      sourceLocaleEn: string;
      status: string;
      summary: string;
      title: string;
    };
    filters: {
      allCategories: string;
      allStatuses: string;
      category: string;
      status: string;
    };
    list: {
      title: string;
      subtitle: string;
    };
    loading: string;
    statuses: {
      draft: string;
      published: string;
      archived: string;
    };
    table: {
      actions: string;
      categories: string;
      publishedAt: string;
      status: string;
      title: string;
      updatedAt: string;
    };
    translations: {
      auto: string;
      body: string;
      empty: string;
      localeBg: string;
      localeEn: string;
      save: string;
      sourceMachine: string;
      sourceManual: string;
      subtitle: string;
      summary: string;
      title: string;
    };
    validation: {
      required: string;
    };
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
    news: string;
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

export type PublicNewsCopy = {
  breadcrumbs: {
    ariaLabel: string;
    home: string;
    news: string;
  };
  list: {
    title: string;
    subtitle: string;
    allCategories: string;
    empty: string;
    readMore: string;
    previous: string;
    next: string;
    paginationLabel: string;
    pageLabel: string;
  };
  detail: {
    published: string;
    attachments: string;
    download: string;
    fallbackNotice: string;
    noAttachments: string;
    backToNews: string;
  };
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
        news: text(m.admin_nav_news, locale),
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
    news: {
      actions: {
        archive: text(m.admin_news_action_archive, locale),
        cancel: text(m.admin_news_action_cancel, locale),
        create: text(m.admin_news_action_create, locale),
        edit: text(m.admin_news_action_edit, locale),
        retry: text(m.admin_news_action_retry, locale),
        restore: text(m.admin_news_action_restore, locale),
        save: text(m.admin_news_action_save, locale),
      },
      assets: {
        closePreview: text(m.admin_news_assets_close_preview, locale),
        csvPreviewLabel: text(m.admin_news_assets_csv_preview_label, locale),
        description: text(m.admin_news_assets_description, locale),
        download: text(m.admin_news_assets_download, locale),
        dropzoneDescription: text(
          m.admin_news_assets_dropzone_description,
          locale,
        ),
        dropzoneLabel: text(m.admin_news_assets_dropzone_label, locale),
        dropzoneTitle: text(m.admin_news_assets_dropzone_title, locale),
        empty: text(m.admin_news_assets_empty, locale),
        filePreviewLabel: text(m.admin_news_assets_file_preview_label, locale),
        fileTypeUnknown: text(m.admin_news_assets_file_type_unknown, locale),
        imagePreviewAlt: text(m.admin_news_assets_image_preview_alt, locale),
        openInBrowser: text(m.admin_news_assets_open_in_browser, locale),
        pendingEmpty: text(m.admin_news_assets_pending_empty, locale),
        pendingTitle: text(m.admin_news_assets_pending_title, locale),
        pdfPreviewLabel: text(m.admin_news_assets_pdf_preview_label, locale),
        preview: text(m.admin_news_assets_preview, locale),
        previewFailed: text(m.admin_news_assets_preview_failed, locale),
        previewLoading: text(m.admin_news_assets_preview_loading, locale),
        previewTitle: text(m.admin_news_assets_preview_title, locale),
        previewTruncated: text(m.admin_news_assets_preview_truncated, locale),
        previewUnavailable: text(
          m.admin_news_assets_preview_unavailable,
          locale,
        ),
        remove: text(m.admin_news_assets_remove, locale),
        select: text(m.admin_news_assets_select, locale),
        stagedHelp: text(m.admin_news_assets_staged_help, locale),
        stagedTitle: text(m.admin_news_assets_staged_title, locale),
        title: text(m.admin_news_assets_title, locale),
        upload: text(m.admin_news_assets_upload, locale),
        uploadAfterCreate: text(m.admin_news_assets_upload_after_create, locale),
        uploadFailedTitle: text(m.admin_news_assets_upload_failed_title, locale),
        uploadedTitle: text(m.admin_news_assets_uploaded_title, locale),
        textPreviewLabel: text(m.admin_news_assets_text_preview_label, locale),
        unsupportedPreview: text(
          m.admin_news_assets_unsupported_preview,
          locale,
        ),
        view: text(m.admin_news_assets_view, locale),
      },
      categories: {
        active: text(m.admin_news_categories_active, locale),
        create: text(m.admin_news_categories_create, locale),
        deactivate: text(m.admin_news_categories_deactivate, locale),
        description: text(m.admin_news_categories_description, locale),
        displayOrder: text(m.admin_news_categories_display_order, locale),
        empty: text(m.admin_news_categories_empty, locale),
        inactive: text(m.admin_news_categories_inactive, locale),
        name: text(m.admin_news_categories_name, locale),
        save: text(m.admin_news_categories_save, locale),
        slug: text(m.admin_news_categories_slug, locale),
        title: text(m.admin_news_categories_title, locale),
      },
      create: {
        title: text(m.admin_news_create_title, locale),
        subtitle: text(m.admin_news_create_subtitle, locale),
      },
      editor: {
        blockquote: text(m.admin_news_editor_blockquote, locale),
        bold: text(m.admin_news_editor_bold, locale),
        bulletList: text(m.admin_news_editor_bullet_list, locale),
        clearFormatting: text(m.admin_news_editor_clear_formatting, locale),
        headingThree: text(m.admin_news_editor_heading_three, locale),
        headingTwo: text(m.admin_news_editor_heading_two, locale),
        horizontalRule: text(m.admin_news_editor_horizontal_rule, locale),
        italic: text(m.admin_news_editor_italic, locale),
        link: text(m.admin_news_editor_link, locale),
        orderedList: text(m.admin_news_editor_ordered_list, locale),
        paragraph: text(m.admin_news_editor_paragraph, locale),
        previewHtml: text(m.admin_news_editor_preview_html, locale),
        redo: text(m.admin_news_editor_redo, locale),
        strikethrough: text(m.admin_news_editor_strikethrough, locale),
        title: text(m.admin_news_editor_title, locale),
        underline: text(m.admin_news_editor_underline, locale),
        undo: text(m.admin_news_editor_undo, locale),
        unlink: text(m.admin_news_editor_unlink, locale),
      },
      empty: text(m.admin_news_empty, locale),
      error: text(m.admin_news_error, locale),
      fields: {
        body: text(m.admin_news_field_body, locale),
        categories: text(m.admin_news_field_categories, locale),
        publishedAt: text(m.admin_news_field_published_at, locale),
        slug: text(m.admin_news_field_slug, locale),
        sourceLanguageAdvanced: text(
          m.admin_news_field_source_language_advanced,
          locale,
        ),
        sourceLocale: text(m.admin_news_field_source_locale, locale),
        sourceLocaleBg: text(m.admin_news_field_source_locale_bg, locale),
        sourceLocaleDescription: text(
          m.admin_news_field_source_locale_description,
          locale,
        ),
        sourceLocaleEn: text(m.admin_news_field_source_locale_en, locale),
        status: text(m.admin_news_field_status, locale),
        summary: text(m.admin_news_field_summary, locale),
        title: text(m.admin_news_field_title, locale),
      },
      filters: {
        allCategories: text(m.admin_news_filter_all_categories, locale),
        allStatuses: text(m.admin_news_filter_all_statuses, locale),
        category: text(m.admin_news_filter_category, locale),
        status: text(m.admin_news_filter_status, locale),
      },
      list: {
        title: text(m.admin_news_list_title, locale),
        subtitle: text(m.admin_news_list_subtitle, locale),
      },
      loading: text(m.admin_news_loading, locale),
      statuses: {
        draft: text(m.admin_news_status_draft, locale),
        published: text(m.admin_news_status_published, locale),
        archived: text(m.admin_news_status_archived, locale),
      },
      table: {
        actions: text(m.admin_news_table_actions, locale),
        categories: text(m.admin_news_table_categories, locale),
        publishedAt: text(m.admin_news_table_published_at, locale),
        status: text(m.admin_news_table_status, locale),
        title: text(m.admin_news_table_title, locale),
        updatedAt: text(m.admin_news_table_updated_at, locale),
      },
      translations: {
        auto: text(m.admin_news_translations_auto, locale),
        body: text(m.admin_news_translations_body, locale),
        empty: text(m.admin_news_translations_empty, locale),
        localeBg: text(m.admin_news_translations_locale_bg, locale),
        localeEn: text(m.admin_news_translations_locale_en, locale),
        save: text(m.admin_news_translations_save, locale),
        sourceMachine: text(m.admin_news_translations_source_machine, locale),
        sourceManual: text(m.admin_news_translations_source_manual, locale),
        subtitle: text(m.admin_news_translations_subtitle, locale),
        summary: text(m.admin_news_translations_summary, locale),
        title: text(m.admin_news_translations_title, locale),
      },
      validation: {
        required: text(m.admin_news_validation_required, locale),
      },
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
      news: text(m.public_nav_news_label, locale),
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

export function getPublicNewsCopy(locale: SupportedLocale): PublicNewsCopy {
  return {
    breadcrumbs: {
      ariaLabel: text(m.public_news_breadcrumb_aria_label, locale),
      home: text(m.public_news_breadcrumb_home, locale),
      news: text(m.public_news_breadcrumb_news, locale),
    },
    list: {
      title: text(m.public_news_list_title, locale),
      subtitle: text(m.public_news_list_subtitle, locale),
      allCategories: text(m.public_news_list_all_categories, locale),
      empty: text(m.public_news_list_empty, locale),
      readMore: text(m.public_news_list_read_more, locale),
      previous: text(m.public_news_list_previous, locale),
      next: text(m.public_news_list_next, locale),
      paginationLabel: text(m.public_news_list_pagination_label, locale),
      pageLabel: text(m.public_news_list_page_label, locale),
    },
    detail: {
      published: text(m.public_news_detail_published, locale),
      attachments: text(m.public_news_detail_attachments, locale),
      download: text(m.public_news_detail_download, locale),
      fallbackNotice: text(m.public_news_detail_fallback_notice, locale),
      noAttachments: text(m.public_news_detail_no_attachments, locale),
      backToNews: text(m.public_news_detail_back_to_news, locale),
    },
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
