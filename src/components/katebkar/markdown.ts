"use client";

/**
 * Minimal, safe Markdown renderer for article content.
 * Supports: headings (#, ##, ###), bold (**), lists (-), paragraphs, and links.
 * No raw HTML is rendered (escaped) for safety.
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function inline(text: string): string {
  let t = escapeHtml(text);
  // bold
  t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  // links [text](url)
  t = t.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-navy underline underline-offset-2">$1</a>'
  );
  return t;
}

export function renderMarkdown(md: string): string {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let i = 0;
  let inList = false;

  const closeList = () => {
    if (inList) {
      out.push("</ul>");
      inList = false;
    }
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      closeList();
      i++;
      continue;
    }

    // Headings
    const h = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      closeList();
      const level = Math.min(h[1].length, 6);
      out.push(
        `<h${level} class="kk-md-h${level}">${inline(h[2])}</h${level}>`
      );
      i++;
      continue;
    }

    // List items
    if (/^[-*]\s+/.test(trimmed)) {
      if (!inList) {
        out.push('<ul class="kk-md-ul">');
        inList = true;
      }
      out.push(`<li>${inline(trimmed.replace(/^[-*]\s+/, ""))}</li>`);
      i++;
      continue;
    }

    // Ordered list items
    if (/^\d+\.\s+/.test(trimmed)) {
      if (!inList) {
        out.push('<ul class="kk-md-ul">');
        inList = true;
      }
      out.push(`<li>${inline(trimmed.replace(/^\d+\.\s+/, ""))}</li>`);
      i++;
      continue;
    }

    // Paragraph
    closeList();
    out.push(`<p class="kk-md-p">${inline(trimmed)}</p>`);
    i++;
  }
  closeList();

  return out.join("\n");
}
