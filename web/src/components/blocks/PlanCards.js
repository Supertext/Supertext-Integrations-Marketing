'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import CmsLink from '../CmsLink';
import { Check, Cross } from '../Icons';
import SectionHead from './SectionHead';

/** CHF 2’000 style, as on supertext.com. */
const money = (value, currency) => {
  const n = Number(value);
  return `${currency || 'CHF'} ${new Intl.NumberFormat('de-CH', { maximumFractionDigits: n % 1 ? 2 : 0 }).format(n)}`;
};

function PlanCard({ plan, interval, platforms, locale, t, preselect }) {
  const choices = plan.platforms?.length ? platforms.filter((p) => plan.platforms.some((x) => x.slug === p.slug)) : platforms;
  const [platform, setPlatform] = useState(choices.some((p) => p.slug === preselect) ? preselect : '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const price = interval === 'year' ? plan.priceAnnual ?? plan.priceMonthly : plan.priceMonthly;
  const priceId = interval === 'year' ? plan.stripePriceAnnual : plan.stripePriceMonthly;
  const free = price !== null && price !== undefined && Number(price) === 0;
  const askPlatform = plan.askPlatform && !plan.contactOnly && !free && choices.length > 0;

  const checkout = async () => {
    setError('');
    if (!priceId) return setError(t.notBuyable);
    if (askPlatform && !platform) return setError(t.choosePlatform);
    setBusy(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: plan.slug, interval, locale, platform: askPlatform ? platform : undefined }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) throw new Error(data.error || t.checkoutFailed);
      window.location.assign(data.url);
    } catch (e) {
      setError(e.message || t.checkoutFailed);
      setBusy(false);
    }
  };

  return (
    <article className={`card plan${plan.highlight ? ' highlight' : ''}`}>
      {plan.badge && <span className="badge">{plan.badge}</span>}
      <div style={{ display: 'grid', gap: 4 }}>
        {plan.audience && <span className="audience">{plan.audience}</span>}
        <h3>{plan.name}</h3>
      </div>
      <div className="price">
        {plan.contactOnly || price === null || price === undefined ? (
          <strong className="phrase">{plan.priceNote || '—'}</strong>
        ) : free ? (
          <strong>{t.free}</strong>
        ) : (
          <>
            <strong>{money(price, plan.currency)}</strong>
            <span>{interval === 'year' ? t.billedAnnually : t.perMonth}</span>
          </>
        )}
      </div>
      <p className="note">{!plan.contactOnly && plan.priceNote ? plan.priceNote : plan.tagline}</p>
      {!plan.contactOnly && plan.priceNote && plan.tagline && <p className="muted" style={{ fontSize: 14 }}>{plan.tagline}</p>}
      <ul>
        {(plan.features || []).map((f, i) => (
          <li key={f.id ?? i} className={f.included === false ? 'off' : undefined}>
            {f.included === false ? <Cross /> : <Check />}
            <span>{f.text}</span>
          </li>
        ))}
      </ul>
      <div className="spacer" />
      {plan.contactOnly || free ? (
        <CmsLink link={{ url: plan.contactUrl || `/${locale}/integrations`, label: plan.ctaLabel || t.learnMore }} locale={locale} className={`btn ${plan.highlight ? 'btn-primary' : 'btn-secondary'} btn-block`} />
      ) : (
        <div style={{ display: 'grid', gap: 10 }}>
          {askPlatform && (
            <label>
              {t.platform}
              <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
                <option value="">{t.choosePlatform}</option>
                {choices.map((p) => <option key={p.slug} value={p.slug}>{p.system}</option>)}
              </select>
            </label>
          )}
          <button type="button" className={`btn ${plan.highlight ? 'btn-primary' : 'btn-secondary'} btn-block`} onClick={checkout} disabled={busy}>
            {busy ? t.redirecting : plan.ctaLabel || t.subscribe}
          </button>
          {error && <p className="error" role="alert">{error}</p>}
        </div>
      )}
    </article>
  );
}

export default function PlanCards({ block, integrations, locale, t }) {
  const [interval, setBilling] = useState('month');
  const search = useSearchParams();
  const plans = block.plans || [];
  const hasAnnual = plans.some((p) => p.priceAnnual !== null && p.priceAnnual !== undefined && Number(p.priceAnnual) !== Number(p.priceMonthly));
  const platforms = integrations.filter((i) => i.stage !== 'in_development').map(({ slug, system }) => ({ slug, system }));
  return (
    <section className="section">
      <div className="container">
        <SectionHead title={block.title} subtitle={block.subtitle} />
        {block.showBillingToggle !== false && hasAnnual && (
          <div className="toggle" role="group">
            <button type="button" aria-pressed={interval === 'month'} onClick={() => setBilling('month')}>{t.monthly}</button>
            <button type="button" aria-pressed={interval === 'year'} onClick={() => setBilling('year')}>
              {t.annual}{block.annualSavingLabel && <span className="save">{block.annualSavingLabel}</span>}
            </button>
          </div>
        )}
        <div className="plans" style={{ '--plans': Math.min(plans.length || 1, 4) }}>
          {plans.map((plan) => (
            <PlanCard key={plan.documentId} plan={plan} interval={interval} platforms={platforms} locale={locale} t={t} preselect={search.get('platform')} />
          ))}
        </div>
      </div>
    </section>
  );
}
