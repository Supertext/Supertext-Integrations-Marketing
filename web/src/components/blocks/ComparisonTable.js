import CmsLink from '../CmsLink';
import Markdown from '../Markdown';
import SectionHead from './SectionHead';

export default function ComparisonTable({ block, locale }) {
  const columns = block.columns || [];
  const rows = (block.rows || []).map((row) => ({ ...row, values: (row.cells || '').split('\n') }));
  return (
    <section className="section">
      <div className="container">
        <SectionHead title={block.title} />
        <div className="table-wrap">
          <table className="compare">
            <thead>
              <tr>
                <th scope="col"><span className="sr-only" /></th>
                {columns.map((col, i) => (
                  <th key={col.id ?? i} scope="col" className={col.highlight ? 'hl' : undefined}>
                    <div className="col-head">
                      {col.badge && <span className="tag version" style={{ width: 'fit-content' }}>{col.badge}</span>}
                      <strong>{col.heading}</strong>
                      {col.price && <span className="col-price">{col.price}</span>}
                      {col.subheading && <span className="muted">{col.subheading}</span>}
                      {col.cta && <div style={{ marginTop: 8 }}><CmsLink link={col.cta} locale={locale} className="btn btn-secondary btn-block" /></div>}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, r) => (
                <tr key={row.id ?? r}>
                  <th scope="row">{row.label}</th>
                  {columns.map((col, c) => (
                    <td key={c} className={col.highlight ? 'hl' : undefined}>{row.values[c] ?? ''}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {block.footnote && <Markdown locale={locale} className="prose footnote">{block.footnote}</Markdown>}
      </div>
    </section>
  );
}
