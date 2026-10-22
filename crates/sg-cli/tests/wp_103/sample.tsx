export function Card({ html }: { html: string }) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}
