import Image from 'next/image';
import SectionHead from './SectionHead';
import { mediaUrl } from '@/lib/strapi';

export default function UseCase({ block }) {
  const image = mediaUrl(block.image);
  return (
    <section className="section">
      <div className="container">
        <SectionHead title={block.title} />
        <div className="card use-case" style={image ? undefined : { gridTemplateColumns: '1fr' }}>
          <div>
            <h3>{block.storyTitle}</h3>
            {block.intro && <p className="muted">{block.intro}</p>}
            <ul className="line-items">
              {(block.items || []).map((item, i) => (
                <li key={item.id ?? i}>
                  <span>{item.label}{item.detail && <small>{item.detail}</small>}</span>
                  {item.value && <span className="value">{item.value}</span>}
                </li>
              ))}
            </ul>
            {block.footnote && <p className="footnote">{block.footnote}</p>}
          </div>
          {image && <Image src={image} alt={block.image.alternativeText || ''} width={block.image.width || 960} height={block.image.height || 640} />}
        </div>
      </div>
    </section>
  );
}
