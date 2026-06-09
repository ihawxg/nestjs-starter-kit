'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
import * as newsClient from '@/lib/admin-api/news-client';
import type { AdminNewsClientListQuery } from '@/lib/admin-api/news-client';

export const adminNewsQueryKeys = {
  all: ['admin-news'] as const,
  lists: () => [...adminNewsQueryKeys.all, 'list'] as const,
  list: (query: AdminNewsClientListQuery) =>
    [...adminNewsQueryKeys.lists(), normalizeListQuery(query)] as const,
  details: () => [...adminNewsQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...adminNewsQueryKeys.details(), id] as const,
  categories: () => [...adminNewsQueryKeys.all, 'categories'] as const,
  translations: (id: number) =>
    [...adminNewsQueryKeys.all, 'translations', id] as const,
};

export function useAdminNewsList(query: AdminNewsClientListQuery) {
  return useQuery({
    queryKey: adminNewsQueryKeys.list(query),
    queryFn: () => newsClient.fetchAdminNewsList(query),
  });
}

export function useAdminNewsItem(newsId: number | undefined) {
  return useQuery({
    queryKey: adminNewsQueryKeys.detail(newsId ?? 0),
    queryFn: () => {
      if (!newsId) throw new Error('Missing news id.');
      return newsClient.fetchAdminNewsItem(newsId);
    },
    enabled: Boolean(newsId),
  });
}

export function useAdminNewsCategories() {
  return useQuery({
    queryKey: adminNewsQueryKeys.categories(),
    queryFn: newsClient.fetchAdminNewsCategories,
  });
}

export function useAdminNewsTranslations(newsId: number) {
  return useQuery({
    queryKey: adminNewsQueryKeys.translations(newsId),
    queryFn: () => newsClient.fetchAdminNewsTranslations(newsId),
  });
}

export function useCreateAdminNewsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: Parameters<typeof newsClient.createAdminNewsItem>[0]) =>
      newsClient.createAdminNewsItem(body),
    onSuccess: (news) => invalidateNews(queryClient, news.id),
  });
}

export function useUpdateAdminNewsMutation(newsId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: Parameters<typeof newsClient.updateAdminNewsItem>[1]) =>
      newsClient.updateAdminNewsItem(newsId, body),
    onSuccess: (news) => invalidateNews(queryClient, news.id),
  });
}

export function useArchiveAdminNewsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => newsClient.archiveAdminNewsItem(id),
    onSuccess: (news) => invalidateNews(queryClient, news.id),
  });
}

export function useRestoreAdminNewsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => newsClient.restoreAdminNewsItem(id),
    onSuccess: (news) => invalidateNews(queryClient, news.id),
  });
}

export function useAssignAdminNewsCategoriesMutation(newsId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryIds: number[]) =>
      newsClient.assignAdminNewsItemCategories(newsId, categoryIds),
    onSuccess: (news) => invalidateNews(queryClient, news.id),
  });
}

export function useUploadAdminNewsAssetsMutation(newsId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (files: File[]) =>
      newsClient.uploadAdminNewsItemAssets(newsId, files),
    onSuccess: () => invalidateNews(queryClient, newsId),
  });
}

export function useUploadAdminNewsAssetsForCreatedNewsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { files: File[]; newsId: number }) =>
      newsClient.uploadAdminNewsItemAssets(input.newsId, input.files),
    onSuccess: (_, input) => invalidateNews(queryClient, input.newsId),
  });
}

export function useRemoveAdminNewsAssetMutation(newsId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (assetId: number) =>
      newsClient.removeAdminNewsItemAsset(newsId, assetId),
    onSuccess: () => invalidateNews(queryClient, newsId),
  });
}

export function useSaveAdminNewsTranslationMutation(newsId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      locale: Parameters<typeof newsClient.saveAdminNewsTranslation>[1];
      body: Parameters<typeof newsClient.saveAdminNewsTranslation>[2];
    }) =>
      newsClient.saveAdminNewsTranslation(newsId, input.locale, input.body),
    onSuccess: () => invalidateNewsTranslation(queryClient, newsId),
  });
}

export function useAutoTranslateAdminNewsMutation(newsId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      locale: Parameters<typeof newsClient.autoTranslateAdminNewsTranslation>[1],
    ) => newsClient.autoTranslateAdminNewsTranslation(newsId, locale),
    onSuccess: () => invalidateNewsTranslation(queryClient, newsId),
  });
}

export function useCreateAdminNewsCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      body: Parameters<typeof newsClient.createAdminNewsClientCategory>[0],
    ) => newsClient.createAdminNewsClientCategory(body),
    onSuccess: () => invalidateCategories(queryClient),
  });
}

export function useUpdateAdminNewsCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      id: Parameters<typeof newsClient.updateAdminNewsClientCategory>[0];
      body: Parameters<typeof newsClient.updateAdminNewsClientCategory>[1];
    }) => newsClient.updateAdminNewsClientCategory(input.id, input.body),
    onSuccess: () => invalidateCategories(queryClient),
  });
}

export function useDeactivateAdminNewsCategoryMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => newsClient.deactivateAdminNewsClientCategory(id),
    onSuccess: () => invalidateCategories(queryClient),
  });
}

function invalidateNews(queryClient: QueryClient, newsId: number) {
  void queryClient.invalidateQueries({
    queryKey: adminNewsQueryKeys.lists(),
  });
  void queryClient.invalidateQueries({
    queryKey: adminNewsQueryKeys.detail(newsId),
  });
  void invalidateNewsTranslation(queryClient, newsId);
}

function invalidateNewsTranslation(queryClient: QueryClient, newsId: number) {
  void queryClient.invalidateQueries({
    queryKey: adminNewsQueryKeys.translations(newsId),
  });
}

function invalidateCategories(queryClient: QueryClient) {
  void queryClient.invalidateQueries({
    queryKey: adminNewsQueryKeys.categories(),
  });
  void queryClient.invalidateQueries({
    queryKey: adminNewsQueryKeys.lists(),
  });
}

function normalizeListQuery(query: AdminNewsClientListQuery) {
  return {
    page: query.page ?? 1,
    limit: query.limit ?? 20,
    status: query.status ?? '',
    category: query.category ?? '',
  };
}
