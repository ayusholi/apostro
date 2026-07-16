import type { ContentBlock } from "@/domain/blog/Post";
import { BlogPolicy } from "@/domain/blog/policy";

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Pure word-count over a post's content blocks — independently testable, no IO. */
export function countWords(body: ContentBlock[]): number {
  return body.reduce((total, block) => {
    switch (block.type) {
      case "paragraph":
      case "heading":
        return total + wordCount(block.text);
      case "quote":
        return total + wordCount(block.text) + (block.attribution ? wordCount(block.attribution) : 0);
      case "list":
        return total + block.items.reduce((sum, item) => sum + wordCount(item), 0);
    }
  }, 0);
}

/** Whole minutes, rounded up, minimum 1 — matches the convention readers expect ("3 min read"). */
export function computeReadingTime(body: ContentBlock[]): number {
  return Math.max(1, Math.ceil(countWords(body) / BlogPolicy.wordsPerMinute));
}
