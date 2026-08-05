/**
 * hero.js — Nothing-inspired technical hero: blueprint grid, giant display
 * name, typewriter role with a block caret, indexed mono buttons, and a
 * marquee ticker of disciplines.
 *
 * Layout note: the background layer and the bottom marquee are rendered as
 * direct children of the <section> (not the content container) so their
 * absolute positioning resolves against the full hero.
 */

import { site } from './config.js';
import { escapeHtml } from './utils.js';
import { icon } from './icons.js';

const MOUNT = '[data-mount="hero"]';

/**
 * Renders the background/annotation layer into the section, the content into
 * the container, and the scroll indicator + marquee at the section bottom.
 */
function renderHero(mount, contentEl) {
  const { profile, cvUrl } = site;
  const rolesAttr = escapeHtml(JSON.stringify(profile.roles));

  // --- Background layer + annotations (anchored to the section) ---
  mount.insertAdjacentHTML('afterbegin', `
    <div class="hero__grid" aria-hidden="true"></div>
    <span class="hero__ghost hero__ghost--tl" aria-hidden="true">SYS.01</span>
    <span class="hero__ghost hero__ghost--tr" aria-hidden="true">REV.A</span>
    <span class="hero__ghost hero__ghost--bl" aria-hidden="true">41.9028°N</span>
    <span class="hero__ghost hero__ghost--br" aria-hidden="true">12.4964°E</span>
    <span class="hero__cross hero__cross--a" aria-hidden="true"></span>
    <span class="hero__cross hero__cross--b" aria-hidden="true"></span>
    <span class="hero__dot hero__dot--1" aria-hidden="true"></span>
    <span class="hero__dot hero__dot--2" aria-hidden="true"></span>
  `);

  // --- Content ---
  const actions = [
    { href: '#projects', icon: 'arrowRight', label: 'View Projects', cls: 'btn--primary', code: '01' },
    { href: '#contact', icon: 'mail', label: 'Get In Touch', cls: 'btn--ghost', code: '02' },
  ];
  if (cvUrl) {
    actions.push({ href: cvUrl, icon: 'download', label: 'Download CV', cls: 'btn--ghost', code: '03', download: true });
  }

  const actionButtons = actions
    .map(
      (a) => `
        <a href="${escapeHtml(a.href)}" class="btn ${a.cls}"${a.download ? ' download' : ''}>
          <span class="btn__code">[${a.code}]</span>
          <span>${escapeHtml(a.label)}</span>
          ${icon(a.icon)}
        </a>`
    )
    .join('');

  contentEl.innerHTML = `
    <p class="hero__meta">
      <span class="hero__meta-code">// ENGINEERING PORTFOLIO</span>
      <span class="hero__meta-tags">MECH · PCB · FW · SIM</span>
    </p>

    <h1 id="hero-title" class="hero__title">
      <span class="hero__name">${escapeHtml(profile.name)}</span><span class="hero__period">.</span>
    </h1>

    <p class="hero__roleline">
      <span class="hero__roleline__label">I'M A</span>
      <span class="hero__role" data-roles='${rolesAttr}'>${escapeHtml(profile.roles[0])}</span>
    </p>

    <p class="hero__subtitle">${escapeHtml(profile.subtitle)}</p>

    <div class="hero__actions">${actionButtons}</div>
  `;

  // --- Scroll indicator + marquee (anchored to the section bottom) ---
  const tickerItems = [...profile.roles, ...site.skills.map((s) => s.category)];
  const tickerHalf = tickerItems
    .map((item) => `<span class="marquee__item">${escapeHtml(item)}</span><span class="marquee__dot"></span>`)
    .join('');
  const marqueeTrack = `${tickerHalf}${tickerHalf}`;

  mount.insertAdjacentHTML('beforeend', `
    <div class="hero__scroll" aria-hidden="true">
      <span class="hero__scroll__text">SCROLL</span>
      <span class="hero__scroll__line"></span>
    </div>

    <div class="marquee" aria-hidden="true">
      <div class="marquee__track">${marqueeTrack}</div>
    </div>
  `);
}

/**
 * Typewriter effect for the hero role, with a blinking block caret.
 * Cycles through profile.roles — types, pauses, deletes, next.
 */
function initTyping() {
  const roleElement = document.querySelector('.hero__role');
  if (!roleElement) return;

  const roles = JSON.parse(roleElement.dataset.roles || '[]');
  if (roles.length === 0) return;

  // Respect reduced-motion: show the first role, no animation
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    roleElement.textContent = roles[0];
    return;
  }

  let charIndex = 0;
  let currentIndex = 0;
  let isDeleting = false;
  const typingSpeed = 90;
  const deletingSpeed = 45;
  const pauseDuration = 1800;

  const type = () => {
    const currentRole = roles[currentIndex];

    charIndex = isDeleting ? charIndex - 1 : charIndex + 1;
    roleElement.textContent = currentRole.substring(0, charIndex);

    let nextSpeed = isDeleting ? deletingSpeed : typingSpeed;

    if (!isDeleting && charIndex === currentRole.length) {
      nextSpeed = pauseDuration;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      currentIndex = (currentIndex + 1) % roles.length;
      nextSpeed = 500;
    }

    setTimeout(type, nextSpeed);
  };

  type();
}

export function initHero() {
  const mount = document.querySelector(MOUNT);
  if (!mount) return;

  renderHero(mount, mount.querySelector('.container'));
  initTyping();
}
