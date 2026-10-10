import Image from 'next/image';
import Markdown from '../Markdown';
import CmsLink from '../CmsLink';
import SectionHead from './SectionHead';
import { mediaUrl } from '@/lib/strapi';

export default function FeatureCards({ block, locale }) {
  const cards = block.cards || [];
  const numbered = cards.every((c) => !c.image);
  return (
    <section className="section">
      <div className="container">
        <SectionHead title={block.title} subtitle={block.subtitle} />
        <div className={`grid cols-${block.columns || 'three'}`}>
          {cards.map((card, i) => (
            <article key={card.id ?? i} className="card feature-card">
              {card.image ? (
                <Image src={mediaUrl(card.image)} alt={card.image.alternativeText || ''} width={640} height={400} />
              ) : numbered ? (
                <span className="num" aria-hidden="true">{i + 1}</span>
              ) : null}
              <h3>{card.title}</h3>
              <Markdown locale={locale}>{card.text}</Markdown>
              {card.link && <div><CmsLink link={card.link} locale={locale} style={card.link.style || 'text'} /></div>}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
