/**
 * Flatten a Lexical document to plain text, for `<meta name="description">`.
 *
 * Rendering to the page always goes through Payload's JSX serializer instead
 * (plan §5.3) — this is only for places that need a bare string and cannot
 * accept markup, where escaping is the browser's job anyway.
 */
type LexicalNode = {
  text?: unknown
  children?: unknown
}

const collect = (node: unknown, out: string[]): void => {
  if (!node || typeof node !== 'object') {
    return
  }

  const { text, children } = node as LexicalNode

  if (typeof text === 'string' && text) {
    out.push(text)
  }

  if (Array.isArray(children)) {
    for (const child of children) {
      collect(child, out)
    }
  }
}

export const lexicalToPlainText = (data: unknown, limit = 200): string => {
  if (!data || typeof data !== 'object') {
    return ''
  }

  const out: string[] = []
  collect((data as { root?: unknown }).root, out)

  const text = out.join(' ').replace(/\s+/g, ' ').trim()

  if (text.length <= limit) {
    return text
  }

  // Cut on a word boundary rather than mid-word.
  return `${text.slice(0, text.lastIndexOf(' ', limit)).trimEnd()}…`
}
