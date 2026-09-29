/**
 * nav.js — Mobile navigation, header scroll effect, logo text.
 */

import { site } from './config.js';

let nav = null;
let toggle = null;
let previousOverflow = '';
let inertElements = [];
const mobileLayout = () => window.matchMedia('(max-width: 1024px)').matches;

function isOpen() {
  return nav?.classList.contains('is-open');
}

export function closeMobileNav() {
  if (!nav || !isOpen()) return;
  nav.classList.remove('is-open');
  toggle.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = previousOverflow;
  inertElements.forEach((element) => { element.inert = false; });
  inertElements = [];
}

function toggleMenu() {
  if (isOpen()) {
    closeMobileNav();
    return;
  }
  if (!mobileLayout()) return;
  previousOverflow = document.body.style.overflow;
  nav.classList.add('is-open');
  toggle.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
  inertElements = [...document.querySelectorAll('main, footer, .header .logo, .skip-link')]
    .filter((element) => !element.inert);
  inertElements.forEach((element) => { element.inert = true; });
  nav.querySelector('.nav__link')?.focus();
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
    if (e.key === 'Tab' && isOpen()) {
      const controls = [document.querySelector('.theme-toggle'), toggle, ...nav.querySelectorAll('a[href]')]
        .filter(Boolean);
      const index = controls.indexOf(document.activeElement);
      e.preventDefault();
      controls[(index + (e.shiftKey ? -1 : 1) + controls.length) % controls.length].focus();
    }
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (isOpen() && !nav.contains(e.target) && !toggle.contains(e.target)) {
      closeMobileNav();
    }
  });
  window.matchMedia('(max-width: 1024px)').addEventListener('change', (event) => {
    if (!event.matches && isOpen()) {
      closeMobileNav();
      if (document.activeElement === toggle) nav.querySelector('.nav__link')?.focus();
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
