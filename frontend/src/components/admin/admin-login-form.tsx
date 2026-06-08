'use client';

import {
  Alert,
  Button,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { loginAdmin } from '@/lib/admin-auth/client';
import { getAdminDashboardPath } from '@/lib/admin-auth/session';
import type { SupportedLocale } from '@/lib/i18n/locales';
import { getAdminCopy } from '@/lib/i18n/messages';

type AdminLoginFormProps = {
  locale: SupportedLocale;
};

export function AdminLoginForm({ locale }: AdminLoginFormProps) {
  const router = useRouter();
  const copy = getAdminCopy(locale);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => (/^\S+@\S+\.\S+$/.test(value) ? null : copy.login.invalidEmail),
      password: (value) => (value.trim().length > 0 ? null : copy.login.missingPassword),
    },
  });

  return (
    <Paper
      component="section"
      aria-labelledby="admin-login-title"
      withBorder
      shadow="sm"
      p="xl"
      radius="md"
      w="100%"
      maw={440}
    >
      <Stack gap="lg">
        <Stack gap={4}>
          <Title id="admin-login-title" order={1} size="h2">
            {copy.login.title}
          </Title>
          <Text c="dimmed" size="sm">
            {copy.login.subtitle}
          </Text>
        </Stack>

        {error ? (
          <Alert color="red" role="alert" title={copy.login.failedTitle}>
            {error}
          </Alert>
        ) : null}

        <form
          onSubmit={form.onSubmit(async (values) => {
            setError(null);
            setIsSubmitting(true);

            const result = await loginAdmin(values);
            setIsSubmitting(false);

            if (!result.ok) {
              setError(result.message);
              return;
            }

            router.push(getAdminDashboardPath(locale));
          })}
        >
          <Stack gap="md">
            <TextInput
              label={copy.login.email}
              type="email"
              autoComplete="username"
              required
              {...form.getInputProps('email')}
            />
            <PasswordInput
              label={copy.login.password}
              autoComplete="current-password"
              required
              {...form.getInputProps('password')}
            />
            <Button type="submit" loading={isSubmitting} fullWidth>
              {copy.login.submit}
            </Button>
          </Stack>
        </form>
      </Stack>
    </Paper>
  );
}
