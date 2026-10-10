import { Suspense } from 'react';
import CmsLink from './CmsLink';
import LanguageSwitcher from './LanguageSwitcher';

export default function Footer({ global, locale, t }) {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-cols">
          <div className="footer-brand" style={{ display: 'grid', gap: 16, alignContent: 'start' }}>
            <span className="logo"><span className="logo-dot" aria-hidden="true" />{global?.siteName || 'Supertext'}</span>
            <Suspense><LanguageSwitcher locale={locale} label={t.language} /></Suspense>
          </div>
          {(global?.footerColumns || []).map((col) => (
            <div key={col.id ?? col.label}>
              <h4>{col.label}</h4>
              <ul>
                {(col.links || []).map((link) => (
                  <li key={link.id ?? link.url}><CmsLink link={link} locale={locale} className="" /></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="footer-bottom">
          <span>{global?.footerNote}</span>
          <span>© {new Date().getFullYear()} Supertext AG</span>
        </div>
      </div>
    </footer>
  );
}
