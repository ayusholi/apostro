import type { ContentBlock } from "@/domain/blog/Post";

export type TocEntry = { id: string; text: string; level: 2 | 3 };

/** Pure extraction of heading blocks, in document order — the table of contents IS this list. */
export function extractTableOfContents(body: ContentBlock[]): TocEntry[] {
  return body
    .filter((block): block is Extract<ContentBlock, { type: "heading" }> => block.type === "heading")
    .map((block) => ({ id: block.id, text: block.text, level: block.level }));
}
