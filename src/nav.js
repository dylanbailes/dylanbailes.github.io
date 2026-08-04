/**
 * nav.js — Mobile navigation, header scroll effect, logo text.
 */

import { site } from './config.js';

let nav = null;
let toggle = null;

function isOpen() {
  return nav.classList.contains('is-open');
}

export function closeMobileNav() {
  if (!nav) return;
  nav.classList.remove('is-open');
  toggle.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

function toggleMenu() {
  const willOpen = !isOpen();
  nav.classList.toggle('is-open');
  toggle.setAttribute('aria-expanded', willOpen);
  document.body.style.overflow = willOpen ? 'hidden' : '';
}

function bindNav() {
  toggle.addEventListener('click', toggleMenu);

  // Close nav when clicking a link inside it
  nav.querySelectorAll('.nav__link').forEach((link) => {
    link.addEventListener('click', closeMobileNav);
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) {
      closeMobileNav();
      toggle.focus();
    }
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (isOpen() && !nav.contains(e.target) && !toggle.contains(e.target)) {
      closeMobileNav();
    }
  });
}

function bindHeaderScroll() {
  const header = document.querySelector('.header');
  if (!header) return;

  const checkScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
  };

  window.addEventListener('scroll', checkScroll, { passive: true });
  checkScroll();
}

function fillLogo() {
  const logoText = document.querySelector('[data-logo-text]');
  const logoTagline = document.querySelector('[data-logo-tagline]');
  if (logoText) logoText.textContent = site.profile.logoText;
  if (logoTagline) logoTagline.textContent = site.profile.logoTagline;
}

export function initNav() {
  nav = document.querySelector('.nav');
  toggle = document.querySelector('.nav-toggle');

  if (nav && toggle) bindNav();
  bindHeaderScroll();
  fillLogo();
}
