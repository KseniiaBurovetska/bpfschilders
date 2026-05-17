/**
 * info-strip block — EDS decorator
 *
 * Expected document table structure (2 rows, 1 column each):
 *   Row 0: left panel content  — coverage metric
 *   Row 1: right panel content — login CTA
 *
 * Each row cell may contain authored text used for content.
 * The block is rebuilt from the DOM-snapshot structure so it
 * matches the source component exactly.
 */

/**
 * Extract authored overrides from a table cell.
 * Returns { href, label, value, iconClass } where present.
 */
function parsePanelCell(cell) {
  const text = cell.textContent.trim();
  const link = cell.querySelector('a');
  return {
    href: link ? link.getAttribute('href') : null,
    title: link ? link.getAttribute('title') : null,
    rawText: text,
  };
}

/**
 * Build the coverage (left) panel element.
 * @param {object} opts - { href, title }
 */
function buildCoveragePanel(opts) {
  const panel = document.createElement('div');
  panel.className = 'info-strip-panel info-strip-panel--coverage';

  const a = document.createElement('a');
  a.href = opts.href || '/over-ons/dit-presteren-we/dekkingsgraad/';
  if (opts.title) a.setAttribute('title', opts.title);

  const iconSpan = document.createElement('span');
  iconSpan.className = 'icon icon-area-chart';
  iconSpan.setAttribute('aria-hidden', 'true');

  const textSpan = document.createElement('span');
  textSpan.className = 'info-strip-text';

  const labelNode = document.createTextNode('Eindstand beleidsdekkingsgraad 2025');
  const strong = document.createElement('strong');
  strong.textContent = '140,7%';

  textSpan.appendChild(labelNode);
  textSpan.appendChild(strong);

  a.appendChild(iconSpan);
  a.appendChild(textSpan);
  panel.appendChild(a);

  return panel;
}

/**
 * Build the login (right) panel element.
 * @param {object} opts - { href }
 */
function buildLoginPanel(opts) {
  const panel = document.createElement('div');
  panel.className = 'info-strip-panel info-strip-panel--login';

  const a = document.createElement('a');
  a.href = opts.href || '/inloggen/';

  const iconSpan = document.createElement('span');
  iconSpan.className = 'icon icon-log-in';
  iconSpan.setAttribute('aria-hidden', 'true');

  const textSpan = document.createElement('span');
  textSpan.className = 'info-strip-text';

  const labelNode = document.createTextNode('INLOGGEN');
  const strong = document.createElement('span');
  strong.className = 'info-strip-underline';

  textSpan.appendChild(labelNode);
  textSpan.appendChild(strong);

  a.appendChild(iconSpan);
  a.appendChild(textSpan);
  panel.appendChild(a);

  return panel;
}

export default function decorate(block) {
  // Read authored overrides from table rows if present
  const rows = [...block.querySelectorAll(':scope > div')];

  // Parse authored data: row 0 = coverage, row 1 = login
  const coverageOpts = rows[0] ? parsePanelCell(rows[0]) : {};
  const loginOpts = rows[1] ? parsePanelCell(rows[1]) : {};

  // Override defaults with authored hrefs when present
  if (!coverageOpts.href) {
    coverageOpts.href = '/over-ons/dit-presteren-we/dekkingsgraad/';
  }
  if (!loginOpts.href) {
    loginOpts.href = '/inloggen/';
  }

  // Clear block and rebuild with correct structure
  block.innerHTML = '';

  const wrapper = document.createElement('div');
  wrapper.className = 'info-strip-wrapper';

  wrapper.appendChild(buildCoveragePanel(coverageOpts));
  wrapper.appendChild(buildLoginPanel(loginOpts));

  block.appendChild(wrapper);
}
