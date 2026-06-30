// Splits a title on "&" and wraps the ampersand in a plain sans-serif span
// so it doesn't inherit the decorative swash glyph from the serif heading font.
export default function renderTitle(title) {
  if (!title) return title
  const parts = String(title).split('&')
  if (parts.length === 1) return title

  return parts.map((part, i) => (
    <span key={i}>
      {part}
      {i < parts.length - 1 && <span className="amp">&amp;</span>}
    </span>
  ))
}
