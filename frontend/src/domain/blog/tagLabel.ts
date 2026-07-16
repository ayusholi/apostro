/** "hiring-a-lawyer" → "Hiring A Lawyer" — tags are stored as slugs, displayed as labels. */
export function tagLabel(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
