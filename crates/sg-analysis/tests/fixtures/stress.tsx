export function A({ html }: { html: string }) {
  const props = { dangerouslySetInnerHTML: { __html: html } };
  return (
    <section>
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <p>{html}</p>
      <span {...props} />
    </section>
  );
}
