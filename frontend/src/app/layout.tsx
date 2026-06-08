import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { defaultLocale } from '@/lib/i18n/locales';
import '@/styles/globals.css';

export const metadata: Metadata = {
  title: 'Townhall Manipulicity',
  description: 'Public municipality website shell.',
};

type RootLayoutProps = {
  children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang={defaultLocale} suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
