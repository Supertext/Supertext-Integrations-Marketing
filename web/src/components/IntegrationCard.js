import Image from 'next/image';
import Link from 'next/link';
import Mark from './Mark';

export default function IntegrationCard({ item, locale, t }) {
  return (
    <Link href={`/${locale}/integrations/${item.slug}`} className="tile integration">
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
      <p>{item.summary}</p>
      <div className="integration-meta">
        <span className="tag">{t[`category_${item.category}`]}</span>
        {item.stage === 'in_development' && <span className="tag dev">{t.inDevelopment}</span>}
        {item.release?.version && <span className="tag version">v{item.release.version}</span>}
      </div>
    </Link>
  );
}
