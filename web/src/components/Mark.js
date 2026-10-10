/** Integration logo, or a monogram tile while no logo is uploaded. */
export default function Mark({ name, logo, large }) {
  const initials = (name || '?')
    .replace(/\(.*?\)/g, '')
    .split(/[\s-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  return (
    <span className={`mark${large ? ' large' : ''}`} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {logo ? <img src={logo} alt="" /> : initials}
    </span>
  );
}
