/**
 * BPF Schilders — header block
 * Source component: SiteHeaderNavigation (header.main-header)
 *
 * Two-band layout:
 *   .header-top  (gray 70px): logo + top-navigation + hamburger
 *   .header-bottom (white 64px): main-navigation + search
 */

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
        let href, text;
        if (anchor) {
          href = anchor.getAttribute('href');
          text = anchor.textContent.trim();
        } else {
          const raw = cell.textContent.trim();
          if (!raw) return null;
          const parts = raw.split('|');
          if (parts.length !== 2) return null;
          [text, href] = parts.map((s) => s.trim());
        }
        const cssClass = text === 'Home' ? 'home' : '';
        return { href, text, cssClass };
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

  const currentPath = window.location.pathname;
  const hasPathMatch = links.some(
    (l) => l.href && currentPath.startsWith(l.href) && l.href !== '/',
  );

  links.forEach((link, idx) => {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = link.href;
    a.textContent = link.text;

    const classes = link.cssClass ? [link.cssClass] : [];
    const pathMatch = link.href && currentPath.startsWith(link.href) && link.href !== '/';
    if (pathMatch || (!hasPathMatch && idx === 0)) classes.push('active');
    if (classes.length) li.className = classes.join(' ');

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
  btn.setAttribute('aria-controls', 'header-nav-bottom');

  for (let i = 0; i < 3; i += 1) {
    const line = document.createElement('span');
    line.className = 'hamburger-line';
    btn.append(line);
  }

  return btn;
}

export default function decorate(block) {
  const content = parseAuthoredContent(block) || {
    logoHref: LOGO_HREF,
    logoSrc: LOGO_SRC,
    topNavLinks: TOP_NAV_LINKS,
    mainNavLinks: MAIN_NAV_LINKS,
    searchPlaceholder: SEARCH_PLACEHOLDER,
    searchAriaLabel: SEARCH_ARIA_LABEL,
  };

  block.textContent = '';

  // ── Top band: gray strip with logo + top-nav + hamburger ──────────────────
  const headerTop = document.createElement('div');
  headerTop.className = 'header-top';

  const topInner = document.createElement('div');
  topInner.className = 'header-top-inner';

  const logo = buildLogo(content.logoHref, content.logoSrc);
  const topNav = buildTopNav(content.topNavLinks);
  const hamburger = buildHamburger();

  topInner.append(logo, topNav, hamburger);
  headerTop.append(topInner);

  // ── Bottom band: white strip with main-nav + search ───────────────────────
  const headerBottom = document.createElement('div');
  headerBottom.id = 'header-nav-bottom';
  headerBottom.className = 'header-bottom';

  const bottomInner = document.createElement('div');
  bottomInner.className = 'header-bottom-inner';

  const mainNav = buildMainNav(content.mainNavLinks);
  const search = buildSearch(content.searchPlaceholder, content.searchAriaLabel);

  bottomInner.append(mainNav, search);
  headerBottom.append(bottomInner);

  block.append(headerTop, headerBottom);

  // ── Hamburger toggle (mobile) ─────────────────────────────────────────────
  hamburger.addEventListener('click', () => {
    const expanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!expanded));
    hamburger.setAttribute('aria-label', expanded ? 'Open menu' : 'Close menu');
    headerBottom.classList.toggle('is-open', !expanded);
    hamburger.classList.toggle('is-open', !expanded);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && hamburger.getAttribute('aria-expanded') === 'true') {
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'Open menu');
      headerBottom.classList.remove('is-open');
      hamburger.classList.remove('is-open');
      hamburger.focus();
    }
  });
}
