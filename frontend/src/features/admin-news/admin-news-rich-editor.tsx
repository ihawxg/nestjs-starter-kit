'use client';

import { RichTextEditor } from '@mantine/tiptap';
import Link from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Stack, Text, Textarea } from '@mantine/core';
import { useEffect } from 'react';
import type { AdminCopy } from '@/lib/i18n/messages';

type AdminNewsRichEditorProps = {
  copy: AdminCopy['news']['editor'];
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
};

export function AdminNewsRichEditor({
  copy,
  label,
  value,
  error,
  onChange,
}: AdminNewsRichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
      }),
    ],
    content: value,
    immediatelyRender: false,
    onUpdate: ({ editor: activeEditor }) => {
      onChange(activeEditor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor || editor.getHTML() === value) return;
    editor.commands.setContent(value || '', {
      emitUpdate: false,
    });
  }, [editor, value]);

  if (!editor) {
    return (
      <Textarea
        label={label}
        value={value}
        error={error}
        onChange={(event) => onChange(event.currentTarget.value)}
        minRows={8}
      />
    );
  }

  return (
    <Stack gap={4}>
      <RichTextEditor
        aria-label={copy.title}
        editor={editor}
        labels={{
          blockquoteControlLabel: copy.blockquote,
          boldControlLabel: copy.bold,
          bulletListControlLabel: copy.bulletList,
          clearFormattingControlLabel: copy.clearFormatting,
          h2ControlLabel: copy.headingTwo,
          h3ControlLabel: copy.headingThree,
          hrControlLabel: copy.horizontalRule,
          italicControlLabel: copy.italic,
          linkControlLabel: copy.link,
          orderedListControlLabel: copy.orderedList,
          redoControlLabel: copy.redo,
          strikeControlLabel: copy.strikethrough,
          underlineControlLabel: copy.underline,
          undoControlLabel: copy.undo,
          unlinkControlLabel: copy.unlink,
        }}
        styles={{
          content: {
            minHeight: 260,
          },
        }}
      >
        <RichTextEditor.Toolbar sticky stickyOffset={0}>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Control
              active={editor.isActive('paragraph')}
              aria-label={copy.paragraph}
              title={copy.paragraph}
              type="button"
              onClick={() => editor.chain().focus().setParagraph().run()}
            >
              P
            </RichTextEditor.Control>
            <RichTextEditor.H2 type="button" />
            <RichTextEditor.H3 type="button" />
            <RichTextEditor.Blockquote type="button" />
            <RichTextEditor.Hr type="button" />
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Bold type="button" />
            <RichTextEditor.Italic type="button" />
            <RichTextEditor.Underline type="button" />
            <RichTextEditor.Strikethrough type="button" />
            <RichTextEditor.ClearFormatting
              type="button"
              onClick={() =>
                editor.chain().focus().unsetAllMarks().clearNodes().run()
              }
            />
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.BulletList type="button" />
            <RichTextEditor.OrderedList type="button" />
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Link type="button" />
            <RichTextEditor.Unlink type="button" />
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Undo type="button" />
            <RichTextEditor.Redo type="button" />
          </RichTextEditor.ControlsGroup>
          <RichTextEditor.ControlsGroup>
            <RichTextEditor.Control
              aria-label={copy.previewHtml}
              title={copy.previewHtml}
              type="button"
              interactive={false}
            >
              HTML
            </RichTextEditor.Control>
          </RichTextEditor.ControlsGroup>
        </RichTextEditor.Toolbar>
        <RichTextEditor.Content aria-label={label} />
      </RichTextEditor>
      {error ? (
        <Text c="red" role="alert" size="sm">
          {error}
        </Text>
      ) : null}
    </Stack>
  );
}
