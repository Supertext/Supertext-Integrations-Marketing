import Markdown from '../Markdown';

export default function Notice({ block, locale }) {
  return (
    <section className="section">
      <div className="container">
        <div className={`notice ${block.tone || 'info'}`}>
          <Markdown locale={locale}>{block.text}</Markdown>
        </div>
      </div>
    </section>
  );
}
