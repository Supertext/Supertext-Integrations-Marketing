import CmsLink from '../CmsLink';

export default function CtaBand({ block, locale }) {
  return (
    <section className="section">
      <div className="container">
        <div className={`cta cta-${block.tone || 'dark'}`}>
          <h2>{block.title}</h2>
          {block.text && <p>{block.text}</p>}
          <div className="btn-row center">
            <CmsLink link={block.primaryCta} locale={locale} />
            <CmsLink link={block.secondaryCta} locale={locale} style="secondary" />
          </div>
        </div>
      </div>
    </section>
  );
}
