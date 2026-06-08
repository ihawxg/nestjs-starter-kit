'use client';

import { MantineProvider, createTheme } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import type { ReactNode } from 'react';

const adminTheme = createTheme({
  primaryColor: 'blue',
  defaultRadius: 'sm',
  fontFamily:
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
});

type AdminProvidersProps = {
  children: ReactNode;
};

export function AdminProviders({ children }: AdminProvidersProps) {
  return (
    <MantineProvider theme={adminTheme}>
      <ModalsProvider>
        {children}
        <Notifications position="top-right" />
      </ModalsProvider>
    </MantineProvider>
  );
}
