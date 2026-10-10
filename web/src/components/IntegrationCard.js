import Link from 'next/link';
import Mark from './Mark';

export default function IntegrationCard({ item, locale, t }) {
  return (
    <Link href={`/${locale}/integrations/${item.slug}`} className="tile integration">
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
