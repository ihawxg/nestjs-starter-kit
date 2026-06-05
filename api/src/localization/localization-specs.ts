export interface LocalizedFieldSpec {
  property: string;
  column: string;
  kind: LocalizedFieldKind;
}

export enum LocalizedFieldKind {
  TEXT = 'text',
  HTML = 'html',
}

export interface LocalizationSpec {
  routeKey: string;
  parentTable: string;
  parentIdColumn: string;
  translationTable: string;
  translationForeignKey: string;
  fields: LocalizedFieldSpec[];
}

const field = (
  property: string,
  column = property,
  kind = LocalizedFieldKind.TEXT,
): LocalizedFieldSpec => ({
  property,
  column,
  kind,
});

export const LOCALIZATION_SPECS = {
  news: {
    routeKey: 'news',
    parentTable: 'news',
    parentIdColumn: 'id',
    translationTable: 'news_translations',
    translationForeignKey: 'news_id',
    fields: [
      field('title'),
      field('summary'),
      field('body', 'body', LocalizedFieldKind.HTML),
    ],
  },
  documents: {
    routeKey: 'documents',
    parentTable: 'documents',
    parentIdColumn: 'id',
    translationTable: 'document_translations',
    translationForeignKey: 'document_id',
    fields: [field('title'), field('description')],
  },
  categories: {
    routeKey: 'categories',
    parentTable: 'categories',
    parentIdColumn: 'id',
    translationTable: 'category_translations',
    translationForeignKey: 'category_id',
    fields: [field('name'), field('description')],
  },
  events: {
    routeKey: 'events',
    parentTable: 'events',
    parentIdColumn: 'id',
    translationTable: 'event_translations',
    translationForeignKey: 'event_id',
    fields: [field('title'), field('description'), field('location')],
  },
  departments: {
    routeKey: 'departments',
    parentTable: 'departments',
    parentIdColumn: 'id',
    translationTable: 'department_translations',
    translationForeignKey: 'department_id',
    fields: [
      field('name'),
      field('description'),
      field('address'),
      field('officeHours', 'office_hours'),
    ],
  },
  departmentContacts: {
    routeKey: 'department-contacts',
    parentTable: 'department_contacts',
    parentIdColumn: 'id',
    translationTable: 'department_contact_translations',
    translationForeignKey: 'department_contact_id',
    fields: [field('name'), field('title')],
  },
  pages: {
    routeKey: 'pages',
    parentTable: 'pages',
    parentIdColumn: 'id',
    translationTable: 'page_translations',
    translationForeignKey: 'page_id',
    fields: [
      field('title'),
      field('summary'),
      field('body', 'body', LocalizedFieldKind.HTML),
      field('seoTitle', 'seo_title'),
      field('seoDescription', 'seo_description'),
    ],
  },
  siteSettings: {
    routeKey: 'site-settings',
    parentTable: 'site_settings',
    parentIdColumn: 'id',
    translationTable: 'site_setting_translations',
    translationForeignKey: 'site_setting_id',
    fields: [
      field('municipalityName', 'municipality_name'),
      field('tagline'),
      field('address'),
      field('officeHours', 'office_hours'),
      field('seoTitle', 'seo_title'),
      field('seoDescription', 'seo_description'),
    ],
  },
  navigation: {
    routeKey: 'navigation',
    parentTable: 'navigation_items',
    parentIdColumn: 'id',
    translationTable: 'navigation_item_translations',
    translationForeignKey: 'navigation_item_id',
    fields: [field('label')],
  },
  alerts: {
    routeKey: 'alerts',
    parentTable: 'alerts',
    parentIdColumn: 'id',
    translationTable: 'alert_translations',
    translationForeignKey: 'alert_id',
    fields: [field('title'), field('message')],
  },
  staff: {
    routeKey: 'staff',
    parentTable: 'staff',
    parentIdColumn: 'id',
    translationTable: 'staff_translations',
    translationForeignKey: 'staff_id',
    fields: [
      field('firstName', 'first_name'),
      field('lastName', 'last_name'),
      field('title'),
      field('bio'),
    ],
  },
  officials: {
    routeKey: 'officials',
    parentTable: 'officials',
    parentIdColumn: 'id',
    translationTable: 'official_translations',
    translationForeignKey: 'official_id',
    fields: [
      field('firstName', 'first_name'),
      field('lastName', 'last_name'),
      field('role'),
      field('district'),
      field('bio'),
    ],
  },
  committees: {
    routeKey: 'committees',
    parentTable: 'committees',
    parentIdColumn: 'id',
    translationTable: 'committee_translations',
    translationForeignKey: 'committee_id',
    fields: [field('name'), field('description')],
  },
  media: {
    routeKey: 'media',
    parentTable: 'stored_files',
    parentIdColumn: 'id',
    translationTable: 'media_translations',
    translationForeignKey: 'stored_file_id',
    fields: [
      field('displayName', 'display_name'),
      field('altText', 'alt_text'),
      field('caption'),
    ],
  },
} satisfies Record<string, LocalizationSpec>;

export const ROUTE_LOCALIZATION_SPECS = Object.fromEntries(
  Object.values(LOCALIZATION_SPECS).map((spec) => [spec.routeKey, spec]),
) as Record<string, LocalizationSpec>;
