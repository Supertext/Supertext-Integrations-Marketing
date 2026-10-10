'use client';

import { useMemo, useState } from 'react';
import IntegrationCard from '../IntegrationCard';
import SectionHead from './SectionHead';

const CATEGORIES = ['cms', 'pim', 'ecommerce', 'email', 'design'];

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
          <div className="integrations">
            {shown.map((item) => <IntegrationCard key={item.slug} item={item} locale={locale} t={t} />)}
          </div>
        ) : (
          <p className="empty">{t.noResults}</p>
        )}
      </div>
    </section>
  );
}
