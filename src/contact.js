/**
 * contact.js — Contact section: indexed heading, CTA buttons and labeled
 * mono social links, all from config. Also fills the footer year/name.
 */

import { site } from './config.js';
import { escapeHtml } from './utils.js';
import { icon } from './icons.js';

const MOUNT = '[data-mount="contact"]';

function renderContact(container) {
  const { contact } = site;

  const actions = contact.links
    .map((link, index) => {
      // mailto buttons auto-fill from the configured address
      const href = link.mailto ? `mailto:${contact.email}` : link.href;
      return `
        <a href="${escapeHtml(href)}" class="btn btn--${link.primary ? 'primary' : 'ghost'} btn--large">
          <span class="btn__code">[0${index + 1}]</span>
          <span>${escapeHtml(link.label)}</span>
          ${icon(link.mailto ? 'mail' : 'arrowUpRight')}
        </a>`;
    })
    .join('');

  const socials = contact.socials
    .map(
      (social) => `
        <a href="${escapeHtml(social.url)}" class="social-link" aria-label="${escapeHtml(social.name)}">
          ${icon(social.icon)}
          <span class="social-link__name">${escapeHtml(social.name)}</span>
        </a>`
    )
    .join('');

  container.innerHTML = `
    <div class="section-head">
      <span class="section-head__index">05</span>
      <h2 id="contact-title" class="section-head__title">Contact</h2>
      <span class="section-head__rule"></span>
      <span class="section-head__tag">CON.CHANNEL</span>
      <span class="section-head__ghost" aria-hidden="true">05</span>
    </div>
    <p class="contact__text">${escapeHtml(contact.blurb)}</p>
    <div class="contact__actions">${actions}</div>
    <div class="contact__social">${socials}</div>
  `;
}

function renderFooter() {
  const yearSpan = document.getElementById('current-year');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  const nameSpan = document.querySelector('[data-footer-name]');
  if (nameSpan) nameSpan.textContent = site.profile.name.toUpperCase();
}

export function initContact() {
  const mount = document.querySelector(MOUNT);
  if (mount) renderContact(mount.querySelector('.container'));

  renderFooter();
}
