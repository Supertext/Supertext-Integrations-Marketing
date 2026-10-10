import Markdown from '../Markdown';

export default function RichText({ block, locale }) {
  return (
    <section className="section">
      <div className="container">
        <div className={block.width === 'wide' ? undefined : 'narrow'}>
          <Markdown locale={locale}>{block.body}</Markdown>
        </div>
      </div>
    </section>
  );
}
