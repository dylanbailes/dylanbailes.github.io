/**
 * Minimal JavaScript for:
 * - Mobile navigation toggle
 * - Tab switching with keyboard support
 * - Smooth scroll to sections
 * - Dynamic year in footer
 */

(function() {
  'use strict';

  // DOM Elements
  const navToggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.nav');
  const tabs = document.querySelectorAll('[role="tab"]');
  const panels = document.querySelectorAll('[role="tabpanel"]');
  const yearSpan = document.getElementById('current-year');

  // Set current year in footer
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear();
  }

  // Mobile Navigation Toggle
  if (navToggle && nav) {
    navToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen);
    });

    // Close nav when clicking a link
    nav.querySelectorAll('.nav__link').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Tab Switching Functionality
  function switchTab(newTab, newPanel) {
    // Deactivate all tabs
    tabs.forEach(tab => {
      tab.classList.remove('tab-btn--active');
      tab.setAttribute('aria-selected', 'false');
      tab.setAttribute('tabindex', '-1');
    });

    // Hide all panels
    panels.forEach(panel => {
      panel.classList.remove('tab-panel--active');
      panel.hidden = true;
    });

    // Activate selected tab
    newTab.classList.add('tab-btn--active');
    newTab.setAttribute('aria-selected', 'true');
    newTab.setAttribute('tabindex', '0');

    // Show selected panel
    newPanel.classList.add('tab-panel--active');
    newPanel.hidden = false;
  }

  // Add click handlers to tabs
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const panelId = tab.getAttribute('aria-controls');
      const panel = document.getElementById(panelId);
      if (panel) switchTab(tab, panel);
    });

    // Keyboard navigation
    tab.addEventListener('keydown', (e) => {
      const tabArray = Array.from(tabs);
      const currentIndex = tabArray.indexOf(tab);
      let newIndex;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          newIndex = currentIndex === 0 ? tabArray.length - 1 : currentIndex - 1;
          break;
        case 'ArrowRight':
          e.preventDefault();
          newIndex = currentIndex === tabArray.length - 1 ? 0 : currentIndex + 1;
          break;
        case 'Home':
          e.preventDefault();
          newIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          newIndex = tabArray.length - 1;
          break;
        default:
          return;
      }

      const newTab = tabArray[newIndex];
      const panelId = newTab.getAttribute('aria-controls');
      const panel = document.getElementById(panelId);
      if (panel) {
        switchTab(newTab, panel);
        newTab.focus();
      }
    });
  });

  // Smooth scroll for anchor links (fallback for older browsers)
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const headerOffset = 64;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
})();
