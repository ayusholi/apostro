import type { LegalSection } from "@/types";

const EMAIL_PATTERN = /([\w.+-]+@[\w-]+(?:\.[\w-]+)+)/;

/** Renders plain legal copy, turning any email address into a mailto link. */
function linkifyEmails(text: string) {
  return text.split(EMAIL_PATTERN).map((part, i) =>
    i % 2 === 1 ? <a key={i} href={`mailto:${part}`}>{part}</a> : part,
  );
}

export function LegalPageBody({ sections, lastUpdated }: { sections: LegalSection[]; lastUpdated: string }) {
  return (
    <article className="legal-body">
      <p className="legal-body__updated">Last reviewed: {lastUpdated}</p>
      {sections.map((section) => (
        <section key={section.heading}>
          <h2>{section.heading}</h2>
          {section.paragraphs?.map((paragraph, i) => <p key={i}>{linkifyEmails(paragraph)}</p>)}
          {section.list && (
            <ul>
              {section.list.map((item, i) => (
                <li key={i}>{linkifyEmails(item)}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </article>
  );
}
