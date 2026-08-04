/**
 * smooth-scroll.js — Smooth scrolling for in-page anchor links, offset for the
 * fixed header, with URL hash updates.
 */

import { closeMobileNav } from './nav.js';

const HEADER_OFFSET = 72; // matches --header-height in styles.css

export function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return; // placeholder links (e.g. logo)

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const elementPosition = target.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - HEADER_OFFSET;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });

      // Close mobile nav if open
      closeMobileNav();

      // Update URL without jumping
      history.pushState(null, '', targetId);
    });
  });
}
