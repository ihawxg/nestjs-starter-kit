import { describe, expect, it } from 'vitest';
import { sanitizeRichText } from './sanitize-rich-text';

describe('sanitizeRichText', () => {
  it('keeps allowed rich text structure', () => {
    expect(
      sanitizeRichText(
        '<h2>Heading</h2><p><strong>Important</strong> <a href="https://example.test">link</a></p>',
      ),
    ).toBe(
      '<h2>Heading</h2><p><strong>Important</strong> <a href="https://example.test">link</a></p>',
    );
  });

  it('removes script tags and unsafe links', () => {
    expect(
      sanitizeRichText(
        '<p>Safe</p><script>alert("bad")</script><a href="javascript:alert(1)">bad link</a>',
      ),
    ).toBe('<p>Safe</p><a>bad link</a>');
  });
});
