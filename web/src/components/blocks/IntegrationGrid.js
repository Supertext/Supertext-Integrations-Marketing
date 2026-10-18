'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import IntegrationCard from '../IntegrationCard';
import SectionHead from './SectionHead';

const CATEGORIES = ['cms', 'pim', 'ecommerce', 'email', 'design'];

function SdkCard({ locale, t }) {
  return (
    <Link href={`/${locale}/sdk`} className="tile integration sdk-card">
      <div className="shot sdk-shot" aria-hidden="true">
        <code>
          <span>import</span> {'{ SupertextClient }'} <span>from</span> &apos;supertext-sdk&apos;{'\n\n'}
          <span>await</span> client.translateTexts(texts, &apos;de-CH&apos;)
        </code>
      </div>
      <h3>{t.sdkCardTitle}</h3>
      <p>{t.sdkCardText}</p>
      <div className="integration-meta"><span className="tag version">{t.sdkCardCta} →</span></div>
    </Link>
  );
}

export default function IntegrationGrid({ block, integrations, locale, t, initialCategory }) {
  const fixed = block.category && block.category !== 'all' ? block.category : null;
  const [category, setCategory] = useState(
    fixed || (CATEGORIES.includes(initialCategory) ? initialCategory : 'all')
  );
  const counts = useMemo(() => {
    const c = { all: integrations.length };
    for (const i of integrations) c[i.category] = (c[i.category] || 0) + 1;
    return c;
  }, [integrations]);
  const shown = category === 'all' ? integrations : integrations.filter((i) => i.category === category);

  const choose = (value) => {
    setCategory(value);
    const url = new URL(window.location.href);
    if (value === 'all') url.searchParams.delete('category');
    else url.searchParams.set('category', value);
    window.history.replaceState(null, '', url);
  };

  return (
    <section className="section">
      <div className="container">
        <SectionHead title={block.title} subtitle={block.subtitle} />
        {!fixed && block.showFilters !== false && (
          <div className="filters" role="group">
            {['all', ...CATEGORIES].filter((c) => c === 'all' || counts[c]).map((c) => (
              <button key={c} type="button" className="chip" aria-pressed={category === c} onClick={() => choose(c)}>
                {c === 'all' ? t.all : t[`category_${c}`]}
                <span className="count">{counts[c] || 0}</span>
              </button>
            ))}
          </div>
        )}
        {shown.length ? (
          // "All": one group per category with its own heading (h2 when the section has no title).
          (category === 'all' ? CATEGORIES.filter((c) => counts[c]) : [category]).map((c, index, list) => {
            const items = shown.filter((i) => i.category === c);
            const Heading = block.title ? 'h3' : 'h2';
            return (
              <div key={c} className="integration-group">
                {category === 'all' && <Heading className="group-title">{t[`category_${c}`]}</Heading>}
                <div className="integrations">
                  {items.map((item) => <IntegrationCard key={item.slug} item={item} locale={locale} t={t} />)}
                  {index === list.length - 1 && <SdkCard locale={locale} t={t} />}
                </div>
              </div>
            );
          })
        ) : (
          <p className="empty">{t.noResults}</p>
        )}
      </div>
    </section>
  );
}
