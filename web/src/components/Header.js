'use client';

import Link from 'next/link';
import { Suspense, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import CmsLink from './CmsLink';
import LanguageSwitcher from './LanguageSwitcher';
import { Chevron, MenuIcon } from './Icons';
import { localizeHref } from '@/lib/i18n';

export default function Header({ global, locale, t }) {
  const [open, setOpen] = useState(null); // index of the open dropdown
  const [mobile, setMobile] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const ref = useRef(null);
  const pathname = usePathname();

  useEffect(() => { setOpen(null); setMobile(false); }, [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(null); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(null); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('scroll', onScroll);
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const nav = global?.navigation || [];
  return (
    <header className={`header${scrolled ? ' scrolled' : ''}`} ref={ref}>
      <div className="container header-inner">
        <Link href={`/${locale}`} className="logo">
          <span className="logo-dot" aria-hidden="true" />
          {global?.siteName || 'Supertext'} <small>Integrations</small>
        </Link>

        <nav className="nav" aria-label="Main">
          {nav.map((group, i) =>
            group.links?.length ? (
              <div key={group.id ?? i} className={`nav-item${open === i ? ' open' : ''}`}>
                <button type="button" className="nav-link" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
                  {group.label} <Chevron />
                </button>
                {open === i && (
                  <div className="dropdown">
                    {group.url && (
                      <CmsLink link={{ url: group.url }} locale={locale} className="">
                        <strong style={{ fontWeight: 500 }}>{group.label}</strong>
                      </CmsLink>
                    )}
                    {group.links.map((link) => (
                      <CmsLink key={link.id ?? link.url} link={link} locale={locale} className="">
                        {link.label}
                        {link.description && <span>{link.description}</span>}
                      </CmsLink>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div key={group.id ?? i} className="nav-item">
                <Link className="nav-link" href={localizeHref(group.url, locale)}>{group.label}</Link>
              </div>
            )
          )}
        </nav>

        <div className="header-actions">
          <span className="hide-mobile">
            <Suspense><LanguageSwitcher locale={locale} label={t.language} /></Suspense>
          </span>
          {global?.loginLink && <span className="hide-mobile"><CmsLink link={global.loginLink} locale={locale} style="text" /></span>}
          {global?.headerCta && <span className="hide-mobile"><CmsLink link={global.headerCta} locale={locale} /></span>}
          <button type="button" className="menu-toggle" aria-label={t.menu} aria-expanded={mobile} onClick={() => setMobile(!mobile)}>
            <MenuIcon open={mobile} />
          </button>
        </div>
      </div>

      <div className={`container mobile-menu${mobile ? ' open' : ''}`}>
        {nav.map((group, i) => (
          <div key={group.id ?? i} style={{ display: 'grid' }}>
            {group.links?.length ? <div className="group">{group.label}</div> : null}
            {group.url && !group.links?.length && <CmsLink link={{ url: group.url }} locale={locale} className="">{group.label}</CmsLink>}
            {(group.links || []).map((link) => (
              <CmsLink key={link.id ?? link.url} link={link} locale={locale} className="" />
            ))}
          </div>
        ))}
        <div className="btn-row" style={{ marginTop: 12 }}>
          <Suspense><LanguageSwitcher locale={locale} label={t.language} /></Suspense>
          {global?.headerCta && <CmsLink link={global.headerCta} locale={locale} />}
        </div>
      </div>
    </header>
  );
}
