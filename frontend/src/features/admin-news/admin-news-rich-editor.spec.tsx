import { render, screen } from '@testing-library/react';
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AdminProviders } from '@/components/admin/admin-providers';
import { AdminNewsRichEditor } from './admin-news-rich-editor';

vi.mock('@mantine/tiptap', () => ({
  RichTextEditor: Object.assign(
    ({ children, ...props }: { children: ReactNode } & HTMLAttributes<HTMLElement>) => (
      <section {...props}>{children}</section>
    ),
    {
      Toolbar: ({ children }: { children: ReactNode }) => (
        <div>{children}</div>
      ),
      ControlsGroup: ({ children }: { children: ReactNode }) => (
        <div>{children}</div>
      ),
      Bold: (props: ButtonHTMLAttributes<HTMLButtonElement>) => (
        <button aria-label="Bold" {...props} />
      ),
      Blockquote: (props: ButtonHTMLAttributes<HTMLButtonElement>) => (
        <button aria-label="Blockquote" {...props} />
      ),
      ClearFormatting: (props: ButtonHTMLAttributes<HTMLButtonElement>) => (
        <button aria-label="Clear formatting" {...props} />
      ),
      Italic: (props: ButtonHTMLAttributes<HTMLButtonElement>) => (
        <button aria-label="Italic" {...props} />
      ),
      H2: (props: ButtonHTMLAttributes<HTMLButtonElement>) => <button aria-label="Heading 2" {...props} />,
      H3: (props: ButtonHTMLAttributes<HTMLButtonElement>) => <button aria-label="Heading 3" {...props} />,
      Hr: (props: ButtonHTMLAttributes<HTMLButtonElement>) => (
        <button aria-label="Horizontal rule" {...props} />
      ),
      Redo: (props: ButtonHTMLAttributes<HTMLButtonElement>) => (
        <button aria-label="Redo" {...props} />
      ),
      Strikethrough: (props: ButtonHTMLAttributes<HTMLButtonElement>) => (
        <button aria-label="Strikethrough" {...props} />
      ),
      Underline: (props: ButtonHTMLAttributes<HTMLButtonElement>) => (
        <button aria-label="Underline" {...props} />
      ),
      Undo: (props: ButtonHTMLAttributes<HTMLButtonElement>) => (
        <button aria-label="Undo" {...props} />
      ),
      Unlink: (props: ButtonHTMLAttributes<HTMLButtonElement>) => (
        <button aria-label="Remove link" {...props} />
      ),
      BulletList: (props: ButtonHTMLAttributes<HTMLButtonElement>) => (
        <button aria-label="Bullet list" {...props} />
      ),
      OrderedList: (props: ButtonHTMLAttributes<HTMLButtonElement>) => (
        <button aria-label="Ordered list" {...props} />
      ),
      Link: (props: ButtonHTMLAttributes<HTMLButtonElement>) => (
        <button aria-label="Link" {...props} />
      ),
      Control: (props: {
        active?: boolean;
        children: ReactNode;
        interactive?: boolean;
      } & ButtonHTMLAttributes<HTMLButtonElement>) => {
        const { active, children, interactive, ...buttonProps } = props;
        void active;
        void interactive;

        return <button {...buttonProps}>{children}</button>;
      },
      Content: (props: HTMLAttributes<HTMLDivElement>) => <div {...props} />,
    },
  ),
}));

vi.mock('@tiptap/react', () => ({
  useEditor: () => ({
    chain: () => ({
      focus: () => ({
        setParagraph: () => ({
          run: vi.fn(),
        }),
        unsetAllMarks: () => ({
          clearNodes: () => ({
            run: vi.fn(),
          }),
        }),
      }),
    }),
    commands: {
      setContent: vi.fn(),
    },
    getHTML: () => '<p>Body</p>',
    isActive: () => false,
  }),
}));

const editorCopy = {
  blockquote: 'Blockquote',
  bold: 'Bold',
  bulletList: 'Bullet list',
  clearFormatting: 'Clear formatting',
  headingThree: 'Heading 3',
  headingTwo: 'Heading 2',
  horizontalRule: 'Horizontal rule',
  italic: 'Italic',
  link: 'Link',
  orderedList: 'Ordered list',
  paragraph: 'Paragraph',
  previewHtml: 'Stores clean HTML',
  redo: 'Redo',
  strikethrough: 'Strikethrough',
  title: 'Rich body editor',
  underline: 'Underline',
  undo: 'Undo',
  unlink: 'Remove link',
};

describe('AdminNewsRichEditor', () => {
  it('renders accessible rich editor controls', () => {
    render(
      <AdminProviders>
        <AdminNewsRichEditor
          copy={editorCopy}
          label="Body"
          value="<p>Body</p>"
          onChange={vi.fn()}
        />
      </AdminProviders>,
    );

    expect(screen.getByLabelText('Rich body editor')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bold' })).toHaveAttribute(
      'type',
      'button',
    );
    expect(screen.getByRole('button', { name: 'Heading 2' })).toHaveAttribute(
      'type',
      'button',
    );
    expect(screen.getByRole('button', { name: 'Remove link' })).toHaveAttribute(
      'type',
      'button',
    );
    expect(screen.getByRole('button', { name: 'Undo' })).toHaveAttribute(
      'type',
      'button',
    );
    expect(screen.getByLabelText('Body')).toBeInTheDocument();
  });

  it('renders validation errors beside the editor', () => {
    render(
      <AdminProviders>
        <AdminNewsRichEditor
          copy={editorCopy}
          error="Body is required"
          label="Body"
          value=""
          onChange={vi.fn()}
        />
      </AdminProviders>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Body is required');
  });
});
