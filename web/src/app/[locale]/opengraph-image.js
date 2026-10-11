import { ImageResponse } from 'next/og';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Supertext integrations';

/** Default social preview image (pages with their own SEO image or screenshot use that instead). */
export default function Image() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 72, background: '#003230', color: '#f7f5f3' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 40 }}>
          <div style={{ width: 30, height: 30, borderRadius: 30, background: '#78ffaf', boxShadow: '0 0 0 6px #f7f5f3' }} />
          Supertext
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ fontSize: 76, lineHeight: 1.05, letterSpacing: -1 }}>Translate where your content lives</div>
          <div style={{ fontSize: 34, color: '#c9d4d3' }}>30+ integrations for CMS, PIM, shops and design tools · SDKs for 5 languages</div>
        </div>
      </div>
    ),
    size
  );
}
