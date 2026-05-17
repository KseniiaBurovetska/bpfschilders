/**
 * BPF Schilders — header block
 * Source component: SiteHeaderNavigation (header.main-header)
 * Source URL: https://www.bpfschilders.nl/werknemer
 *
 * Builds the full header DOM from authored block content or falls back to
 * hard-coded navigation data derived from the captured DOM snapshot.
 * EDS convention: decorate(block) receives the block root div.
 */

// ─── Static navigation data from dom-snapshot.json ───────────────────────────

const TOP_NAV_LINKS = [
  { href: '/werknemer/', text: 'Werknemer' },
  { href: '/ondernemer/', text: 'Ondernemer' },
  { href: '/werkgever/', text: 'Werkgever' },
  { href: '/over-ons/', text: 'Over ons' },
  { href: '/klacht/', text: 'Klacht' },
  { href: '/translate/', text: 'Translate' },
  { href: '/contact/', text: 'Contact' },
];

const MAIN_NAV_LINKS = [
  { href: '/werknemer/', text: 'Home', cssClass: 'home' },
  { href: '/werknemer/het-pensioen/', text: 'Het pensioen', cssClass: 'has-children' },
  { href: '/werknemer/wat-doe-ik-bij/', text: 'Wat doe ik bij...', cssClass: 'has-children' },
  { href: '/werknemer/u-bent-met-pensioen/', text: 'U bent met pensioen', cssClass: '' },
  { href: '/werknemer/actueel/', text: 'Actueel', cssClass: '' },
  { href: '/werknemer/contact/', text: 'Contact', cssClass: '' },
];

const LOGO_SRC = 'https://cdn.infodesk.nl/assets/images/logo.svg';
const LOGO_HREF = '/';
const SEARCH_PLACEHOLDER = 'Heeft u een vraag?';
const SEARCH_ARIA_LABEL = 'Zoeken';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Attempt to read authored content from block cells.
 * Block table structure (EDS): block > div (row) > div (cell)
 * Row 0 cell 0: logo link href
 * Row 0 cell 1: logo image src (or empty — use default)
 * Row 1 cell 0..N: top-nav links (one per cell, format "text|href")
 * Row 2 cell 0..N: main-nav links (one per cell, format "text|href")
 * Row 3 cell 0: search placeholder
 * Row 3 cell 1: search aria-label
 */
function parseAuthoredContent(block) {
  const rows = [...block.querySelectorAll(':scope > div')];
  if (!rows.length) return null;

  const getCell = (rowIdx, cellIdx) => {
    const row = rows[rowIdx];
    if (!row) return '';
    const cells = [...row.querySelectorAll(':scope > div')];
    const cell = cells[cellIdx];
    return cell ? cell.textContent.trim() : '';
  };

  const parseLinks = (rowIdx) => {
    const row = rows[rowIdx];
    if (!row) return null;
    const cells = [...row.querySelectorAll(':scope > div')];
    const links = cells
      .map((cell) => {
        const anchor = cell.querySelector('a');
        if (anchor) return { href: anchor.href, text: anchor.textContent.trim() };
        const text = cell.textContent.trim();
        if (!text) return null;
        const parts = text.split('|');
        return parts.length === 2 ? { href: parts[1].trim(), text: parts[0].trim() } : null;
      })
      .filter(Boolean);
    return links.length ? links : null;
  };

  return {
    logoHref: getCell(0, 0) || LOGO_HREF,
    logoSrc: getCell(0, 1) || LOGO_SRC,
    topNavLinks: parseLinks(1) || TOP_NAV_LINKS,
    mainNavLinks: parseLinks(2) || MAIN_NAV_LINKS,
    searchPlaceholder: getCell(3, 0) || SEARCH_PLACEHOLDER,
    searchAriaLabel: getCell(3, 1) || SEARCH_ARIA_LABEL,
  };
}

// ─── DOM builders ─────────────────────────────────────────────────────────────

function buildLogo(logoHref, logoSrc) {
  const a = document.createElement('a');
  a.className = 'header-logo';
  a.href = logoHref;
  a.title = 'BPF Schilders';

  const img = document.createElement('img');
  img.src = logoSrc;
  img.alt = 'BPF Schilders';
  img.width = 196;
  img.height = 70;

  a.append(img);
  return a;
}

function buildTopNav(links) {
  const nav = document.createElement('nav');
  nav.className = 'top-navigation';
  nav.setAttribute('role', 'navigation');
  nav.setAttribute('aria-label', 'Top navigation');

  const ul = document.createElement('ul');

  links.forEach((link) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = link.href;
    a.textContent = link.text;
    if (link.cssClass) li.className = link.cssClass;
    li.append(a);
    ul.append(li);
  });

  nav.append(ul);
  return nav;
}

function buildMainNav(links) {
  const nav = document.createElement('nav');
  nav.className = 'main-navigation';
  nav.setAttribute('role', 'navigation');
  nav.setAttribute('aria-label', 'Main navigation');

  const ul = document.createElement('ul');

  links.forEach((link) => {
    const li = document.createElement('li');
    if (link.cssClass) li.className = link.cssClass;

    const a = document.createElement('a');
    a.href = link.href;

    if (link.cssClass === 'home') {
      // Render as home icon (FontAwesome home glyph via span) + visually hidden text
      const icon = document.createElement('span');
      icon.className = 'header-home-icon';
      icon.setAttribute('aria-hidden', 'true');
      const srText = document.createElement('span');
      srText.className = 'sr-only';
      srText.textContent = link.text;
      a.append(icon, srText);
    } else {
      a.textContent = link.text;
    }

    li.append(a);
    ul.append(li);
  });

  nav.append(ul);
  return nav;
}

function buildSearch(placeholder, ariaLabel) {
  const container = document.createElement('div');
  container.className = 'search-container';

  const form = document.createElement('form');
  form.setAttribute('role', 'search');
  form.setAttribute('action', '/zoeken');
  form.setAttribute('method', 'get');

  const input = document.createElement('input');
  input.type = 'search';
  input.name = 'q';
  input.placeholder = placeholder;
  input.className = 'search-input';

  const button = document.createElement('button');
  button.type = 'submit';
  button.setAttribute('aria-label', ariaLabel);
  button.className = 'search-submit';

  // FontAwesome search icon via icon span
  const icon = document.createElement('span');
  icon.className = 'icon icon-search';
  icon.setAttribute('aria-hidden', 'true');
  button.append(icon);

  form.append(input, button);
  container.append(form);
  return container;
}

function buildHamburger() {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'header-hamburger';
  btn.setAttribute('aria-label', 'Open menu');
  btn.setAttribute('aria-expanded', 'false');
  btn.setAttribute('aria-controls', 'header-navigation');

  // Three lines (CSS draws them)
  for (let i = 0; i < 3; i += 1) {
    const line = document.createElement('span');
    line.className = 'hamburger-line';
    btn.append(line);
  }

  return btn;
}

// ─── Main decoration function ─────────────────────────────────────────────────

export default function decorate(block) {
  const content = parseAuthoredContent(block) || {
    logoHref: LOGO_HREF,
    logoSrc: LOGO_SRC,
    topNavLinks: TOP_NAV_LINKS,
    mainNavLinks: MAIN_NAV_LINKS,
    searchPlaceholder: SEARCH_PLACEHOLDER,
    searchAriaLabel: SEARCH_ARIA_LABEL,
  };

  // Clear the authored table markup
  block.textContent = '';

  // Build the container (mirrors div.container from source)
  const container = document.createElement('div');
  container.className = 'header-container';

  // Logo
  const logo = buildLogo(content.logoHref, content.logoSrc);
  container.append(logo);

  // Navigation wrapper (mirrors div.header-navigation)
  const navWrapper = document.createElement('div');
  navWrapper.id = 'header-navigation';
  navWrapper.className = 'header-navigation';

  const topNav = buildTopNav(content.topNavLinks);
  const mainNav = buildMainNav(content.mainNavLinks);

  navWrapper.append(topNav, mainNav);
  container.append(navWrapper);

  // Search
  const search = buildSearch(content.searchPlaceholder, content.searchAriaLabel);
  container.append(search);

  // Hamburger (mobile only — visible via CSS)
  const hamburger = buildHamburger();
  container.append(hamburger);

  block.append(container);

  // ── Hamburger toggle interaction ──────────────────────────────────────────
  hamburger.addEventListener('click', () => {
    const expanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!expanded));
    hamburger.setAttribute('aria-label', expanded ? 'Open menu' : 'Close menu');
    navWrapper.classList.toggle('is-open', !expanded);
    hamburger.classList.toggle('is-open', !expanded);
  });

  // Close nav on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && hamburger.getAttribute('aria-expanded') === 'true') {
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'Open menu');
      navWrapper.classList.remove('is-open');
      hamburger.classList.remove('is-open');
      hamburger.focus();
    }
  });
}
