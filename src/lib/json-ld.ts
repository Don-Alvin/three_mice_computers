/**
 * Serializes a JSON-LD object for a `<script type="application/ld+json">` child.
 *
 * `<` is escaped to `<` so a value containing `</script>` (a product or
 * category name, say) cannot break out of the tag. Still valid JSON either way.
 * Shared so every JSON-LD block on the site escapes the same way (plan §9).
 */
export const jsonLdScript = (data: unknown): string => JSON.stringify(data).replace(/</g, '\\u003c')
