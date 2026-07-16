import type { LegalSection } from "@/types";

export function LegalPageBody({ sections, lastUpdated }: { sections: LegalSection[]; lastUpdated: string }) {
  return (
    <article className="legal-body">
      <p className="legal-body__updated">Last reviewed: {lastUpdated}</p>
      {sections.map((section) => (
        <section key={section.heading}>
          <h2>{section.heading}</h2>
          {section.paragraphs?.map((paragraph, i) => <p key={i}>{paragraph}</p>)}
          {section.list && (
            <ul>
              {section.list.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </article>
  );
}
