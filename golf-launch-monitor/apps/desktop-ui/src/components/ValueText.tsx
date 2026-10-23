/**
 * A formatted value or range ("166.9–168.8 mph", "19 yd L–5 yd R") that may only wrap right
 * after the en dash, so an endpoint is never split across lines ("8.3° L–/4.0° L"). The text
 * content is unchanged; only line-break opportunities are controlled.
 */
export function ValueText({ text }: { readonly text: string }) {
  const dash = text.indexOf("–");
  if (dash < 0) return <span className="value-part">{text}</span>;
  return (
    <>
      <span className="value-part">{text.slice(0, dash + 1)}</span>
      <wbr />
      <span className="value-part">{text.slice(dash + 1)}</span>
    </>
  );
}
