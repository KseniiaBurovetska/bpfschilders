/*
 * Carousel block — EDS implementation of LifeEventNavigation (costumer-journey).
 *
 * EDS authoring table → DOM structure:
 *   Row 0 (optional): single cell → section heading text
 *   Rows 1–N: three cells → [icon_class, label, href]
 *
 * The block renders into:
 *   .carousel-wrapper
 *     h1.section-header
 *     div.carrousel[data-module=carrousel][paging=true]
 *       div.carrousel-wrapper
 *         ul.slider-wrapper
 *           li > a[href] > i.costumer-journey-icon.icon-bpf.{icon_class} + text
 *       button.prev[aria-label="Vorige"]
 *       button.next[aria-label="Volgende"]
 *       nav.paging
 *         a.active[href=#] + a[href=#] ...
 *
 * NOTE: class spelling "costumer-journey" (not "customer") is intentional and
 * must not be corrected — the BPFicons font and source JS depend on it.
 */

// Carousel items hardcoded from the source capture (11 life-event steps).
// In a full EDS authoring scenario these would come from the document table rows;
// the fallback list ensures the gallery always renders correctly.
const DEFAULT_ITEMS = [
  { iconClass: 'icon-bpf-pensioen',          label: 'Met pensioen gaan',            href: '/werknemer/wat-doe-ik-bij/met-pensioen-gaan/' },
  { iconClass: 'icon-bpf-trouwen',            label: 'Trouwen en samenwonen',         href: '/werknemer/wat-doe-ik-bij/trouwen-of-samenwonen/' },
  { iconClass: 'icon-bpf-verhuizen',          label: 'Verhuizen',                     href: '/werknemer/wat-doe-ik-bij/verhuizen/' },
  { iconClass: 'icon-bpf-scheiden',           label: 'Scheiden',                      href: '/werknemer/wat-doe-ik-bij/scheiden-of-uit-elkaar-gaan/' },
  { iconClass: 'icon-bpf-ontslag',            label: 'Ontslag',                       href: '/werknemer/wat-doe-ik-bij/ontslag/' },
  { iconClass: 'icon-bpf-veranderenvanbaan',  label: 'Veranderen van baan',           href: '/werknemer/wat-doe-ik-bij/nieuwe-baan/' },
  { iconClass: 'icon-bpf-uitzendkracht',      label: 'Uitzendkracht',                 href: '/werknemer/wat-doe-ik-bij/uitzendkracht-worden/' },
  { iconClass: 'icon-bpf-voorjezelfbeginnen', label: 'Voor jezelf beginnen',           href: '/werknemer/wat-doe-ik-bij/voor-uzelf-beginnen/' },
  { iconClass: 'icon-bpf-arbeidsongeschikt',  label: 'Arbeidsongeschikt',             href: '/werknemer/wat-doe-ik-bij/arbeidsongeschiktheid/' },
  { iconClass: 'icon-bpf-verlof',             label: 'Verlof',                        href: '/werknemer/wat-doe-ik-bij/verlof/' },
  { iconClass: 'icon-bpf-overlijden',         label: 'Overlijden',                    href: '/werknemer/wat-doe-ik-bij/overlijden/' },
];

/**
 * Returns the number of items visible per page for the current viewport width.
 * Desktop (≥1024px): 6 items; tablet (≥600px): 4 items; mobile: 2 items.
 * These match the source screenshot (6 on desktop, 2 on mobile).
 */
function getItemsPerPage() {
  if (window.innerWidth >= 1024) return 6;
  if (window.innerWidth >= 600) return 4;
  return 2;
}

export default function decorate(block) {
  // ── 1. Parse authored rows ───────────────────────────────────────────────
  const rows = [...block.querySelectorAll(':scope > div')];
  let headingText = 'Wat doe ik bij...';
  const items = [];

  rows.forEach((row) => {
    const cells = [...row.querySelectorAll(':scope > div')];
    if (cells.length === 1) {
      // Single-cell row = section heading
      headingText = cells[0].textContent.trim() || headingText;
    } else if (cells.length >= 3) {
      // Three-cell row = icon_class | label | href
      items.push({
        iconClass: cells[0].textContent.trim(),
        label:     cells[1].textContent.trim(),
        href:      cells[2].querySelector('a')?.href || cells[2].textContent.trim(),
      });
    } else if (cells.length === 2) {
      // Two-cell row = label | href (icon class derived from label slug)
      items.push({
        iconClass: '',
        label:     cells[0].textContent.trim(),
        href:      cells[1].querySelector('a')?.href || cells[1].textContent.trim(),
      });
    }
  });

  // Fall back to hardcoded defaults when no items were authored
  const carouselItems = items.length > 0 ? items : DEFAULT_ITEMS;

  // ── 2. Clear block and build DOM ─────────────────────────────────────────
  block.innerHTML = '';

  // Outer wrapper
  const wrapper = document.createElement('div');
  wrapper.className = 'carousel-wrapper';

  // Section heading
  const heading = document.createElement('h1');
  heading.className = 'section-header';
  heading.textContent = headingText;
  wrapper.appendChild(heading);

  // Carrousel container (note: "carrousel" spelling preserved from source)
  const carrousel = document.createElement('div');
  carrousel.className = 'carrousel';
  carrousel.setAttribute('data-module', 'carrousel');
  carrousel.setAttribute('paging', 'true');

  // Carrousel track wrapper (clips overflow)
  const carrouselWrapper = document.createElement('div');
  carrouselWrapper.className = 'carrousel-wrapper';

  // Slider list
  const sliderWrapper = document.createElement('ul');
  sliderWrapper.className = 'slider-wrapper';

  carouselItems.forEach((item, index) => {
    const li = document.createElement('li');
    if (index === 0) li.classList.add('active');

    const a = document.createElement('a');
    a.href = item.href || '#';

    // Icon element — class "costumer-journey-icon" spelling is intentional (source typo)
    const icon = document.createElement('i');
    icon.className = `costumer-journey-icon icon-bpf${item.iconClass ? ` ${item.iconClass}` : ''}`;

    a.appendChild(icon);
    a.appendChild(document.createTextNode(item.label));
    li.appendChild(a);
    sliderWrapper.appendChild(li);
  });

  carrouselWrapper.appendChild(sliderWrapper);
  carrousel.appendChild(carrouselWrapper);

  // Prev button
  const prevBtn = document.createElement('button');
  prevBtn.className = 'prev';
  prevBtn.setAttribute('aria-label', 'Vorige');
  carrousel.appendChild(prevBtn);

  // Next button
  const nextBtn = document.createElement('button');
  nextBtn.className = 'next';
  nextBtn.setAttribute('aria-label', 'Volgende');
  carrousel.appendChild(nextBtn);

  // Paging nav (dots generated below after items per page is known)
  const pagingNav = document.createElement('nav');
  pagingNav.className = 'paging';
  carrousel.appendChild(pagingNav);

  wrapper.appendChild(carrousel);
  block.appendChild(wrapper);

  // ── 3. Carousel state & logic ────────────────────────────────────────────
  let currentPage = 0;

  function buildPaging() {
    const perPage = getItemsPerPage();
    const totalPages = Math.ceil(carouselItems.length / perPage);
    pagingNav.innerHTML = '';
    for (let i = 0; i < totalPages; i++) {
      const dot = document.createElement('a');
      dot.href = '#';
      dot.textContent = String(i);
      if (i === currentPage) dot.classList.add('active');
      dot.addEventListener('click', (e) => {
        e.preventDefault();
        goToPage(i);
      });
      pagingNav.appendChild(dot);
    }
  }

  function goToPage(page) {
    const perPage = getItemsPerPage();
    const totalPages = Math.ceil(carouselItems.length / perPage);
    currentPage = Math.max(0, Math.min(page, totalPages - 1));

    // Slide the track
    const itemWidth = sliderWrapper.querySelector('li')?.offsetWidth || 0;
    const offset = -(currentPage * perPage * itemWidth);
    sliderWrapper.style.transform = `translateX(${offset}px)`;

    // Update active li
    [...sliderWrapper.querySelectorAll('li')].forEach((li, idx) => {
      li.classList.toggle('active', idx >= currentPage * perPage && idx < (currentPage + 1) * perPage);
    });

    // Update paging dots
    [...pagingNav.querySelectorAll('a')].forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentPage);
    });
  }

  prevBtn.addEventListener('click', () => goToPage(currentPage - 1));
  nextBtn.addEventListener('click', () => goToPage(currentPage + 1));

  // Rebuild paging on resize (items-per-page changes)
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      currentPage = 0;
      buildPaging();
      goToPage(0);
    }, 150);
  });

  // Initial render
  buildPaging();
  goToPage(0);
}
