import { mediaUrl } from '@/lib/strapi';
import SectionHead from './SectionHead';

export default function LogoStrip({ block }) {
  const logos = block.logos || [];
  if (!logos.length) return null;
  return (
    <section className="section">
      <div className="container">
        <SectionHead title={block.title} />
        <div className="logos">
          {logos.map((logo) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={logo.id} src={mediaUrl(logo)} alt={logo.alternativeText || logo.name || ''} loading="lazy" />
          ))}
        </div>
      </div>
    </section>
  );
}
