import Link from 'next/link';
import Mark from '../Mark';
import SectionHead from './SectionHead';
import { integrationHref } from '../IntegrationCard';
import { format } from '@/lib/i18n';
import { getRequestCounts, getRoadmapItems } from '@/lib/strapi';

const CATEGORIES = ['cms', 'pim', 'ecommerce', 'email', 'design', 'docs', 'support', 'pm', 'code', 'automation', 'language', 'analytics', 'ai'];
const RECENT_DAYS = 120;

const countLabel = (t, n) => (n === 1 ? t.requestCountOne : format(t, 'requestCountMany', { n }));

function SystemCard({ item, count, locale, t }) {
  const plugin = item.stage === 'in_development';
  return (
    <li id={item.slug} className="tile roadmap-card">
      <div className="integration-top">
        <Mark name={item.system} logo={item.logoUrl} />
        <div>
          <h3>{plugin ? <Link href={`/${locale}/integrations/${item.slug}`}>{item.system}</Link> : item.system}</h3>
          <span className="roadmap-category">{t[`category_${item.category}`]}</span>
        </div>
      </div>
      <p>{item.summary}</p>
      {!plugin && (
        <div className="integration-meta">
          {/* A request for a planned system counts too, and its sender hears when work starts. */}
          <Link href={`/${locale}/support?kind=request&platform=${item.slug}`} className="tag version" aria-label={format(t, 'requestPillLabel', { system: item.system })}>
            + {t.sendRequest}
          </Link>
          {count > 0 && <span className="request-count">{countLabel(t, count)}</span>}
        </div>
      )}
    </li>
  );
}

function ItemCard({ item, locale }) {
  const href = item.url ? item.url.replace(/^\/en(?=\/|$)/, `/${locale}`) : null;
  return (
    <li className="tile roadmap-card roadmap-item">
      <h3>{href ? <Link href={href}>{item.title}</Link> : item.title}</h3>
      {item.description && <p>{item.description}</p>}
    </li>
  );
}

/** The roadmap: in development, next, later; recent releases; and the systems people can request. */
export default async function Roadmap({ block, integrations, locale, t }) {
  const [items, counts] = await Promise.all([getRoadmapItems(locale), block.showRequests !== false ? getRequestCounts() : {}]);
  const columns = [
    { phase: 'now', title: t.roadmapNow, text: t.roadmapNowText, systems: integrations.filter((i) => i.stage === 'in_development') },
    { phase: 'next', title: t.roadmapNext, text: t.roadmapNextText, systems: integrations.filter((i) => i.stage === 'roadmap') },
    { phase: 'later', title: t.roadmapLater, text: t.roadmapLaterText, systems: [] },
  ]
    .map((c) => ({ ...c, items: items.filter((i) => i.phase === c.phase) }))
    .filter((c) => c.systems.length || c.items.length);

  const since = Date.now() - RECENT_DAYS * 24 * 60 * 60 * 1000;
  const released = block.showReleases === false
    ? []
    : integrations
        .filter((i) => i.stage === 'live' && i.release?.releasedAt && new Date(i.release.releasedAt) >= since)
        .sort((a, b) => new Date(b.release.releasedAt) - new Date(a.release.releasedAt))
        .slice(0, 8);
  const date = (iso) => new Intl.DateTimeFormat(`${locale}-CH`, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));

  const requestable = integrations.filter((i) => i.stage === 'request');
  const byCount = (a, b) => (counts[b.slug] || 0) - (counts[a.slug] || 0);

  return (
    <section className="section roadmap" style={{ paddingTop: block.title ? undefined : 0 }}>
      <div className="container">
        <SectionHead title={block.title} subtitle={block.subtitle} />

        {columns.length > 0 && (
          <div className={`roadmap-board cols-${columns.length}`}>
            {columns.map((c) => (
              <section key={c.phase} className={`roadmap-column ${c.phase}`} aria-labelledby={`roadmap-${c.phase}`}>
                <header>
                  <h2 id={`roadmap-${c.phase}`}>
                    {c.title} <span className="count">{c.systems.length + c.items.length}</span>
                  </h2>
                  <p>{c.text}</p>
                </header>
                <ul>
                  {c.items.map((item) => <ItemCard key={item.documentId} item={item} locale={locale} />)}
                  {c.systems.map((item) => <SystemCard key={item.slug} item={item} count={counts[item.slug] || 0} locale={locale} t={t} />)}
                </ul>
              </section>
            ))}
          </div>
        )}

        {released.length > 0 && (
          <div className="roadmap-released">
            <h2>{t.roadmapReleased}</h2>
            <ul>
              {released.map((i) => (
                <li key={i.slug}>
                  <Link href={`/${locale}/integrations/${i.slug}`} className="released">
                    <Mark name={i.system} logo={i.logoUrl} />
                    <span>
                      <strong>{i.system}</strong> <span className="tag version">v{i.release.version}</span>
                      <small>{format(t, 'releasedOn', { date: date(i.release.releasedAt) })}</small>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {block.showRequests !== false && (
          <div className="roadmap-requests" id="request">
            <h2>{t.roadmapRequests}</h2>
            <p className="lead">{t.roadmapRequestsText}</p>
            {CATEGORIES.map((c) => {
              const list = requestable.filter((i) => i.category === c).sort(byCount);
              if (!list.length) return null;
              return (
                <div key={c} className="request-group">
                  <h3>{t[`category_${c}`]}</h3>
                  <div className="request-pills">
                    {list.map((i) => (
                      <Link key={i.slug} id={i.slug} href={integrationHref(i, locale)} className="chip request" aria-label={format(t, 'requestPillLabel', { system: i.system })}>
                        <span aria-hidden="true">+</span> {i.system}
                        {counts[i.slug] > 0 && <span className="count">{counts[i.slug]}</span>}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
            <p style={{ marginTop: 32 }}>
              <Link href={`/${locale}/support?kind=request`} className="btn btn-primary">{t.requestOther}</Link>
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
