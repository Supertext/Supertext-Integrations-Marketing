export default function SectionHead({ title, subtitle }) {
  if (!title && !subtitle) return null;
  return (
    <div className="section-head">
      {title && <h2 className="section-title">{title}</h2>}
      {subtitle && <p className="section-sub">{subtitle}</p>}
    </div>
  );
}
