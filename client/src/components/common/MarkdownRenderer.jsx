import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Centralized markdown renderer to ensure consistent formatting across panels.
// Supports **bold**, *italics*, lists, tables (GFM), etc.
// Optionally we could sanitize or limit allowed elements later.
const MarkdownRenderer = ({ content }) => {
  if (!content) return null;
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      // You can add rehype plugins or custom renderers if needed later
    >
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
