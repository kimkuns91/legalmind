import ReactMarkdown, { Components } from 'react-markdown';
import { memo, useMemo } from 'react';

import React from 'react';
import { marked } from 'marked';
import remarkGfm from 'remark-gfm';

function parseMarkdownIntoBlocks(markdown: string): string[] {
  const tokens = marked.lexer(markdown);
  return tokens.map(token => token.raw);
}

const components: Components = {
  code: ({
    inline,
    className,
    children,
    ...props
  }: React.ComponentProps<'code'> & { inline?: boolean }) => {
    const match = /language-(\w+)/.exec(className || '');
    return !inline && match ? (
      <pre
        className={`${className} bg-muted mt-2 w-[80dvw] overflow-x-scroll rounded p-2 text-sm md:max-w-[500px]`}
      >
        <code className={match[1]}>{children}</code>
      </pre>
    ) : (
      <code className={`${className} bg-muted rounded px-1 py-0.5 text-sm`} {...props}>
        {children}
      </code>
    );
  },
  ol: ({ children, ...props }: React.ComponentProps<'ol'>) => (
    <ol className="ml-4 list-inside list-decimal" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: React.ComponentProps<'li'>) => (
    <li className="py-1" {...props}>
      {children}
    </li>
  ),
  ul: ({ children, ...props }: React.ComponentProps<'ul'>) => (
    <ul className="ml-4 list-inside list-decimal" {...props}>
      {children}
    </ul>
  ),
  strong: ({ children, ...props }: React.ComponentProps<'strong'>) => (
    <span className="font-semibold" {...props}>
      {children}
    </span>
  ),
};

const MemoizedMarkdownBlock = memo(
  ({ content }: { content: string }) => {
    return (
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    );
  },
  (prevProps, nextProps) => prevProps.content === nextProps.content
);

MemoizedMarkdownBlock.displayName = 'MemoizedMarkdownBlock';

export const Markdown = memo(
  ({ children, id }: { children: string; id: string }) => {
    const blocks = useMemo(() => parseMarkdownIntoBlocks(children), [children]);

    return (
      <>
        {blocks.map((block, index) => (
          <MemoizedMarkdownBlock content={block} key={`${id}-block_${index}`} />
        ))}
      </>
    );
  },
  (prevProps, nextProps) => prevProps.children === nextProps.children
);

Markdown.displayName = 'Markdown';
