/**
 * main.js — Entry point.
 *
 * Imports the stylesheet, syncs the document <head> from src/config.js, and
 * boots every feature module. Content sections (hero, about, skills, projects,
 * contact) are rendered into their [data-mount] containers.
 */

import './styles.css';
import { site } from './config.js';

import { initTheme } from './theme.js';
import { initNav } from './nav.js';
import { initHero } from './hero.js';
import { initAbout } from './about.js';
import { initExperience } from './experience.js';
import { initSkills } from './skills.js';
import { initProjects } from './projects.js';
import { initContact } from './contact.js';
import { initSmoothScroll } from './smooth-scroll.js';

/** Syncs <title>, description and Open Graph tags from the config. */
function applyMeta(meta) {
  const set = (selector, attr, value) => {
    const el = document.querySelector(selector);
    if (el && value) el.setAttribute(attr, value);
  };

  document.title = meta.title;
  set('meta[name="description"]', 'content', meta.description);
  set('meta[name="author"]', 'content', meta.author);
  set('meta[name="theme-color"]', 'content', meta.themeColor);
  set('meta[property="og:title"]', 'content', meta.title);
  set('meta[property="og:description"]', 'content', meta.description);
  set('meta[property="og:url"]', 'content', meta.url);
}

function boot() {
  applyMeta(site.meta);

  initTheme();
  initNav();
  initHero();
  initAbout();
  initExperience();
  initSkills();
  initProjects();
  initContact();
  initSmoothScroll();

  console.log('[SYS] Engineering Portfolio initialized');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
