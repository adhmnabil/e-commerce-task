const ALLOWED_TAGS = new Set([
  'P', 'BR', 'UL', 'OL', 'LI', 'STRONG', 'B', 'EM', 'I', 'U', 'SPAN', 'A', 'H3', 'H4',
]);
const DROPPED_TAGS = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'TEMPLATE', 'NOSCRIPT']);

/**
 * Whitelist-based sanitizer for merchant-authored rich text. Runs on a detached
 * document so scripts and event handlers never execute during parsing.
 */
export function sanitizeHtml(dirty: string): string {
  if (typeof DOMParser === 'undefined') return '';
  const doc = new DOMParser().parseFromString(`<body>${dirty}</body>`, 'text/html');

  const walk = (node: Element): void => {
    for (const child of Array.from(node.children)) {
      if (DROPPED_TAGS.has(child.tagName)) {
        child.remove();
        continue;
      }
      if (!ALLOWED_TAGS.has(child.tagName)) {
        walk(child);
        child.replaceWith(...Array.from(child.childNodes));
        continue;
      }
      for (const attr of Array.from(child.attributes)) {
        const keep = child.tagName === 'A' && attr.name === 'href' && /^https?:/i.test(attr.value);
        if (!keep) child.removeAttribute(attr.name);
      }
      if (child.tagName === 'A') {
        child.setAttribute('target', '_blank');
        child.setAttribute('rel', 'noopener noreferrer');
      }
      walk(child);
    }
  };

  walk(doc.body);
  // Collapse runs of empty paragraphs the API's WYSIWYG editor tends to emit.
  return doc.body.innerHTML.replace(/(<p><br><\/p>\s*)+/g, '');
}

export function stripHtml(html: string): string {
  if (typeof DOMParser === 'undefined') return html.replace(/<[^>]+>/g, ' ');
  return new DOMParser().parseFromString(html, 'text/html').body.textContent ?? '';
}
