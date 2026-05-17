/**
 * EDS Cards block — WebinarTeaserGrid migration
 *
 * Expected document table structure (each row = one card):
 *   | image (picture / img)  | heading text     |
 *   |                        | body text        |
 *   |                        | CTA link         |
 *
 * Or a 2-column layout where first cell = image, second cell = all text content.
 * The decorator is defensive: it reads whatever content is authored and maps it
 * to the expected DOM output.
 *
 * Output DOM:
 *   <div class="cards block">
 *     <ul class="cards-wrapper">
 *       <li class="card">
 *         <a class="card-image-link" href="...">
 *           <figure class="card-image">
 *             <picture><img alt="..." /></picture>
 *           </figure>
 *         </a>
 *         <div class="cards-card-body">
 *           <h2 class="card-heading">…</h2>
 *           <p class="card-description">…</p>
 *           <a class="card-cta button" href="…">
 *             <i class="fa fa-angle-right" aria-hidden="true"></i>
 *             <span>CTA text</span>
 *           </a>
 *         </div>
 *       </li>
 *       …
 *     </ul>
 *   </div>
 */

import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const rows = [...block.children];

  const ul = document.createElement('ul');
  ul.className = 'cards-wrapper';

  rows.forEach((row) => {
    const cells = [...row.children];
    const li = document.createElement('li');
    li.className = 'card';
    moveInstrumentation(row, li);

    // ── Image cell (first cell) ────────────────────────────────────────────
    const imageCell = cells[0];
    if (imageCell) {
      // Prefer a picture or img already in the cell; fall back to first link
      const picture = imageCell.querySelector('picture');
      const existingImg = imageCell.querySelector('img');
      const imageLink = imageCell.querySelector('a');

      const figure = document.createElement('figure');
      figure.className = 'card-image';

      if (picture) {
        figure.appendChild(picture);
      } else if (existingImg) {
        existingImg.removeAttribute('width');
        existingImg.removeAttribute('height');
        figure.appendChild(existingImg);
      }

      // Determine href for the image link
      let imageLinkHref = imageLink ? imageLink.getAttribute('href') : '#';

      const anchor = document.createElement('a');
      anchor.className = 'card-image-link';
      anchor.href = imageLinkHref || '#';
      anchor.appendChild(figure);
      moveInstrumentation(imageCell, anchor);

      li.appendChild(anchor);
    }

    // ── Content cell (second cell) ─────────────────────────────────────────
    const contentCell = cells[1] || cells[0];
    if (contentCell) {
      const body = document.createElement('div');
      body.className = 'cards-card-body';
      moveInstrumentation(contentCell, body);

      // Heading: first h1–h3 or first strong text
      const sourceHeading = contentCell.querySelector('h1, h2, h3, h4');
      const h2 = document.createElement('h2');
      h2.className = 'card-heading';
      if (sourceHeading) {
        h2.textContent = sourceHeading.textContent.trim();
      }
      body.appendChild(h2);

      // Body text: first <p> that is not a link paragraph
      const paragraphs = [...contentCell.querySelectorAll('p')];
      const bodyParagraph = paragraphs.find((p) => !p.querySelector('a') || p.textContent.trim().length > 0);
      const p = document.createElement('p');
      p.className = 'card-description';
      if (bodyParagraph) {
        p.textContent = bodyParagraph.textContent.trim();
      }
      body.appendChild(p);

      // CTA link: last <a> in the content cell, or any strong link
      const allLinks = [...contentCell.querySelectorAll('a')];
      const ctaSource = allLinks[allLinks.length - 1];

      const cta = document.createElement('a');
      cta.className = 'card-cta button';
      if (ctaSource) {
        cta.href = ctaSource.getAttribute('href') || '#';
        // FontAwesome angle-right icon
        const icon = document.createElement('i');
        icon.className = 'fa fa-angle-right';
        icon.setAttribute('aria-hidden', 'true');
        cta.appendChild(icon);
        const label = document.createElement('span');
        label.textContent = ctaSource.textContent.trim();
        cta.appendChild(label);
      }
      body.appendChild(cta);

      li.appendChild(body);
    }

    ul.appendChild(li);
  });

  block.replaceChildren(ul);
}
