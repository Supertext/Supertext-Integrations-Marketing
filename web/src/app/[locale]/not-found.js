import Link from 'next/link';
import { strings } from '@/lib/i18n';

export default function NotFound() {
  const t = strings('en');
  return (
    <div className="container page-simple">
      <h1 className="display">{t.notFoundTitle}</h1>
      <p className="muted">{t.notFoundText}</p>
      <Link className="btn btn-primary" href="/en">{t.backHome}</Link>
    </div>
  );
}
