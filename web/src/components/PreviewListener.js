'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/** Inside Strapi's preview pane: reload the page data whenever the editor saves. */
export default function PreviewListener({ strapiOrigin }) {
  const router = useRouter();
  useEffect(() => {
    const onMessage = (event) => {
      if (strapiOrigin && event.origin !== strapiOrigin) return;
      if (event.data?.type === 'strapiUpdate') router.refresh();
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [router, strapiOrigin]);
  return null;
}
