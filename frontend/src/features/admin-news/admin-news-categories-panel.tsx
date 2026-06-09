'use client';

import {
  Badge,
  Button,
  Collapse,
  Group,
  NumberInput,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Textarea,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useEffect, useState } from 'react';
import type { AdminNewsClientCategory } from '@/lib/admin-api/news-client';
import type { AdminCopy } from '@/lib/i18n/messages';
import type { SupportedLocale } from '@/lib/i18n/locales';
import {
  useCreateAdminNewsCategoryMutation,
  useDeactivateAdminNewsCategoryMutation,
  useUpdateAdminNewsCategoryMutation,
} from './admin-news-queries';

type AdminNewsCategoriesPanelProps = {
  categories: AdminNewsClientCategory[];
  copy: AdminCopy['news'];
  locale: SupportedLocale;
};

type CategoryFormValues = {
  sourceLocale: 'en' | 'bg';
  name: string;
  slug: string;
  description: string;
  displayOrder: number;
};

export function AdminNewsCategoriesPanel({
  categories,
  copy,
  locale,
}: AdminNewsCategoriesPanelProps) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showSourceOverride, setShowSourceOverride] = useState(false);
  const createMutation = useCreateAdminNewsCategoryMutation();
  const updateMutation = useUpdateAdminNewsCategoryMutation();
  const deactivateMutation = useDeactivateAdminNewsCategoryMutation();
  const submitting =
    createMutation.isPending ||
    updateMutation.isPending ||
    deactivateMutation.isPending;
  const form = useForm<CategoryFormValues>({
    initialValues: emptyValues(locale),
    validate: {
      name: required(copy.validation.required),
      slug: required(copy.validation.required),
    },
  });

  useEffect(() => {
    const editingCategory = categories.find((item) => item.id === editingId);
    if (!editingCategory) return;
    form.setValues({
      sourceLocale: editingCategory.sourceLocale ?? locale,
      name: editingCategory.name,
      slug: editingCategory.slug,
      description: editingCategory.description ?? '',
      displayOrder: editingCategory.displayOrder ?? 0,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingId]);

  useEffect(() => {
    if (!editingId) {
      form.setFieldValue('sourceLocale', locale);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, editingId]);

  async function submit(values: CategoryFormValues) {
    const body = {
      ...values,
      sourceLocale: showSourceOverride ? values.sourceLocale : locale,
    };
    if (editingId) {
      await updateMutation.mutateAsync({
        id: editingId,
        body,
      });
    } else {
      await createMutation.mutateAsync(body);
    }
    form.setValues(emptyValues(locale));
    setEditingId(null);
  }

  async function deactivate(id: number) {
    await deactivateMutation.mutateAsync(id);
  }

  return (
    <Paper withBorder radius="md" p="md">
      <Stack gap="lg">
        <Title order={3} size="h4">
          {copy.categories.title}
        </Title>
        <form onSubmit={form.onSubmit((values) => void submit(values))}>
          <Stack gap="sm">
            <Group grow>
              <TextInput
                label={copy.categories.name}
                {...form.getInputProps('name')}
              />
              <TextInput
                label={copy.categories.slug}
                {...form.getInputProps('slug')}
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
                      label: copy.fields.sourceLocaleEn,
                    },
                    {
                      value: 'bg',
                      label: copy.fields.sourceLocaleBg,
                    },
                  ]}
                  {...form.getInputProps('sourceLocale')}
                />
              </Collapse>
            </Stack>
            <Textarea
              label={copy.categories.description}
              {...form.getInputProps('description')}
            />
            <NumberInput
              min={0}
              label={copy.categories.displayOrder}
              {...form.getInputProps('displayOrder')}
            />
            <Group>
              <Button type="submit" loading={submitting}>
                {editingId ? copy.categories.save : copy.categories.create}
              </Button>
              {editingId ? (
                <Button
                  variant="subtle"
                  onClick={() => {
                    setEditingId(null);
                    form.setValues(emptyValues(locale));
                  }}
                >
                  {copy.actions.cancel}
                </Button>
              ) : null}
            </Group>
          </Stack>
        </form>

        {categories.length > 0 ? (
          <Table.ScrollContainer minWidth={680}>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>{copy.categories.name}</Table.Th>
                  <Table.Th>{copy.categories.slug}</Table.Th>
                  <Table.Th>{copy.categories.displayOrder}</Table.Th>
                  <Table.Th>{copy.fields.status}</Table.Th>
                  <Table.Th>{copy.table.actions}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {categories.map((category) => (
                  <Table.Tr key={category.id}>
                    <Table.Td>{category.name}</Table.Td>
                    <Table.Td>{category.slug}</Table.Td>
                    <Table.Td>{category.displayOrder ?? 0}</Table.Td>
                    <Table.Td>
                      <Badge color={category.isActive ? 'green' : 'gray'}>
                        {category.isActive
                          ? copy.categories.active
                          : copy.categories.inactive}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Button
                          size="xs"
                          variant="light"
                          onClick={() => setEditingId(category.id)}
                        >
                          {copy.actions.edit}
                        </Button>
                        {category.isActive ? (
                          <Button
                            size="xs"
                            variant="subtle"
                            color="red"
                            loading={
                              deactivateMutation.isPending &&
                              deactivateMutation.variables === category.id
                            }
                            onClick={() => void deactivate(category.id)}
                          >
                            {copy.categories.deactivate}
                          </Button>
                        ) : null}
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        ) : (
          <Text c="dimmed">{copy.categories.empty}</Text>
        )}
      </Stack>
    </Paper>
  );
}

function emptyValues(locale: SupportedLocale): CategoryFormValues {
  return {
    sourceLocale: locale,
    name: '',
    slug: '',
    description: '',
    displayOrder: 0,
  };
}

function required(message: string) {
  return (value: string) => (value.trim().length > 0 ? null : message);
}
