import Image from 'next/image';
import CmsLink from '../CmsLink';
import { mediaUrl } from '@/lib/strapi';

export default function Hero({ block, locale }) {
  const image = mediaUrl(block.image);
  const split = block.layout === 'split' && image;
  return (
    <section className="hero">
      <div className={`container ${split ? 'hero-split' : 'hero-centered'}`}>
        <div className="hero-text">
          {block.eyebrow && <span className="eyebrow">{block.eyebrow}</span>}
          <h1 className="display">{block.title}</h1>
          {block.subtitle && <p className="hero-sub">{block.subtitle}</p>}
          {(block.primaryCta || block.secondaryCta) && (
            <div className={`btn-row${split ? '' : ' center'}`}>
              <CmsLink link={block.primaryCta} locale={locale} />
              <CmsLink link={block.secondaryCta} locale={locale} />
            </div>
          )}
        </div>
        {image && (
          <div className="hero-image" style={split ? undefined : { marginTop: 48 }}>
            <Image src={image} alt={block.image.alternativeText || ''} width={block.image.width || 1280} height={block.image.height || 720} priority />
          </div>
        )}
      </div>
    </section>
  );
}
