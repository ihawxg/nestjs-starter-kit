'use client';

import {
  Badge,
  Button,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core';
import { useMemo, useState } from 'react';
import type { AdminNewsClientTranslation } from '@/lib/admin-api/news-client';
import type { AdminCopy } from '@/lib/i18n/messages';
import type { SupportedLocale } from '@/lib/i18n/locales';
import {
  useAdminNewsTranslations,
  useAutoTranslateAdminNewsMutation,
  useSaveAdminNewsTranslationMutation,
} from './admin-news-queries';
import { AdminNewsRichEditor } from './admin-news-rich-editor';

type TranslationFields = {
  title: string;
  summary: string;
  body: string;
};

type AdminNewsTranslationsPanelProps = {
  copy: AdminCopy['news'];
  newsId: number;
};

const locales: SupportedLocale[] = ['en', 'bg'];

export function AdminNewsTranslationsPanel({
  copy,
  newsId,
}: AdminNewsTranslationsPanelProps) {
  const [fieldOverrides, setFieldOverrides] = useState<
    Partial<Record<SupportedLocale, Partial<TranslationFields>>>
  >({});
  const [submitting, setSubmitting] = useState<SupportedLocale | null>(null);
  const translationsQuery = useAdminNewsTranslations(newsId);
  const saveMutation = useSaveAdminNewsTranslationMutation(newsId);
  const autoTranslateMutation = useAutoTranslateAdminNewsMutation(newsId);
  const translations = useMemo(
    () => translationsQuery.data ?? [],
    [translationsQuery.data],
  );
  const baseFields = useMemo(
    () => ({
      en: toFields(translations.find((item) => item.locale === 'en')),
      bg: toFields(translations.find((item) => item.locale === 'bg')),
    }),
    [translations],
  );

  async function save(locale: SupportedLocale) {
    setSubmitting(locale);
    try {
      await saveMutation.mutateAsync({
        locale,
        body: getFields(locale),
      });
      setFieldOverrides((current) => ({
        ...current,
        [locale]: {},
      }));
      await translationsQuery.refetch();
    } finally {
      setSubmitting(null);
    }
  }

  async function autoTranslate(locale: SupportedLocale) {
    setSubmitting(locale);
    try {
      const translation = await autoTranslateMutation.mutateAsync(locale);
      setFieldOverrides((current) => ({
        ...current,
        [locale]: toFields(translation),
      }));
      await translationsQuery.refetch();
    } finally {
      setSubmitting(null);
    }
  }

  return (
    <Paper withBorder radius="md" p="md">
      <Stack gap="lg">
        <Stack gap={4}>
          <Title order={3} size="h4">
            {copy.translations.title}
          </Title>
          <Text c="dimmed">{copy.translations.subtitle}</Text>
        </Stack>
        {translationsQuery.isPending ? (
          <Group>
            <Loader size="sm" aria-label={copy.loading} />
            <Text>{copy.loading}</Text>
          </Group>
        ) : null}
        {translationsQuery.isError ? <Text c="red">{copy.error}</Text> : null}
        {!translationsQuery.isPending && translations.length === 0 ? (
          <Text c="dimmed">{copy.translations.empty}</Text>
        ) : null}
        {locales.map((locale) => {
          const translation = translations.find((item) => item.locale === locale);
          const source = translation?.translationSource;

          return (
            <Paper key={locale} withBorder radius="md" p="md">
              <Stack gap="md">
                <Group justify="space-between">
                  <Title order={4} size="h5">
                    {locale === 'en'
                      ? copy.translations.localeEn
                      : copy.translations.localeBg}
                  </Title>
                  {source ? (
                    <Badge variant="light">
                      {source === 'machine'
                        ? copy.translations.sourceMachine
                        : copy.translations.sourceManual}
                    </Badge>
                  ) : null}
                </Group>
                <TextInput
                  label={copy.fields.title}
                  value={getFields(locale).title}
                  onChange={(event) =>
                    updateField(locale, 'title', event.currentTarget.value)
                  }
                />
                <Textarea
                  label={copy.translations.summary}
                  value={getFields(locale).summary}
                  onChange={(event) =>
                    updateField(locale, 'summary', event.currentTarget.value)
                  }
                  minRows={3}
                />
                <AdminNewsRichEditor
                  copy={copy.editor}
                  label={copy.translations.body}
                  value={getFields(locale).body}
                  onChange={(value) => updateField(locale, 'body', value)}
                />
                <Group>
                  <Button
                    loading={submitting === locale}
                    onClick={() => void save(locale)}
                  >
                    {copy.translations.save}
                  </Button>
                  <Button
                    variant="light"
                    loading={submitting === locale}
                    onClick={() => void autoTranslate(locale)}
                  >
                    {copy.translations.auto}
                  </Button>
                </Group>
              </Stack>
            </Paper>
          );
        })}
      </Stack>
    </Paper>
  );

  function updateField(
    locale: SupportedLocale,
    field: keyof TranslationFields,
    value: string,
  ) {
    setFieldOverrides((current) => ({
      ...current,
      [locale]: {
        ...getFields(locale),
        ...current[locale],
        [field]: value,
      },
    }));
  }

  function getFields(locale: SupportedLocale): TranslationFields {
    return {
      ...baseFields[locale],
      ...fieldOverrides[locale],
    };
  }
}

function toFields(
  translation: AdminNewsClientTranslation | undefined,
): TranslationFields {
  return {
    title: readField(translation, 'title'),
    summary: readField(translation, 'summary'),
    body: readField(translation, 'body'),
  };
}

function readField(
  translation: AdminNewsClientTranslation | undefined,
  field: keyof TranslationFields,
): string {
  const value = translation?.fields[field];
  return typeof value === 'string' ? value : '';
}
