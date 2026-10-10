import Link from 'next/link';
import { isExternal, localizeHref } from '@/lib/i18n';

/** A Strapi shared.link component (or any url) as a button or text link. */
export default function CmsLink({ link, locale, className, children, style }) {
  if (!link?.url) return null;
  const href = localizeHref(link.url, locale);
  const variant = style || link.style || 'primary';
  const cls = className ?? `btn btn-${variant === 'text' ? 'text' : variant}`;
  const external = isExternal(href);
  const newTab = link.newTab || external;
  const content = children ?? link.label;
  if (external) {
    return (
      <a href={href} className={cls} {...(newTab && { target: '_blank', rel: 'noopener' })}>
        {content}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {content}
    </Link>
  );
}
