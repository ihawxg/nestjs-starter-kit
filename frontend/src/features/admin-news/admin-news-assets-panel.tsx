'use client';

import {
  Alert,
  AspectRatio,
  Badge,
  Box,
  Button,
  Card,
  Center,
  Group,
  Image as MantineImage,
  Loader,
  Modal,
  Paper,
  ScrollArea,
  SimpleGrid,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { Dropzone } from '@mantine/dropzone';
import {
  Download,
  ExternalLink,
  Eye,
  File as FileIcon,
  FileSpreadsheet,
  FileText,
  ImageIcon,
  Trash2,
} from 'lucide-react';
import Papa from 'papaparse';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  fetchAdminNewsAssetPreviewText,
  getAdminNewsAssetDownloadUrl,
  getAdminNewsAssetViewUrl,
  type AdminNewsClientAsset,
} from '@/lib/admin-api/news-client';
import type { AdminCopy } from '@/lib/i18n/messages';
import {
  useRemoveAdminNewsAssetMutation,
  useUploadAdminNewsAssetsMutation,
} from './admin-news-queries';

const TEXT_PREVIEW_MAX_BYTES = 512 * 1024;
const CSV_PREVIEW_MAX_ROWS = 100;
const CSV_PREVIEW_MAX_COLUMNS = 20;

type BaseAdminNewsAssetsPanelProps = {
  copy: AdminCopy['news'];
};

type PersistedAdminNewsAssetsPanelProps = BaseAdminNewsAssetsPanelProps & {
  assets: AdminNewsClientAsset[];
  mode: 'persisted';
  newsId: number;
};

type StagedAdminNewsAssetsPanelProps = BaseAdminNewsAssetsPanelProps & {
  files: File[];
  mode: 'staged';
  onFilesChange: (files: File[]) => void;
};

type AdminNewsAssetsPanelProps =
  | PersistedAdminNewsAssetsPanelProps
  | StagedAdminNewsAssetsPanelProps;

type AssetPreview = {
  assetId?: number;
  downloadFileName?: string;
  downloadUrl?: string;
  file?: File;
  mimeType: string;
  newsId?: number;
  size: number;
  title: string;
  viewUrl: string;
};

type AssetPreviewKind = 'csv' | 'image' | 'pdf' | 'text' | 'unsupported';

type TextPreviewState =
  | {
      status: 'idle' | 'loading';
    }
  | {
      message: string;
      status: 'error';
    }
  | {
      data: TextPreviewData;
      status: 'ready';
    };

type TextPreviewData =
  | {
      kind: 'csv';
      rows: string[][];
      truncated: boolean;
    }
  | {
      kind: 'text';
      text: string;
      truncated: boolean;
    };

type LoadedTextPreviewState =
  | {
      data: TextPreviewData;
      key: string;
      status: 'ready';
    }
  | {
      key: string;
      message: string;
      status: 'error';
    };

export function AdminNewsAssetsPanel({
  copy,
  ...props
}: AdminNewsAssetsPanelProps) {
  const [preview, setPreview] = useState<AssetPreview | null>(null);

  return (
    <>
      {props.mode === 'staged' ? (
        <Paper withBorder radius="md" p="md">
          <Stack gap="md">
            <AssetsHeading copy={copy} />
            <Alert color="blue" variant="light">
              {copy.assets.uploadAfterCreate}
            </Alert>
            <FileDropzone
              copy={copy}
              files={props.files}
              onFilesChange={props.onFilesChange}
            />
            <SelectedFilesGrid
              copy={copy}
              emptyText={copy.assets.stagedHelp}
              files={props.files}
              onPreview={setPreview}
              onRemove={(index) =>
                props.onFilesChange(removeFileAtIndex(props.files, index))
              }
              title={copy.assets.stagedTitle}
            />
          </Stack>
        </Paper>
      ) : (
        <PersistedAdminNewsAssetsPanel
          assets={props.assets}
          copy={copy}
          mode="persisted"
          newsId={props.newsId}
          onPreview={setPreview}
        />
      )}
      <AssetPreviewModal
        copy={copy}
        onClose={() => setPreview(null)}
        preview={preview}
      />
    </>
  );
}

type PersistedAdminNewsAssetsPanelInnerProps =
  PersistedAdminNewsAssetsPanelProps & {
    onPreview: (preview: AssetPreview) => void;
  };

function PersistedAdminNewsAssetsPanel({
  assets,
  copy,
  newsId,
  onPreview,
}: PersistedAdminNewsAssetsPanelInnerProps) {
  const [files, setFiles] = useState<File[]>([]);
  const uploadMutation = useUploadAdminNewsAssetsMutation(newsId);
  const removeMutation = useRemoveAdminNewsAssetMutation(newsId);
  const submitting = uploadMutation.isPending || removeMutation.isPending;
  const uploadError = uploadMutation.error
    ? readErrorMessage(uploadMutation.error)
    : null;

  async function upload() {
    if (files.length === 0) return;
    await uploadMutation.mutateAsync(files);
    setFiles([]);
  }

  async function remove(assetId: number) {
    await removeMutation.mutateAsync(assetId);
  }

  return (
    <Paper withBorder radius="md" p="md">
      <Stack gap="md">
        <AssetsHeading copy={copy} />
        <FileDropzone copy={copy} files={files} onFilesChange={setFiles} />
        <SelectedFilesGrid
          copy={copy}
          emptyText={copy.assets.pendingEmpty}
          files={files}
          onPreview={onPreview}
          onRemove={(index) => setFiles(removeFileAtIndex(files, index))}
          title={copy.assets.pendingTitle}
        />
        {uploadError ? (
          <Alert color="red" role="alert" title={copy.assets.uploadFailedTitle}>
            {uploadError}
          </Alert>
        ) : null}
        <Group>
          <Button
            disabled={files.length === 0}
            loading={submitting}
            onClick={() => void upload()}
          >
            {copy.assets.upload}
          </Button>
        </Group>
        <UploadedAssetsGrid
          assets={assets}
          copy={copy}
          newsId={newsId}
          onPreview={onPreview}
          onRemove={(assetId) => void remove(assetId)}
          removingAssetId={removeMutation.variables}
          removing={removeMutation.isPending}
        />
      </Stack>
    </Paper>
  );
}

function AssetsHeading({ copy }: BaseAdminNewsAssetsPanelProps) {
  return (
    <Stack gap={4}>
      <Title order={3} size="h4">
        {copy.assets.title}
      </Title>
      <Text c="dimmed" size="sm">
        {copy.assets.description}
      </Text>
    </Stack>
  );
}

type FileDropzoneProps = {
  copy: AdminCopy['news'];
  files: File[];
  onFilesChange: (files: File[]) => void;
};

function FileDropzone({ copy, files, onFilesChange }: FileDropzoneProps) {
  return (
    <Dropzone
      aria-label={copy.assets.dropzoneLabel}
      multiple
      onDrop={(acceptedFiles) => {
        onFilesChange([...files, ...acceptedFiles]);
      }}
    >
      <Stack align="center" gap="xs" p="md">
        <ThemeIcon radius="xl" size="xl" variant="light">
          <UploadIcon />
        </ThemeIcon>
        <Text fw={700}>{copy.assets.dropzoneTitle}</Text>
        <Text c="dimmed" size="sm" ta="center">
          {copy.assets.dropzoneDescription}
        </Text>
        <Button component="span" mt="xs" variant="light">
          {copy.assets.select}
        </Button>
      </Stack>
    </Dropzone>
  );
}

type SelectedFilesGridProps = {
  copy: AdminCopy['news'];
  emptyText: string;
  files: File[];
  onPreview: (preview: AssetPreview) => void;
  onRemove: (index: number) => void;
  title: string;
};

function SelectedFilesGrid({
  copy,
  emptyText,
  files,
  onPreview,
  onRemove,
  title,
}: SelectedFilesGridProps) {
  const previewUrls = useFilePreviewUrls(files);

  if (files.length === 0) {
    return <Text c="dimmed">{emptyText}</Text>;
  }

  return (
    <Stack gap="xs">
      <Text fw={700}>{title}</Text>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        {files.map((file, index) => {
          const previewUrl = previewUrls.get(file) ?? null;

          return (
            <AssetCard
              key={`${file.name}-${file.size}-${index}`}
              actions={
                <Group gap="xs">
                  <Button
                    disabled={!previewUrl}
                    leftSection={<Eye size={16} />}
                    size="xs"
                    variant="light"
                    onClick={() => {
                      if (!previewUrl) return;
                      onPreview({
                        downloadFileName: file.name,
                        downloadUrl: previewUrl,
                        file,
                        mimeType: file.type,
                        size: file.size,
                        title: file.name,
                        viewUrl: previewUrl,
                      });
                    }}
                  >
                    {copy.assets.preview}
                  </Button>
                  {previewUrl ? (
                    <Button
                      component="a"
                      download={file.name}
                      href={previewUrl}
                      leftSection={<Download size={16} />}
                      size="xs"
                      variant="light"
                    >
                      {copy.assets.download}
                    </Button>
                  ) : null}
                  <Button
                    color="red"
                    leftSection={<Trash2 size={16} />}
                    size="xs"
                    variant="subtle"
                    onClick={() => onRemove(index)}
                  >
                    {copy.assets.remove}
                  </Button>
                </Group>
              }
              copy={copy}
              mimeType={file.type}
              name={file.name}
              previewUrl={previewUrl}
              size={file.size}
            />
          );
        })}
      </SimpleGrid>
    </Stack>
  );
}

type UploadedAssetsGridProps = {
  assets: AdminNewsClientAsset[];
  copy: AdminCopy['news'];
  newsId: number;
  onPreview: (preview: AssetPreview) => void;
  onRemove: (assetId: number) => void;
  removing: boolean;
  removingAssetId: number | undefined;
};

function UploadedAssetsGrid({
  assets,
  copy,
  newsId,
  onPreview,
  onRemove,
  removing,
  removingAssetId,
}: UploadedAssetsGridProps) {
  if (assets.length === 0) {
    return <Text c="dimmed">{copy.assets.empty}</Text>;
  }

  return (
    <Stack gap="xs">
      <Text fw={700}>{copy.assets.uploadedTitle}</Text>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        {assets.map((asset) => {
          const viewUrl = getAdminNewsAssetViewUrl(newsId, asset.id);
          const downloadUrl = getAdminNewsAssetDownloadUrl(newsId, asset.id);

          return (
            <AssetCard
              key={asset.id}
              actions={
                <Group gap="xs">
                  <Button
                    leftSection={<Eye size={16} />}
                    size="xs"
                    variant="light"
                    onClick={() =>
                      onPreview({
                        assetId: asset.id,
                        downloadFileName: asset.originalName,
                        downloadUrl,
                        mimeType: asset.mimeType,
                        newsId,
                        size: asset.size,
                        title: asset.originalName,
                        viewUrl,
                      })
                    }
                  >
                    {copy.assets.preview}
                  </Button>
                  <Button
                    component="a"
                    href={downloadUrl}
                    leftSection={<Download size={16} />}
                    size="xs"
                    variant="light"
                  >
                    {copy.assets.download}
                  </Button>
                  <Button
                    color="red"
                    leftSection={<Trash2 size={16} />}
                    loading={removing && removingAssetId === asset.id}
                    size="xs"
                    variant="subtle"
                    onClick={() => onRemove(asset.id)}
                  >
                    {copy.assets.remove}
                  </Button>
                </Group>
              }
              copy={copy}
              mimeType={asset.mimeType}
              name={asset.originalName}
              previewUrl={asset.kind === 'image' ? viewUrl : null}
              size={asset.size}
            />
          );
        })}
      </SimpleGrid>
    </Stack>
  );
}

type AssetCardProps = {
  actions: ReactNode;
  copy: AdminCopy['news'];
  mimeType: string;
  name: string;
  previewUrl: string | null;
  size: number;
};

function AssetCard({
  actions,
  copy,
  mimeType,
  name,
  previewUrl,
  size,
}: AssetCardProps) {
  return (
    <Card withBorder padding="sm" radius="md">
      <Stack gap="sm">
        <AssetPreviewFrame
          copy={copy}
          mimeType={mimeType}
          name={name}
          previewUrl={previewUrl}
        />
        <Stack gap={4}>
          <Text fw={700} lineClamp={2} title={name}>
            {name}
          </Text>
          <Group gap="xs">
            <Badge variant="light">{formatFileSize(size)}</Badge>
            <Badge color="gray" variant="light">
              {mimeType || copy.assets.fileTypeUnknown}
            </Badge>
          </Group>
        </Stack>
        {actions}
      </Stack>
    </Card>
  );
}

type AssetPreviewFrameProps = {
  copy: AdminCopy['news'];
  mimeType: string;
  name: string;
  previewUrl: string | null;
};

function AssetPreviewFrame({
  copy,
  mimeType,
  name,
  previewUrl,
}: AssetPreviewFrameProps) {
  const previewKind = getAssetPreviewKind(mimeType, name);

  if (previewUrl && previewKind === 'image') {
    return (
      <AspectRatio ratio={16 / 9}>
        <MantineImage
          alt={`${copy.assets.imagePreviewAlt}: ${name}`}
          fit="cover"
          radius="sm"
          src={previewUrl}
        />
      </AspectRatio>
    );
  }

  return (
    <AspectRatio ratio={16 / 9}>
      <Center bg="gray.0" style={{ borderRadius: 'var(--mantine-radius-sm)' }}>
        <Stack align="center" gap="xs">
          <ThemeIcon color={getPreviewIconColor(previewKind)} size="xl">
            {getPreviewIcon(previewKind)}
          </ThemeIcon>
          <Text c="dimmed" size="xs">
            {getPreviewLabel(copy, previewKind)}
          </Text>
        </Stack>
      </Center>
    </AspectRatio>
  );
}

type AssetPreviewModalProps = {
  copy: AdminCopy['news'];
  onClose: () => void;
  preview: AssetPreview | null;
};

function AssetPreviewModal({
  copy,
  onClose,
  preview,
}: AssetPreviewModalProps) {
  const previewKind = preview
    ? getAssetPreviewKind(preview.mimeType, preview.title)
    : 'unsupported';
  const textPreview = useTextPreview(preview, previewKind);

  return (
    <Modal
      centered
      closeButtonProps={{
        'aria-label': copy.assets.closePreview,
      }}
      onClose={onClose}
      opened={Boolean(preview)}
      size="xl"
      title={preview?.title ?? copy.assets.previewTitle}
    >
      {preview ? (
        <Stack gap="md">
          <Group justify="space-between">
            <Group gap="xs">
              <Badge variant="light">{formatFileSize(preview.size)}</Badge>
              <Badge color="gray" variant="light">
                {preview.mimeType || copy.assets.fileTypeUnknown}
              </Badge>
            </Group>
            <Group gap="xs">
              <Button
                component="a"
                href={preview.viewUrl}
                leftSection={<ExternalLink size={16} />}
                rel="noreferrer"
                size="xs"
                target="_blank"
                variant="light"
              >
                {copy.assets.openInBrowser}
              </Button>
              {preview.downloadUrl ? (
                <Button
                  component="a"
                  download={preview.downloadFileName}
                  href={preview.downloadUrl}
                  leftSection={<Download size={16} />}
                  size="xs"
                  variant="light"
                >
                  {copy.assets.download}
                </Button>
              ) : null}
            </Group>
          </Group>

          {previewKind === 'image' ? (
            <MantineImage
              alt={`${copy.assets.imagePreviewAlt}: ${preview.title}`}
              fit="contain"
              mah="70vh"
              src={preview.viewUrl}
            />
          ) : previewKind === 'pdf' ? (
            <Box
              component="iframe"
              src={preview.viewUrl}
              style={{
                border: 0,
                minHeight: '70vh',
                width: '100%',
              }}
              title={`${copy.assets.pdfPreviewLabel}: ${preview.title}`}
            />
          ) : isTextPreviewKind(previewKind) ? (
            <TextAssetPreviewContent
              copy={copy}
              previewKind={previewKind}
              state={textPreview}
            />
          ) : (
            <UnsupportedAssetPreview copy={copy} preview={preview} />
          )}
        </Stack>
      ) : null}
    </Modal>
  );
}

function TextAssetPreviewContent({
  copy,
  previewKind,
  state,
}: {
  copy: AdminCopy['news'];
  previewKind: AssetPreviewKind;
  state: TextPreviewState;
}) {
  if (state.status === 'loading' || state.status === 'idle') {
    return (
      <Center mih={240}>
        <Stack align="center" gap="xs">
          <Loader size="sm" />
          <Text c="dimmed" size="sm">
            {copy.assets.previewLoading}
          </Text>
        </Stack>
      </Center>
    );
  }

  if (state.status === 'error') {
    return (
      <Alert color="red" role="alert" title={copy.assets.previewFailed}>
        {state.message}
      </Alert>
    );
  }

  if (state.status !== 'ready') {
    return null;
  }

  const previewData = state.data;

  return (
    <Stack gap="xs">
      <Text fw={700}>
        {previewKind === 'csv'
          ? copy.assets.csvPreviewLabel
          : copy.assets.textPreviewLabel}
      </Text>
      {previewData.truncated ? (
        <Alert color="yellow" variant="light">
          {copy.assets.previewTruncated}
        </Alert>
      ) : null}
      {previewData.kind === 'csv' ? (
        <CsvPreviewTable rows={previewData.rows} />
      ) : (
        <ScrollArea.Autosize mah="60vh" type="auto">
          <Box
            component="pre"
            style={{
              margin: 0,
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {previewData.text}
          </Box>
        </ScrollArea.Autosize>
      )}
    </Stack>
  );
}

function CsvPreviewTable({ rows }: { rows: string[][] }) {
  if (rows.length === 0) {
    return <Text c="dimmed">-</Text>;
  }

  return (
    <ScrollArea.Autosize mah="60vh" type="auto">
      <Table striped withColumnBorders withTableBorder>
        <Table.Tbody>
          {rows.map((row, rowIndex) => (
            <Table.Tr key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <Table.Td key={`${rowIndex}-${cellIndex}`}>{cell}</Table.Td>
              ))}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </ScrollArea.Autosize>
  );
}

function UnsupportedAssetPreview({
  copy,
  preview,
}: {
  copy: AdminCopy['news'];
  preview: AssetPreview;
}) {
  return (
    <Center mih={240}>
      <Stack align="center" gap="xs">
        <ThemeIcon color="gray" size="xl">
          <FileIcon size={24} />
        </ThemeIcon>
        <Text fw={700}>{copy.assets.unsupportedPreview}</Text>
        <Text c="dimmed" maw={520} size="sm" ta="center">
          {copy.assets.previewUnavailable}
        </Text>
        <Group gap="xs" mt="xs">
          <Badge variant="light">{formatFileSize(preview.size)}</Badge>
          <Badge color="gray" variant="light">
            {preview.mimeType || copy.assets.fileTypeUnknown}
          </Badge>
        </Group>
      </Stack>
    </Center>
  );
}

function UploadIcon() {
  return <ImageIcon size={24} />;
}

function useFilePreviewUrls(files: File[]): Map<File, string> {
  const urls = useMemo(() => {
    if (
      typeof URL === 'undefined' ||
      typeof URL.createObjectURL !== 'function'
    ) {
      return new Map<File, string>();
    }

    const nextUrls = new Map<File, string>();
    for (const file of files) {
      nextUrls.set(file, URL.createObjectURL(file));
    }

    return nextUrls;
  }, [files]);

  useEffect(() => {
    return () => {
      for (const url of urls.values()) {
        URL.revokeObjectURL(url);
      }
    };
  }, [urls]);

  return urls;
}

function useTextPreview(
  preview: AssetPreview | null,
  previewKind: AssetPreviewKind,
): TextPreviewState {
  const [state, setState] = useState<LoadedTextPreviewState | null>(null);
  const previewKey = getTextPreviewKey(preview, previewKind);

  useEffect(() => {
    let canceled = false;

    if (!preview || !previewKey) return;

    void loadAssetPreviewText(preview)
      .then((text) => {
        if (canceled) return;
        setState({
          data: buildTextPreviewData(text, previewKind),
          key: previewKey,
          status: 'ready',
        });
      })
      .catch((error: unknown) => {
        if (canceled) return;
        setState({
          key: previewKey,
          message: readErrorMessage(error),
          status: 'error',
        });
      });

    return () => {
      canceled = true;
    };
  }, [preview, previewKey, previewKind]);

  if (!previewKey) {
    return {
      status: 'idle',
    };
  }

  if (state?.key !== previewKey) {
    return {
      status: 'loading',
    };
  }

  if (state.status === 'error') {
    return {
      message: state.message,
      status: 'error',
    };
  }

  return {
    data: state.data,
    status: 'ready',
  };
}

function getTextPreviewKey(
  preview: AssetPreview | null,
  previewKind: AssetPreviewKind,
): string | null {
  if (!preview || !isTextPreviewKind(previewKind)) return null;

  return [
    previewKind,
    preview.newsId ?? 'staged',
    preview.assetId ?? preview.title,
    preview.size,
  ].join(':');
}

async function loadAssetPreviewText(preview: AssetPreview): Promise<string> {
  if (preview.file) {
    return preview.file.text();
  }

  if (preview.newsId && preview.assetId) {
    return fetchAdminNewsAssetPreviewText(preview.newsId, preview.assetId);
  }

  throw new Error('Asset preview failed.');
}

function buildTextPreviewData(
  text: string,
  previewKind: AssetPreviewKind,
): TextPreviewData {
  const truncated = truncateTextByBytes(text, TEXT_PREVIEW_MAX_BYTES);

  if (previewKind === 'csv') {
    const parsed = Papa.parse<string[]>(truncated.text, {
      skipEmptyLines: false,
    });
    const rows = parsed.data
      .filter((row): row is string[] => Array.isArray(row))
      .slice(0, CSV_PREVIEW_MAX_ROWS)
      .map((row) =>
        row.slice(0, CSV_PREVIEW_MAX_COLUMNS).map((cell) => String(cell)),
      );
    const parsedRows = parsed.data.filter((row) => Array.isArray(row));
    const csvWasCapped =
      parsedRows.length > CSV_PREVIEW_MAX_ROWS ||
      parsedRows.some(
        (row) =>
          Array.isArray(row) && row.length > CSV_PREVIEW_MAX_COLUMNS,
      );

    return {
      kind: 'csv',
      rows,
      truncated: truncated.truncated || csvWasCapped,
    };
  }

  return {
    kind: 'text',
    text: truncated.text,
    truncated: truncated.truncated,
  };
}

function truncateTextByBytes(
  value: string,
  maxBytes: number,
): {
  text: string;
  truncated: boolean;
} {
  if (typeof TextEncoder === 'undefined' || typeof TextDecoder === 'undefined') {
    return value.length > maxBytes
      ? {
          text: value.slice(0, maxBytes),
          truncated: true,
        }
      : {
          text: value,
          truncated: false,
        };
  }

  const bytes = new TextEncoder().encode(value);
  if (bytes.length <= maxBytes) {
    return {
      text: value,
      truncated: false,
    };
  }

  return {
    text: new TextDecoder().decode(bytes.slice(0, maxBytes)),
    truncated: true,
  };
}

function getAssetPreviewKind(
  mimeType: string,
  filename: string,
): AssetPreviewKind {
  const normalizedMimeType = mimeType.toLowerCase();
  const normalizedFilename = filename.toLowerCase();

  if (normalizedMimeType.startsWith('image/')) return 'image';
  if (normalizedMimeType === 'application/pdf') return 'pdf';
  if (normalizedMimeType === 'text/csv' || normalizedFilename.endsWith('.csv')) {
    return 'csv';
  }
  if (
    normalizedMimeType.startsWith('text/') ||
    normalizedMimeType === 'application/json' ||
    normalizedFilename.endsWith('.json') ||
    normalizedFilename.endsWith('.log') ||
    normalizedFilename.endsWith('.md') ||
    normalizedFilename.endsWith('.txt')
  ) {
    return 'text';
  }

  return 'unsupported';
}

function isTextPreviewKind(previewKind: AssetPreviewKind): boolean {
  return previewKind === 'csv' || previewKind === 'text';
}

function getPreviewLabel(
  copy: AdminCopy['news'],
  previewKind: AssetPreviewKind,
): string {
  switch (previewKind) {
    case 'csv':
      return copy.assets.csvPreviewLabel;
    case 'image':
      return copy.assets.imagePreviewAlt;
    case 'pdf':
      return copy.assets.pdfPreviewLabel;
    case 'text':
      return copy.assets.textPreviewLabel;
    case 'unsupported':
      return copy.assets.filePreviewLabel;
  }
}

function getPreviewIcon(previewKind: AssetPreviewKind) {
  switch (previewKind) {
    case 'csv':
      return <FileSpreadsheet size={24} />;
    case 'image':
      return <ImageIcon size={24} />;
    case 'pdf':
    case 'text':
      return <FileText size={24} />;
    case 'unsupported':
      return <FileIcon size={24} />;
  }
}

function getPreviewIconColor(previewKind: AssetPreviewKind): string {
  switch (previewKind) {
    case 'csv':
      return 'green';
    case 'pdf':
      return 'red';
    case 'image':
      return 'blue';
    case 'text':
    case 'unsupported':
      return 'gray';
  }
}

function removeFileAtIndex(files: File[], indexToRemove: number): File[] {
  return files.filter((_, index) => index !== indexToRemove);
}

function formatFileSize(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.ceil(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function readErrorMessage(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : 'Asset preview failed.';
}
