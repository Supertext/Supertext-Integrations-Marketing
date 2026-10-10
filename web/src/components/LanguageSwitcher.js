'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { LANGUAGE_NAMES, LOCALES } from '@/lib/i18n';

export default function LanguageSwitcher({ locale, label }) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const change = (event) => {
    const next = event.target.value;
    const rest = pathname.replace(/^\/(en|de|fr|it)(?=\/|$)/, '');
    const query = search.toString();
    router.push(`/${next}${rest}${query ? `?${query}` : ''}`);
  };
  return (
    <select className="lang-select" value={locale} onChange={change} aria-label={label}>
      {LOCALES.map((code) => (
        <option key={code} value={code}>{LANGUAGE_NAMES[code]}</option>
      ))}
    </select>
  );
}
