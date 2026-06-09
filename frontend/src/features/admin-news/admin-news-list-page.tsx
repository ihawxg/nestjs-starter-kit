'use client';

import {
  Anchor,
  Badge,
  Button,
  Group,
  Loader,
  Pagination,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { Archive, Plus, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  type AdminNewsClientItem,
  type AdminNewsClientStatus,
} from '@/lib/admin-api/news-client';
import { formatPublicDate } from '@/lib/format/date';
import { getAdminCopy } from '@/lib/i18n/messages';
import type { SupportedLocale } from '@/lib/i18n/locales';
import {
  useAdminNewsCategories,
  useAdminNewsList,
  useArchiveAdminNewsMutation,
  useRestoreAdminNewsMutation,
} from './admin-news-queries';

type AdminNewsListPageProps = {
  locale: SupportedLocale;
};

const pageSize = 20;

export function AdminNewsListPage({ locale }: AdminNewsListPageProps) {
  const copy = getAdminCopy(locale).news;
  const [status, setStatus] = useState<AdminNewsClientStatus | ''>('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const newsQuery = useAdminNewsList({
    page,
    limit: pageSize,
    status,
    category,
  });
  const categoriesQuery = useAdminNewsCategories();
  const archiveMutation = useArchiveAdminNewsMutation();
  const restoreMutation = useRestoreAdminNewsMutation();
  const newsList = newsQuery.data;
  const categories = useMemo(
    () => categoriesQuery.data ?? [],
    [categoriesQuery.data],
  );
  const loading = newsQuery.isPending || categoriesQuery.isPending;
  const error = newsQuery.isError || categoriesQuery.isError;

  function retry() {
    void newsQuery.refetch();
    void categoriesQuery.refetch();
  }

  const categoryOptions = useMemo(
    () => [
      {
        value: '',
        label: copy.filters.allCategories,
      },
      ...categories
        .filter((item) => item.isActive)
        .map((item) => ({
          value: item.slug,
          label: item.name,
        })),
    ],
    [categories, copy.filters.allCategories],
  );

  const totalPages = Math.max(1, Math.ceil((newsList?.total ?? 0) / pageSize));

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-start">
        <Stack gap={4}>
          <Title order={2}>{copy.list.title}</Title>
          <Text c="dimmed">{copy.list.subtitle}</Text>
        </Stack>
        <Button
          component={Link}
          href={`/${locale}/admin/news/new`}
          leftSection={<Plus size={16} aria-hidden="true" />}
        >
          {copy.actions.create}
        </Button>
      </Group>

      <Paper withBorder p="md" radius="md">
        <Group align="flex-end">
          <Select
            label={copy.filters.status}
            value={status}
            onChange={(value) => {
              setStatus((value ?? '') as AdminNewsClientStatus | '');
              setPage(1);
            }}
            data={[
              {
                value: '',
                label: copy.filters.allStatuses,
              },
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
          />
          <Select
            label={copy.filters.category}
            value={category}
            onChange={(value) => {
              setCategory(value ?? '');
              setPage(1);
            }}
            data={categoryOptions}
          />
          <Button variant="light" onClick={retry}>
            {copy.actions.retry}
          </Button>
        </Group>
      </Paper>

      <Paper withBorder radius="md" p={0}>
        {loading ? (
          <Group justify="center" p="xl">
            <Loader aria-label={copy.loading} />
            <Text>{copy.loading}</Text>
          </Group>
        ) : error ? (
          <Stack align="center" p="xl">
            <Text c="red">{copy.error}</Text>
            <Button onClick={retry}>{copy.actions.retry}</Button>
          </Stack>
        ) : newsList && newsList.items.length > 0 ? (
          <Table.ScrollContainer minWidth={760}>
            <Table verticalSpacing="sm">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{copy.table.title}</Table.Th>
                  <Table.Th>{copy.table.status}</Table.Th>
                  <Table.Th>{copy.table.categories}</Table.Th>
                  <Table.Th>{copy.table.publishedAt}</Table.Th>
                  <Table.Th>{copy.table.updatedAt}</Table.Th>
                  <Table.Th>{copy.table.actions}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {newsList.items.map((item) => (
                  <NewsRow
                    key={item.id}
                    item={item}
                    locale={locale}
                    onArchive={async () => {
                      await archiveMutation.mutateAsync(item.id);
                    }}
                    onRestore={async () => {
                      await restoreMutation.mutateAsync(item.id);
                    }}
                    submitting={
                      (archiveMutation.isPending &&
                        archiveMutation.variables === item.id) ||
                      (restoreMutation.isPending &&
                        restoreMutation.variables === item.id)
                    }
                  />
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        ) : (
          <Text p="xl" c="dimmed">
            {copy.empty}
          </Text>
        )}
      </Paper>

      <Group justify="center">
        <Pagination total={totalPages} value={page} onChange={setPage} />
      </Group>
    </Stack>
  );
}

function NewsRow({
  item,
  locale,
  onArchive,
  onRestore,
  submitting,
}: {
  item: AdminNewsClientItem;
  locale: SupportedLocale;
  onArchive: () => Promise<void>;
  onRestore: () => Promise<void>;
  submitting: boolean;
}) {
  const copy = getAdminCopy(locale).news;

  return (
    <Table.Tr>
      <Table.Td>
        <Anchor component={Link} href={`/${locale}/admin/news/${item.id}`}>
          {item.title}
        </Anchor>
        <Text size="xs" c="dimmed">
          {item.slug}
        </Text>
      </Table.Td>
      <Table.Td>
        <Badge color={statusColor(item.status)} variant="light">
          {copy.statuses[item.status]}
        </Badge>
      </Table.Td>
      <Table.Td>
        {item.categories.length > 0
          ? item.categories.map((category) => category.name).join(', ')
          : copy.filters.allCategories}
      </Table.Td>
      <Table.Td>
        {item.publishedAt ? formatPublicDate(item.publishedAt, locale) : ''}
      </Table.Td>
      <Table.Td>{formatPublicDate(item.updatedAt, locale)}</Table.Td>
      <Table.Td>
        <Group gap="xs">
          <Button
            component={Link}
            href={`/${locale}/admin/news/${item.id}`}
            size="xs"
            variant="light"
          >
            {copy.actions.edit}
          </Button>
          {item.status !== 'archived' ? (
            <Button
              size="xs"
              variant="subtle"
              color="red"
              loading={submitting}
              leftSection={<Archive size={14} aria-hidden="true" />}
              onClick={() => void onArchive()}
            >
              {copy.actions.archive}
            </Button>
          ) : (
            <Button
              size="xs"
              variant="subtle"
              loading={submitting}
              leftSection={<RotateCcw size={14} aria-hidden="true" />}
              onClick={() => void onRestore()}
            >
              {copy.actions.restore}
            </Button>
          )}
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}

function statusColor(status: AdminNewsClientStatus): string {
  if (status === 'published') return 'green';
  if (status === 'archived') return 'gray';
  return 'yellow';
}
