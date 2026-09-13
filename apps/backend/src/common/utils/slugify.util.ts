/** Converts a display name into a URL-friendly slug, e.g. "RTX 5070 Ti" -> "rtx-5070-ti". */
export function slugify(input: string): string {
  return input
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
