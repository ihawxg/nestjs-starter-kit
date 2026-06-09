'use client';

import { MantineProvider, createTheme } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';

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
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            gcTime: 5 * 60_000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={adminTheme}>
        <ModalsProvider>
          {children}
          <Notifications position="top-right" />
        </ModalsProvider>
      </MantineProvider>
    </QueryClientProvider>
  );
}
