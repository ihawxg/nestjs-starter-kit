import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import { AdminProviders } from '@/components/admin/admin-providers';

export const metadata: Metadata = {
  title: 'Townhall Admin',
  description: 'Protected municipality administration dashboard.',
};

type AdminLayoutProps = {
  children: ReactNode;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  return <AdminProviders>{children}</AdminProviders>;
}
