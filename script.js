/**
 * Engineering Portfolio - Main JavaScript
 * Features: Theme toggle, mobile nav, project filtering, animations
 * Uses ES Modules for modularity
 */

// ===========================================================================
// DOM Utility Functions
// ===========================================================================

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));

// ===========================================================================
// Theme Management with localStorage persistence
// ===========================================================================

const ThemeManager = {
  STORAGE_KEY: 'portfolio-theme',
  
  init() {
    // Check for saved theme or system preference
    const savedTheme = localStorage.getItem(this.STORAGE_KEY);
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else if (systemPrefersDark) {
      this.setTheme('dark');
    }
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(this.STORAGE_KEY)) {
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });
    
    this.bindEvents();
  },
  
  bindEvents() {
    const toggle = $('.theme-toggle');
    if (toggle) {
      toggle.addEventListener('click', () => this.toggle());
    }
  },
  
  getTheme() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  },
  
  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.STORAGE_KEY, theme);
  },
  
  toggle() {
    const current = this.getTheme();
    this.setTheme(current === 'light' ? 'dark' : 'light');
  }
};

// ===========================================================================
// Mobile Navigation
// ===========================================================================

const MobileNav = {
  init() {
    this.toggle = $('.nav-toggle');
    this.nav = $('.nav');
    
    if (!this.toggle || !this.nav) return;
    
    this.bindEvents();
  },
  
  bindEvents() {
    this.toggle.addEventListener('click', () => this.toggleMenu());
    
    // Close nav when clicking a link
    $$('.nav__link').forEach(link => {
      link.addEventListener('click', () => this.closeMenu());
    });
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.closeMenu();
        this.toggle.focus();
      }
    });
    
    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (this.isOpen() && 
          !this.nav.contains(e.target) && 
          !this.toggle.contains(e.target)) {
        this.closeMenu();
      }
    });
  },
  
  isOpen() {
    return this.nav.classList.contains('is-open');
  },
  
  toggleMenu() {
    const isOpen = this.isOpen();
    this.nav.classList.toggle('is-open');
    this.toggle.setAttribute('aria-expanded', !isOpen);
    document.body.style.overflow = !isOpen ? 'hidden' : '';
  },
  
  closeMenu() {
    this.nav.classList.remove('is-open');
    this.toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
};

// ===========================================================================
// Header Scroll Effects
// ===========================================================================

const HeaderScroll = {
  init() {
    this.header = $('.header');
    if (!this.header) return;
    
    this.lastScroll = 0;
    this.bindEvents();
    this.checkScroll();
  },
  
  bindEvents() {
    window.addEventListener('scroll', () => this.checkScroll(), { passive: true });
  },
  
  checkScroll() {
    const scrolled = window.scrollY > 10;
    this.header.classList.toggle('scrolled', scrolled);
    this.lastScroll = window.scrollY;
  }
};

// ===========================================================================
// Hero Section - Typing Effect for Role
// ===========================================================================

const HeroTyping = {
  init() {
    this.roleElement = $('.hero__role');
    if (!this.roleElement) return;
    
    this.roles = JSON.parse(this.roleElement.dataset.roles || '[]');
    if (this.roles.length === 0) return;
    
    this.currentIndex = 0;
    this.isDeleting = false;
    this.typingSpeed = 100;
    this.deletingSpeed = 50;
    this.pauseDuration = 2000;
    
    this.type();
  },
  
  type() {
    const currentRole = this.roles[this.currentIndex];
    const displayText = this.isDeleting 
      ? currentRole.substring(0, this.charIndex - 1)
      : currentRole.substring(0, this.charIndex + 1);
    
    this.charIndex = this.isDeleting ? this.charIndex - 1 : this.charIndex + 1;
    this.roleElement.textContent = displayText;
    
    let nextSpeed = this.isDeleting ? this.deletingSpeed : this.typingSpeed;
    
    if (!this.isDeleting && this.charIndex === currentRole.length) {
      nextSpeed = this.pauseDuration;
      this.isDeleting = true;
    } else if (this.isDeleting && this.charIndex === 0) {
      this.isDeleting = false;
      this.currentIndex = (this.currentIndex + 1) % this.roles.length;
      nextSpeed = 500;
    }
    
    setTimeout(() => this.type(), nextSpeed);
  }
};

// ===========================================================================
// Counter Animation for Stats
// ===========================================================================

const CounterAnimation = {
  init() {
    this.counters = $$('.stat-item__value');
    if (this.counters.length === 0) return;
    
    this.initObserver();
  },
  
  initObserver() {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5
    };
    
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateCounter(entry.target);
          this.observer.unobserve(entry.target);
        }
      });
    }, options);
    
    this.counters.forEach(counter => this.observer.observe(counter));
  },
  
  animateCounter(element) {
    const target = parseInt(element.dataset.count, 10);
    const duration = 2000;
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
};

// ===========================================================================
// Project Filtering System
// ===========================================================================

const ProjectFilter = {
  init() {
    this.filterButtons = $$('.filter-btn');
    this.projectCards = $$('.project-card');
    
    if (this.filterButtons.length === 0) return;
    
    this.bindEvents();
  },
  
  bindEvents() {
    this.filterButtons.forEach(btn => {
      btn.addEventListener('click', () => this.filter(btn.dataset.filter));
      
      // Keyboard navigation
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.filter(btn.dataset.filter);
        }
      });
    });
  },
  
  filter(category) {
    // Update active button state
    this.filterButtons.forEach(btn => {
      const isActive = btn.dataset.filter === category;
      btn.classList.toggle('filter-btn--active', isActive);
      btn.setAttribute('aria-selected', isActive);
    });
    
    // Filter projects with animation
    this.projectCards.forEach((card, index) => {
      const matches = category === 'all' || card.dataset.category === category;
      
      if (matches) {
        card.classList.remove('hidden');
        card.style.animation = `fadeInUp 0.4s ease forwards ${index * 0.05}s`;
      } else {
        card.classList.add('hidden');
        card.style.animation = '';
      }
    });
  }
};

// ===========================================================================
// PCB Viewer Controls (Placeholder functionality)
// ===========================================================================

const PCBViewer = {
  init() {
    this.controlBtns = $$('.pcb-control-btn');
    if (this.controlBtns.length === 0) return;
    
    this.bindEvents();
  },
  
  bindEvents() {
    this.controlBtns.forEach(btn => {
      btn.addEventListener('click', () => this.switchView(btn.dataset.view));
    });
  },
  
  switchView(viewType) {
    // Update active button
    this.controlBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewType);
    });
    
    // TODO: Wire actual PCB viewer integration here
    // Example integration points:
    // - 2D View: Render SVG/PNG of PCB layout
    // - 3D View: Use Three.js or similar for 3D model
    // - Layers: Toggle visibility of copper/silkscreen layers
    
    console.log(`PCB Viewer: Switched to ${viewType} view`);
    
    // Dispatch custom event for external listeners
    window.dispatchEvent(new CustomEvent('pcb-view-change', { 
      detail: { viewType } 
    }));
  }
};

// ===========================================================================
// Smooth Scroll for Anchor Links
// ===========================================================================

const SmoothScroll = {
  init() {
    $$('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => this.handleScroll(e, anchor));
    });
  },
  
  handleScroll(e, anchor) {
    const targetId = anchor.getAttribute('href');
    if (targetId === '#') return;
    
    const target = $(targetId);
    if (!target) return;
    
    e.preventDefault();
    
    const headerOffset = 72;
    const elementPosition = target.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
    
    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
    
    // Close mobile nav if open
    if ($('.nav.is-open')) {
      MobileNav.closeMenu();
    }
    
    // Update URL without jumping
    history.pushState(null, '', targetId);
  }
};

// ===========================================================================
// Footer Year Update
// ===========================================================================

const FooterYear = {
  init() {
    const yearSpan = $('#current-year');
    if (yearSpan) {
      yearSpan.textContent = new Date().getFullYear();
    }
  }
};

// ===========================================================================
// Skill Bar Animation (Intersection Observer)
// ===========================================================================

const SkillBarAnimation = {
  init() {
    this.skillBars = $$('.skill-bar__fill');
    if (this.skillBars.length === 0) return;
    
    // Only animate if browser doesn't support scroll-driven animations
    if (CSS.supports('animation-timeline', 'view()')) return;
    
    this.initObserver();
  },
  
  initObserver() {
    const options = { threshold: 0.5 };
    
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bar = entry.target;
          const level = bar.style.getPropertyValue('--skill-level');
          bar.style.width = '0';
          
          // Trigger animation
          requestAnimationFrame(() => {
            bar.style.transition = 'width 1s ease-out';
            bar.style.width = level;
          });
          
          this.observer.unobserve(bar);
        }
      });
    }, options);
    
    this.skillBars.forEach(bar => this.observer.observe(bar));
  }
};

// ===========================================================================
// Initialize All Modules
// ===========================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Core functionality
  ThemeManager.init();
  MobileNav.init();
  HeaderScroll.init();
  
  // Animations
  HeroTyping.init();
  CounterAnimation.init();
  SkillBarAnimation.init();
  
  // Interactive features
  ProjectFilter.init();
  PCBViewer.init();
  SmoothScroll.init();
  FooterYear.init();
  
  // Log ready state
  console.log('🚀 Engineering Portfolio initialized');
});

// Export modules for potential external use
export {
  ThemeManager,
  MobileNav,
  HeaderScroll,
  HeroTyping,
  CounterAnimation,
  ProjectFilter,
  PCBViewer,
  SmoothScroll,
  FooterYear,
  SkillBarAnimation
};
