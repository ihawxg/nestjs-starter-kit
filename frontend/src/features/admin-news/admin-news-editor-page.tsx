'use client';

import {
  Alert,
  Button,
  Collapse,
  Group,
  Loader,
  MultiSelect,
  Paper,
  Select,
  Stack,
  Tabs,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  type AdminNewsClientItem,
  type AdminNewsClientStatus,
} from '@/lib/admin-api/news-client';
import { getAdminCopy } from '@/lib/i18n/messages';
import type { SupportedLocale } from '@/lib/i18n/locales';
import { AdminNewsAssetsPanel } from './admin-news-assets-panel';
import { AdminNewsCategoriesPanel } from './admin-news-categories-panel';
import {
  useAdminNewsCategories,
  useAdminNewsItem,
  useCreateAdminNewsMutation,
  useUpdateAdminNewsMutation,
  useUploadAdminNewsAssetsForCreatedNewsMutation,
} from './admin-news-queries';
import { AdminNewsRichEditor } from './admin-news-rich-editor';
import { AdminNewsTranslationsPanel } from './admin-news-translations-panel';

type AdminNewsEditorPageProps = {
  locale: SupportedLocale;
  newsId?: number;
};

type NewsFormValues = {
  sourceLocale: SupportedLocale;
  title: string;
  slug: string;
  summary: string;
  body: string;
  status: AdminNewsClientStatus;
  publishedAt: string;
  categoryIds: string[];
};

export function AdminNewsEditorPage({ locale, newsId }: AdminNewsEditorPageProps) {
  const router = useRouter();
  const adminCopy = getAdminCopy(locale);
  const copy = adminCopy.news;
  const [showSourceOverride, setShowSourceOverride] = useState(false);
  const newsQuery = useAdminNewsItem(newsId);
  const categoriesQuery = useAdminNewsCategories();
  const createMutation = useCreateAdminNewsMutation();
  const updateMutation = useUpdateAdminNewsMutation(newsId ?? 0);
  const uploadCreatedAssetsMutation =
    useUploadAdminNewsAssetsForCreatedNewsMutation();
  const news = newsQuery.data ?? null;
  const [stagedAssetFiles, setStagedAssetFiles] = useState<File[]>([]);
  const categories = useMemo(
    () => categoriesQuery.data ?? [],
    [categoriesQuery.data],
  );
  const loading = categoriesQuery.isPending || (Boolean(newsId) && newsQuery.isPending);
  const error = categoriesQuery.isError || newsQuery.isError;
  const submitting =
    createMutation.isPending ||
    updateMutation.isPending ||
    uploadCreatedAssetsMutation.isPending;
  const [submitFailure, setSubmitFailure] = useState<string | null>(null);
  const submitError =
    submitFailure ??
    (createMutation.error
      ? getErrorMessage(createMutation.error)
      : updateMutation.error
        ? getErrorMessage(updateMutation.error)
        : uploadCreatedAssetsMutation.error
          ? getErrorMessage(uploadCreatedAssetsMutation.error)
        : null);

  const form = useForm<NewsFormValues>({
    initialValues: emptyValues(locale),
    validate: {
      title: required(copy.validation.required),
      slug: required(copy.validation.required),
      summary: required(copy.validation.required),
      body: required(copy.validation.required),
    },
  });

  useEffect(() => {
    if (news) {
      form.setValues(toFormValues(news, locale));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [news?.id]);

  useEffect(() => {
    if (!newsId) {
      form.setFieldValue('sourceLocale', locale);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, newsId]);

  function retry() {
    void categoriesQuery.refetch();
    if (newsId) {
      void newsQuery.refetch();
    }
  }

  const categoryOptions = useMemo(
    () =>
      categories
        .filter((item) => item.isActive)
        .map((item) => ({
          value: String(item.id),
          label: item.name,
        })),
    [categories],
  );

  async function submit(values: NewsFormValues) {
    setSubmitFailure(null);
    const body = {
      sourceLocale: showSourceOverride ? values.sourceLocale : locale,
      title: values.title,
      slug: values.slug,
      summary: values.summary,
      body: values.body,
      status: values.status,
      publishedAt: values.publishedAt
        ? new Date(values.publishedAt).toISOString()
        : undefined,
      categoryIds: values.categoryIds.map(Number),
    };
    try {
      const saved = newsId
        ? await updateMutation.mutateAsync(body)
        : await createMutation.mutateAsync(body);

      if (!newsId) {
        if (stagedAssetFiles.length > 0) {
          try {
            await uploadCreatedAssetsMutation.mutateAsync({
              files: stagedAssetFiles,
              newsId: saved.id,
            });
            setStagedAssetFiles([]);
          } catch (assetUploadError) {
            notifications.show({
              color: 'red',
              message: getErrorMessage(assetUploadError),
              title: copy.assets.uploadFailedTitle,
            });
          }
        }

        router.push(`/${locale}/admin/news/${saved.id}`);
      }
    } catch (submitError) {
      setSubmitFailure(getErrorMessage(submitError));
    }
  }

  if (loading) {
    return (
      <Group justify="center" p="xl">
        <Loader aria-label={copy.loading} />
        <Text>{copy.loading}</Text>
      </Group>
    );
  }

  if (error) {
    return (
      <Stack align="center" p="xl">
        <Text c="red">{copy.error}</Text>
        <Button onClick={retry}>{copy.actions.retry}</Button>
      </Stack>
    );
  }

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-start">
        <Stack gap={4}>
          <Title order={2}>
            {news ? news.title : copy.create.title}
          </Title>
          <Text c="dimmed">
            {news ? copy.list.subtitle : copy.create.subtitle}
          </Text>
        </Stack>
        <Button
          component={Link}
          href={`/${locale}/admin/news`}
          variant="light"
        >
          {copy.actions.cancel}
        </Button>
      </Group>

      <Tabs defaultValue="content" keepMounted={false}>
        <Tabs.List>
          <Tabs.Tab value="content">{adminCopy.shell.nav.content}</Tabs.Tab>
          {news ? <Tabs.Tab value="translations">{copy.translations.title}</Tabs.Tab> : null}
          <Tabs.Tab value="assets">{copy.assets.title}</Tabs.Tab>
          <Tabs.Tab value="categories">{copy.categories.title}</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="content" pt="md">
          <Paper withBorder radius="md" p="md">
            <form onSubmit={form.onSubmit((values) => void submit(values))}>
              <Stack gap="md">
                <Group grow>
                  <Select
                    label={copy.fields.status}
                    data={[
                      {
                        value: 'draft',
                        label: copy.statuses.draft,
                      },
                      {
                        value: 'published',
                        label: copy.statuses.published,
                      },
                      {
                        value: 'archived',
                        label: copy.statuses.archived,
                      },
                    ]}
                    {...form.getInputProps('status')}
                  />
                  <TextInput
                    type="datetime-local"
                    label={copy.fields.publishedAt}
                    {...form.getInputProps('publishedAt')}
                  />
                </Group>
                <Stack gap="xs">
                  <Button
                    type="button"
                    variant="subtle"
                    size="compact-sm"
                    onClick={() => setShowSourceOverride((value) => !value)}
                  >
                    {copy.fields.sourceLanguageAdvanced}
                  </Button>
                  <Collapse expanded={showSourceOverride}>
                    <Select
                      label={copy.fields.sourceLocale}
                      description={copy.fields.sourceLocaleDescription}
                      data={[
                        {
                          value: 'en',
                          label: adminCopy.shell.languages.en,
                        },
                        {
                          value: 'bg',
                          label: adminCopy.shell.languages.bg,
                        },
                      ]}
                      {...form.getInputProps('sourceLocale')}
                    />
                  </Collapse>
                </Stack>
                <TextInput
                  label={copy.fields.title}
                  {...form.getInputProps('title')}
                />
                <TextInput
                  label={copy.fields.slug}
                  {...form.getInputProps('slug')}
                />
                <Textarea
                  label={copy.fields.summary}
                  minRows={3}
                  {...form.getInputProps('summary')}
                />
                <MultiSelect
                  label={copy.fields.categories}
                  data={categoryOptions}
                  searchable
                  clearable
                  {...form.getInputProps('categoryIds')}
                />
                <AdminNewsRichEditor
                  copy={copy.editor}
                  label={copy.fields.body}
                  value={form.values.body}
                  error={readFormError(form.errors.body)}
                  onChange={(value) => form.setFieldValue('body', value)}
                />
                {submitError ? (
                  <Alert color="red" role="alert">
                    {submitError}
                  </Alert>
                ) : null}
                <Group>
                  <Button type="submit" loading={submitting}>
                    {news ? copy.actions.save : copy.actions.create}
                  </Button>
                </Group>
              </Stack>
            </form>
          </Paper>
        </Tabs.Panel>

        {news ? (
          <Tabs.Panel value="translations" pt="md">
            <AdminNewsTranslationsPanel copy={copy} newsId={news.id} />
          </Tabs.Panel>
        ) : null}

        <Tabs.Panel value="assets" pt="md">
          {news ? (
            <AdminNewsAssetsPanel
              assets={news.assets}
              copy={copy}
              mode="persisted"
              newsId={news.id}
            />
          ) : (
            <AdminNewsAssetsPanel
              copy={copy}
              files={stagedAssetFiles}
              mode="staged"
              onFilesChange={setStagedAssetFiles}
            />
          )}
        </Tabs.Panel>

        <Tabs.Panel value="categories" pt="md">
          <AdminNewsCategoriesPanel
            categories={categories}
            copy={copy}
            locale={locale}
          />
        </Tabs.Panel>
      </Tabs>
    </Stack>
  );
}

function emptyValues(locale: SupportedLocale): NewsFormValues {
  return {
    sourceLocale: locale,
    title: '',
    slug: '',
    summary: '',
    body: '',
    status: 'draft',
    publishedAt: '',
    categoryIds: [],
  };
}

function toFormValues(
  news: AdminNewsClientItem,
  locale: SupportedLocale,
): NewsFormValues {
  return {
    sourceLocale: locale,
    title: news.title,
    slug: news.slug,
    summary: news.summary,
    body: news.body,
    status: news.status,
    publishedAt: toDateTimeLocal(news.publishedAt),
    categoryIds: news.categories.map((category) => String(category.id)),
  };
}

function toDateTimeLocal(value: string | null | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 16);
}

function required(message: string) {
  return (value: string) => (value.trim().length > 0 ? null : message);
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : 'Admin news request failed.';
}

function readFormError(error: unknown): string | undefined {
  return typeof error === 'string' ? error : undefined;
}
