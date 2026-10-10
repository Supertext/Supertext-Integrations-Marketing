import Markdown from '../Markdown';
import SectionHead from './SectionHead';

export default function Faq({ block, locale }) {
  return (
    <section className="section">
      <div className="container">
        <SectionHead title={block.title} />
        <div className="faq">
          {(block.items || []).map((item, i) => (
            <details key={item.id ?? i}>
              <summary>{item.question}</summary>
              <Markdown locale={locale}>{item.answer}</Markdown>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
