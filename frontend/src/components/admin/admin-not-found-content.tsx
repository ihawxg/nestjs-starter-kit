'use client';

import { Button, Card, Group, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { ArrowLeft, LayoutDashboard, SearchX } from 'lucide-react';
import Link from 'next/link';
import {
  getAdminDashboardPath,
  getAdminPublicSitePath,
} from '@/lib/admin-auth/session';
import type { SupportedLocale } from '@/lib/i18n/locales';
import { getAdminCopy } from '@/lib/i18n/messages';

type AdminNotFoundContentProps = {
  locale: SupportedLocale;
};

export function AdminNotFoundContent({ locale }: AdminNotFoundContentProps) {
  const copy = getAdminCopy(locale);

  return (
    <Card withBorder shadow="sm" maw={720} mx="auto" mt="xl" p="xl">
      <Stack gap="lg" align="flex-start">
        <ThemeIcon size={52} radius="md" variant="light" color="gray">
          <SearchX size={28} aria-hidden="true" />
        </ThemeIcon>

        <Stack gap="xs">
          <Text size="sm" fw={700} c="dimmed" tt="uppercase">
            {copy.notFound.eyebrow}
          </Text>
          <Title order={1}>{copy.notFound.title}</Title>
          <Text c="dimmed" maw={560}>
            {copy.notFound.body}
          </Text>
        </Stack>

        <Group>
          <Button
            component={Link}
            href={getAdminDashboardPath(locale)}
            leftSection={<LayoutDashboard size={16} aria-hidden="true" />}
          >
            {copy.notFound.dashboard}
          </Button>
          <Button
            component={Link}
            href={getAdminPublicSitePath(locale)}
            variant="light"
            color="gray"
            leftSection={<ArrowLeft size={16} aria-hidden="true" />}
          >
            {copy.notFound.publicSite}
          </Button>
        </Group>
      </Stack>
    </Card>
  );
}
