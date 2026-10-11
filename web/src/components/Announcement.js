import CmsLink from './CmsLink';

/** Bar at the very top of every page (Global → announcement in the CMS). */
export default function Announcement({ announcement, locale }) {
  if (!announcement?.enabled || !announcement.text) return null;
  const { label, text, link } = announcement;
  const content = (
    <>
      {label && <span className="announcement-label">{label}</span>}
      <span className="announcement-text">{text}</span>
      {link?.label && <span className="announcement-cta">{link.label} →</span>}
    </>
  );
  return (
    <div className="announcement" role="region" aria-label={label || text}>
      {link?.url ? (
        <CmsLink link={link} locale={locale} className="announcement-inner">{content}</CmsLink>
      ) : (
        <div className="announcement-inner">{content}</div>
      )}
    </div>
  );
}
