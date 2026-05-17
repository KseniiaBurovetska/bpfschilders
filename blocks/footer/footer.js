/**
 * Footer block — BPF Schilders
 *
 * Expected EDS document table structure (authored in /footer document):
 *   Row 1:  | copyright | Copyright © BPF Schilders 2026 |
 *   Row 2+: | link      | <link text> | <href>           |
 *   Optional row: | cookie | Mijn cookievoorkeur wijzigen |
 *
 * Falls back to hardcoded values from the source capture when the authored
 * content is absent (useful during development / block gallery preview).
 */

const FALLBACK_COPYRIGHT = 'Copyright © BPF Schilders 2026';

/**
 * Ordered fallback items — document order must match the source footer:
 * Disclaimer | Privacy | Cookiebeleid | Mijn cookievoorkeur wijzigen | Contact
 */
const FALLBACK_ITEMS = [
  { type: 'link', text: 'Disclaimer', href: '/disclaimer/' },
  { type: 'link', text: 'Privacy', href: '/privacy-statement-bpf-schilders/' },
  { type: 'link', text: 'Cookiebeleid', href: '/cookiebeleid/' },
  { type: 'cookie', text: 'Mijn cookievoorkeur wijzigen' },
  { type: 'link', text: 'Contact', href: '/contact/' },
];

/**
 * Parse the block's authored table rows into structured data.
 * Returns { copyright, copyrightRow, items } where items preserves document order.
 * Each item has { type: 'link'|'cookie', text, href?, _row }.
 *
 * Each row div contains one or more cell divs.
 */
function parseBlock(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  let copyright = '';
  let copyrightRow = null;
  const items = [];

  rows.forEach((row) => {
    const cells = [...row.querySelectorAll(':scope > div')];
    if (!cells.length) return;

    const type = cells[0]?.textContent?.trim().toLowerCase();

    if (type === 'copyright') {
      copyright = cells[1]?.textContent?.trim() || '';
      copyrightRow = row;
    } else if (type === 'link') {
      const text = cells[1]?.textContent?.trim() || '';
      // href may be authored as a link element or raw text
      const hrefEl = cells[2]?.querySelector('a');
      const href = hrefEl ? hrefEl.getAttribute('href') : (cells[2]?.textContent?.trim() || '#');
      if (text) items.push({ type: 'link', text, href, _row: row });
    } else if (type === 'cookie') {
      const text = cells[1]?.textContent?.trim() || '';
      if (text) items.push({ type: 'cookie', text, _row: row });
    }
  });

  return { copyright, copyrightRow, items };
}

import { moveInstrumentation } from '../../scripts/scripts.js';

/**
 * Build the footer DOM and inject into `block`.
 */
export default function decorate(block) {
  const parsed = parseBlock(block);

  const { copyrightRow } = parsed;
  const copyright = parsed.copyright || FALLBACK_COPYRIGHT;
  // Preserve document order: fall back to FALLBACK_ITEMS only when no items
  // were parsed at all (e.g. block gallery / dev preview without authored doc).
  const items = parsed.items.length ? parsed.items : FALLBACK_ITEMS;

  // Clear authored table markup
  block.textContent = '';

  // <nav role="navigation">
  const nav = document.createElement('nav');
  nav.setAttribute('role', 'navigation');
  nav.className = 'footer-nav';

  // Copyright paragraph
  const p = document.createElement('p');
  p.className = 'footer-copyright';
  p.textContent = copyright;
  if (copyrightRow) moveInstrumentation(copyrightRow, p);
  nav.append(p);

  // Link list — iterate items in document order so cookie button lands in the
  // correct position (4th, before Contact) rather than always being appended last.
  const ul = document.createElement('ul');
  ul.className = 'footer-links';

  items.forEach((item) => {
    const li = document.createElement('li');
    if (item._row) moveInstrumentation(item._row, li);
    if (item.type === 'cookie') {
      // Cookie preference button (OneTrust)
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.id = 'ot-sdk-btn';
      btn.className = 'ot-sdk-show-settings';
      btn.textContent = item.text;
      li.append(btn);
    } else {
      const a = document.createElement('a');
      a.href = item.href;
      a.textContent = item.text;
      li.append(a);
    }
    ul.append(li);
  });

  nav.append(ul);
  block.append(nav);
}
