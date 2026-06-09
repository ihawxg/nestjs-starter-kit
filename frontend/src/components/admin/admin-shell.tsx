'use client';

import {
  AppShell,
  Burger,
  Button,
  Group,
  NavLink,
  ScrollArea,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  FileText,
  Home,
  LayoutDashboard,
  LogOut,
  Newspaper,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import type { AdminAccount } from '@/lib/admin-api/auth';
import { logoutAdmin } from '@/lib/admin-auth/client';
import {
  getAdminDashboardPath,
  getAdminLoginPath,
  getAdminPublicSitePath,
  switchAdminLocalePath,
} from '@/lib/admin-auth/session';
import { getAdminCopy } from '@/lib/i18n/messages';
import { supportedLocales, type SupportedLocale } from '@/lib/i18n/locales';

type AdminShellProps = {
  account: AdminAccount;
  children: ReactNode;
  locale: SupportedLocale;
};

const adminNavigation = [
  {
    copyKey: 'dashboard',
    path: '',
    icon: LayoutDashboard,
  },
  {
    copyKey: 'news',
    path: '/news',
    icon: Newspaper,
  },
  {
    copyKey: 'documents',
    path: '/documents',
    icon: FileText,
  },
  {
    copyKey: 'settings',
    path: '/settings',
    icon: Settings,
  },
] as const;

export function AdminShell({ account, children, locale }: AdminShellProps) {
  const [opened, { toggle, close }] = useDisclosure();
  const router = useRouter();
  const pathname = usePathname() ?? getAdminDashboardPath(locale);
  const copy = getAdminCopy(locale);

  return (
    <AppShell
      header={{
        height: 64,
      }}
      navbar={{
        width: 280,
        breakpoint: 'md',
        collapsed: {
          mobile: !opened,
        },
      }}
      padding="lg"
    >
      <AppShell.Header>
        <Group h="100%" px="lg" justify="space-between">
          <Group gap="sm">
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="md"
              size="sm"
              aria-label={opened ? copy.shell.closeNavigation : copy.shell.openNavigation}
            />
            <ShieldCheck size={24} aria-hidden="true" />
            <Stack gap={0}>
              <Title order={1} size="h4">
                {copy.shell.title}
              </Title>
              <Text size="xs" c="dimmed">
                {copy.shell.subtitle}
              </Text>
            </Stack>
          </Group>

          <Group gap="sm">
            <Group gap={4} visibleFrom="sm" aria-label={copy.shell.languageLabel}>
              {supportedLocales.map((option) => (
                <Button
                  key={option}
                  component={Link}
                  href={switchAdminLocalePath(pathname, option)}
                  size="xs"
                  variant={option === locale ? 'filled' : 'subtle'}
                  color={option === locale ? 'blue' : 'gray'}
                  aria-current={option === locale ? 'page' : undefined}
                >
                  {copy.shell.languages[option]}
                </Button>
              ))}
            </Group>
            <Stack gap={0} visibleFrom="sm" ta="right">
              <Text size="sm" fw={600}>
                {account.firstName} {account.lastName}
              </Text>
              <Text size="xs" c="dimmed">
                {account.email}
              </Text>
            </Stack>
            <Button
              variant="light"
              leftSection={<LogOut size={16} aria-hidden="true" />}
              onClick={async () => {
                await logoutAdmin();
                router.push(getAdminLoginPath(locale));
              }}
            >
              {copy.shell.signOut}
            </Button>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar aria-label={copy.shell.navigationLabel}>
        <AppShell.Section px="md" py="lg">
          <Button
            component={Link}
            href={getAdminPublicSitePath(locale)}
            variant="subtle"
            color="gray"
            leftSection={<Home size={16} aria-hidden="true" />}
            fullWidth
          >
            {copy.shell.viewPublicSite}
          </Button>
        </AppShell.Section>

        <AppShell.Section grow component={ScrollArea} px="md">
          {adminNavigation.map((item) => {
            const Icon = item.icon;
            const href = `${getAdminDashboardPath(locale)}${item.path}`;

            return (
              <NavLink
                key={item.copyKey}
                component={Link}
                href={href}
                label={copy.shell.nav[item.copyKey]}
                leftSection={<Icon size={18} aria-hidden="true" />}
                onClick={close}
              />
            );
          })}
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
