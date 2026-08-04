/**
 * about.js — About section: indexed blueprint heading, framed photo,
 * mono stat readouts with animated counters.
 */

import { site } from './config.js';
import { escapeHtml } from './utils.js';

const MOUNT = '[data-mount="about"]';

function renderAbout(container) {
  const { profile } = site;

  const image = profile.photo
    ? `<div class="about__frame"><img class="about__image-photo" src="${escapeHtml(profile.photo)}" alt="Portrait of ${escapeHtml(profile.name)}" loading="lazy"></div>`
    : `<div class="about__frame">
         <div class="about__image-placeholder">
           <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
             <circle cx="100" cy="100" r="80" fill="var(--color-paper)"/>
             <circle cx="100" cy="78" r="30" fill="var(--color-accent)"/>
             <ellipse cx="100" cy="158" rx="48" ry="38" fill="var(--color-accent)"/>
           </svg>
           <span>PORTRAIT — PENDING</span>
         </div>
       </div>`;

  const stats = profile.stats
    .map(
      (stat) => `
        <div class="stat-item">
          <span class="stat-item__value" data-count="${stat.value}">0</span>
          <span class="stat-item__label">${escapeHtml(stat.label)}</span>
        </div>`
    )
    .join('');

  container.innerHTML = `
    <div class="section-head">
      <span class="section-head__index">01</span>
      <h2 id="about-title" class="section-head__title">About</h2>
      <span class="section-head__rule"></span>
      <span class="section-head__tag">ABT.DOC</span>
      <span class="section-head__ghost" aria-hidden="true">01</span>
    </div>
    <div class="about__grid">
      <div class="about__image-wrapper">${image}</div>
      <div class="about__text-content">
        ${profile.about.map((p) => `<p>${escapeHtml(p)}</p>`).join('')}
        <div class="about__stats">${stats}</div>
      </div>
    </div>
  `;
}

function animateCounter(element) {
  const target = parseInt(element.dataset.count, 10) || 0;
  const duration = 1600;
  const step = target / (duration / 16);
  let current = 0;

  const update = () => {
    current += step;
    if (current < target) {
      element.textContent = Math.floor(current);
      requestAnimationFrame(update);
    } else {
      element.textContent = target;
    }
  };

  update();
}

function initCounters() {
  const counters = document.querySelectorAll('.stat-item__value');
  if (counters.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach((counter) => observer.observe(counter));
}

export function initAbout() {
  const mount = document.querySelector(MOUNT);
  if (!mount) return;

  renderAbout(mount.querySelector('.container'));
  initCounters();
}
