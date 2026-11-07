import { localizeVersions } from '@/lib/versions';
import Image from 'next/image';
import Link from 'next/link';
import Mark from './Mark';

/** Where a card leads: the plugin's page, its place on the roadmap, or the request form. */
export function integrationHref(item, locale) {
  if (item.stage === 'roadmap') return `/${locale}/roadmap#${item.slug}`;
  if (item.stage === 'request') return `/${locale}/support?kind=request&platform=${item.slug}`;
  return `/${locale}/integrations/${item.slug}`;
}

export default function IntegrationCard({ item, locale, t }) {
  return (
    <Link href={integrationHref(item, locale)} className={`tile integration${item.stage === 'roadmap' ? ' planned' : ''}`}>
      <div className="shot" aria-hidden={!item.screenshot}>
        {item.screenshot ? (
          <Image
            src={item.screenshot.src}
            alt={item.screenshot.alt}
            width={item.screenshot.width}
            height={item.screenshot.height}
            sizes="(max-width: 620px) 100vw, (max-width: 1100px) 50vw, 320px"
          />
        ) : (
          <span className="shot-placeholder">
            <Mark name={item.system} logo={item.logoUrl} large />
          </span>
        )}
      </div>
      <div className="integration-top">
        <Mark name={item.system} logo={item.logoUrl} />
        <h3>{item.system}</h3>
      </div>
      <div className="integration-text">
        <p>{item.summary}</p>
        {item.supportedVersions && <p className="versions">{localizeVersions(item.supportedVersions, locale)}</p>}
      </div>
      <div className="integration-meta">
        <span className="tag">{t[`category_${item.category}`]}</span>
        {(!item.stage || item.stage === 'live') && <span className="tag live">{t.stage_live}</span>}
        {item.stage === 'in_development' && <span className="tag dev">{t.inDevelopment}</span>}
        {item.stage === 'roadmap' && <span className="tag roadmap">{t.stage_roadmap}</span>}
        {item.release?.version && <span className="tag version">v{item.release.version}</span>}
      </div>
    </Link>
  );
}
