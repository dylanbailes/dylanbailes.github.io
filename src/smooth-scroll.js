/**
 * smooth-scroll.js — Smooth scrolling for in-page anchor links, offset for the
 * fixed header, with URL hash updates.
 */

import { closeMobileNav } from './nav.js';

function targetForHash(hash) {
  if (!hash || hash === '#') return null;
  try {
    return document.getElementById(decodeURIComponent(hash.slice(1)));
  } catch {
    return null;
  }
}

export function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey
        || e.shiftKey || e.altKey || anchor.hasAttribute('download')) return;
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return; // placeholder links (e.g. logo)

      const target = targetForHash(targetId);
      if (!target) return;

      e.preventDefault();

      closeMobileNav();
      target.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
        block: 'start',
      });
      // Move keyboard focus along with the skip link and section links.
      if (!target.hasAttribute('tabindex')) {
        target.setAttribute('tabindex', '-1');
        target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
      }
      target.focus({ preventScroll: true });

      // Update URL without jumping
      if (location.hash !== targetId) history.pushState(null, '', targetId);
    });
  });
  const restoreHash = () => targetForHash(location.hash)?.scrollIntoView({ behavior: 'instant', block: 'start' });
  window.addEventListener('popstate', restoreHash);
  if (location.hash) requestAnimationFrame(restoreHash);
}
