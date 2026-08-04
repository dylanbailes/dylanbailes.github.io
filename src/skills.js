/**
 * skills.js — Skills section: indexed heading, category cards with SVG icon
 * chips, mono % readouts and thin red progress bars.
 *
 * Bars use CSS scroll-driven animations when supported, otherwise an
 * IntersectionObserver-triggered transition.
 */

import { site } from './config.js';
import { escapeHtml } from './utils.js';
import { icon } from './icons.js';

const MOUNT = '[data-mount="skills"]';

function renderSkills(container) {
  const categories = site.skills
    .map((cat) => {
      const code = cat.category.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
      return `
        <div class="skill-category">
          <div class="skill-category__header">
            <span class="skill-category__icon">${icon(cat.icon)}</span>
            <div>
              <h3>${escapeHtml(cat.category)}</h3>
              <span class="skill-category__code">SKL.${code}</span>
            </div>
          </div>
          <ul class="skill-list">
            ${cat.items
              .map(
                (item) => `
                  <li class="skill-item">
                    <div class="skill-item__row">
                      <span class="skill-item__name">${escapeHtml(item.name)}</span>
                      <span class="skill-item__level">${item.level}%</span>
                    </div>
                    <div class="skill-bar">
                      <div class="skill-bar__fill" style="--skill-level: ${item.level}%"></div>
                    </div>
                  </li>`
              )
              .join('')}
          </ul>
        </div>`;
    })
    .join('');

  container.innerHTML = `
    <div class="section-head">
      <span class="section-head__index">02</span>
      <h2 id="skills-title" class="section-head__title">Skills</h2>
      <span class="section-head__rule"></span>
      <span class="section-head__tag">SKL.MATRIX</span>
      <span class="section-head__ghost" aria-hidden="true">02</span>
    </div>
    <div class="skills__grid">${categories}</div>
  `;
}

function initBarFallback() {
  const bars = document.querySelectorAll('.skill-bar__fill');

  // CSS handles the animation when scroll-driven animations are supported
  if (bars.length === 0 || CSS.supports('animation-timeline', 'view()')) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          const level = bar.style.getPropertyValue('--skill-level');
          bar.style.width = '0';

          requestAnimationFrame(() => {
            bar.style.transition = 'width 1s ease-out';
            bar.style.width = level;
          });

          observer.unobserve(bar);
        }
      });
    },
    { threshold: 0.5 }
  );

  bars.forEach((bar) => observer.observe(bar));
}

export function initSkills() {
  const mount = document.querySelector(MOUNT);
  if (!mount) return;

  renderSkills(mount.querySelector('.container'));
  initBarFallback();
}
