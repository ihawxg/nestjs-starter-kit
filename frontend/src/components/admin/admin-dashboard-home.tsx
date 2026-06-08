'use client';

import { Card, Group, SimpleGrid, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { ClipboardList, Database, FileText, ShieldCheck } from 'lucide-react';
import type { SupportedLocale } from '@/lib/i18n/locales';
import { getAdminCopy } from '@/lib/i18n/messages';

const foundationCardIcons = [
  FileText,
  ShieldCheck,
  ClipboardList,
  Database,
] as const;

type AdminDashboardHomeProps = {
  locale: SupportedLocale;
};

export function AdminDashboardHome({ locale }: AdminDashboardHomeProps) {
  const copy = getAdminCopy(locale);

  return (
    <Stack gap="xl">
      <Stack gap={4}>
        <Title order={2}>{copy.dashboard.title}</Title>
        <Text c="dimmed">
          {copy.dashboard.subtitle}
        </Text>
      </Stack>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
        {copy.dashboard.cards.map((card, index) => {
          const Icon = foundationCardIcons[index];

          return (
            <Card key={card.title} withBorder radius="md" p="lg">
              <Group align="flex-start" gap="md">
                <ThemeIcon variant="light" size="lg" radius="md">
                  <Icon size={20} aria-hidden="true" />
                </ThemeIcon>
                <Stack gap={4} flex={1}>
                  <Title order={3} size="h4">
                    {card.title}
                  </Title>
                  <Text size="sm" c="dimmed">
                    {card.description}
                  </Text>
                </Stack>
              </Group>
            </Card>
          );
        })}
      </SimpleGrid>
    </Stack>
  );
}
