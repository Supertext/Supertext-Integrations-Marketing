import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import { isExternal, localizeHref } from '@/lib/i18n';

/** Strapi rich text (Markdown). Raw HTML is not rendered. */
export default function Markdown({ children, locale, className = 'prose' }) {
  if (!children) return null;
  return (
    <div className={className}>
      <ReactMarkdown
        components={{
          a: ({ href, children: text }) => {
            const url = localizeHref(href, locale);
            return isExternal(url) ? (
              <a href={url} target="_blank" rel="noopener">{text}</a>
            ) : (
              <Link href={url}>{text}</Link>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
