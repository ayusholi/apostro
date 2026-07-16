/**
 * Renders one or more JSON-LD documents as <script type="application/ld+json">.
 * A Server Component — the script is in the server-rendered HTML, so crawlers
 * see the structured data on first fetch with no JS execution required.
 */
export function JsonLd({ data }: { data: object | object[] }) {
  const docs = Array.isArray(data) ? data : [data];
  return (
    <>
      {docs.map((doc, i) => (
        <script
          key={i}
          type="application/ld+json"
          // JSON.stringify output is safe here (no user input); we still escape
          // the closing-tag sequence to avoid breaking out of the <script>.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(doc).replace(/</g, "\\u003c"),
          }}
        />
      ))}
    </>
  );
}
