/**
 * M0NARQ Animation System v5.0
 * World-class performance with cohesive motion design
 * 
 * Features:
 * - Unified motion language
 * - Progressive enhancement
 * - Page transition system
 * - Optimized scroll performance
 * - Single source of truth for timing
 */

// ═══════════════════════════════════════════════════════════════
// MOTION DESIGN SYSTEM
// ═══════════════════════════════════════════════════════════════
const MotionConfig = {
  // Consistent easing curves
  easings: {
    default: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',  // Smooth out
    enter: 'cubic-bezier(0.39, 0.575, 0.565, 1)',     // Ease out sine
    exit: 'cubic-bezier(0.47, 0, 0.745, 0.715)',      // Ease in sine
    emphasis: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Back ease
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)'             // Material design
  },
  
  // Consistent durations
  durations: {
    instant: 0.1,
    fast: 0.25,
    normal: 0.4,
    slow: 0.6,
    slower: 0.8,
    slowest: 1.2
  },
  
  // Stagger timings
  staggers: {
    fast: 0.03,
    normal: 0.06,
    slow: 0.1
  },
  
  // Breakpoints for responsive animations
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1440
  }
};

// ═══════════════════════════════════════════════════════════════
// PERFORMANCE OPTIMIZER
// ═══════════════════════════════════════════════════════════════
class PerformanceManager {
  constructor() {
    this.observers = new Map();
    this.rafCallbacks = new Set();
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  
  // Intersection Observer with caching
  observe(element, callback, options = {}) {
    const key = JSON.stringify(options);
    
    if (!this.observers.has(key)) {
      this.observers.set(key, new IntersectionObserver(callback, {
        rootMargin: '50px',
        threshold: 0.1,
        ...options
      }));
    }
    
    this.observers.get(key).observe(element);
  }
  
  // Debounced function
  debounce(func, wait = 100) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
  
  // Throttled RAF
  throttleRAF(callback) {
    if (!this.rafCallbacks.has(callback)) {
      this.rafCallbacks.add(callback);
      requestAnimationFrame(() => {
        callback();
        this.rafCallbacks.delete(callback);
      });
    }
  }
}

// ═══════════════════════════════════════════════════════════════
// MAIN ANIMATION CLASS
// ═══════════════════════════════════════════════════════════════
class M0NARQAnimations {
  constructor() {
    this.performance = new PerformanceManager();
    this.state = {
      isInitialized: false,
      isTransitioning: false,
      currentPage: null
    };
    
    // Initialize immediately
    this.init();
  }
  
  async init() {
    // Critical path first
    this.removeLoader();
    this.validateDependencies();
    
    // Core systems
    this.initGSAP();
    this.initScrollSystem();
    
    // UI Components
    this.initNavigation();
    this.initPageTransitions();
    
    // Animations (progressive)
    await this.initCriticalAnimations();
    this.initDeferredAnimations();
    
    this.state.isInitialized = true;
    console.log('✨ M0NARQ Animations v5.0 initialized');
  }
  
  // ═══════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════
  
  removeLoader() {
    // Instant removal with no delay
    const loaders = document.querySelectorAll('.loader, [data-loader]');
    loaders.forEach(loader => loader.remove());
    
    // Ensure visibility
    document.documentElement.classList.add('loaded');
    document.body.style.cssText = 'opacity: 1; visibility: visible;';
  }
  
  validateDependencies() {
    const required = ['gsap', 'ScrollTrigger', 'Lenis'];
    const missing = required.filter(dep => !window[dep]);
    
    if (missing.length) {
      throw new Error(`Missing dependencies: ${missing.join(', ')}`);
    }
  }
  
  initGSAP() {
    gsap.registerPlugin(ScrollTrigger);
    
    // Global defaults for consistency
    gsap.defaults({
      ease: MotionConfig.easings.default,
      duration: MotionConfig.durations.normal,
      overwrite: 'auto'
    });
    
    // Performance settings
    gsap.config({
      autoSleep: 60,
      force3D: true,
      nullTargetWarn: false
    });
    
    // Ticker optimization
    gsap.ticker.lagSmoothing(1000, 16);
    gsap.ticker.fps(60);
  }
  
  initScrollSystem() {
    // Single scroll system - Lenis only
    this.lenis = new Lenis({
      duration: MotionConfig.durations.slowest,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smooth: !this.performance.isReducedMotion,
      smoothTouch: false,
      wheelMultiplier: 1,
      touchMultiplier: 2
    });
    
    // Single RAF loop
    const raf = (time) => {
      this.lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
    
    // Sync with ScrollTrigger
    this.lenis.on('scroll', () => {
      ScrollTrigger.update();
    });
    
    // Handle anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
          this.scrollTo(target);
        }
      });
    });
  }
  
  scrollTo(target, options = {}) {
    const defaults = {
      offset: 0,
      duration: MotionConfig.durations.slowest,
      easing: (t) => 1 - Math.pow(1 - t, 3)
    };
    
    this.lenis.scrollTo(target, { ...defaults, ...options });
  }
  
  // ═══════════════════════════════════════════════════════════════
  // NAVIGATION
  // ═══════════════════════════════════════════════════════════════
  
  initNavigation() {
    const nav = {
      button: document.querySelector('.menu-button'),
      overlay: document.querySelector('.menu-overlay'),
      items: document.querySelectorAll('.menu-item'),
      isOpen: false
    };
    
    if (!nav.button || !nav.overlay) return;
    
    // Menu toggle
    nav.button.addEventListener('click', () => {
      nav.isOpen = !nav.isOpen;
      this.toggleMenu(nav);
    });
    
    // Close on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.isOpen) {
        nav.isOpen = false;
        this.toggleMenu(nav);
      }
    });
    
    this.nav = nav;
  }
  
  toggleMenu(nav) {
    const tl = gsap.timeline({
      defaults: { ease: MotionConfig.easings.smooth }
    });
    
    if (nav.isOpen) {
      // Open menu
      this.lenis.stop();
      nav.overlay.classList.add('is-active');
      
      tl.fromTo(nav.overlay,
        { clipPath: 'circle(0% at 95% 5%)' },
        { 
          clipPath: 'circle(150% at 95% 5%)',
          duration: MotionConfig.durations.slow
        }
      )
      .fromTo(nav.items,
        { opacity: 0, y: 20, rotateX: -15 },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          duration: MotionConfig.durations.normal,
          stagger: MotionConfig.staggers.fast
        },
        '-=0.2'
      );
      
    } else {
      // Close menu
      tl.to(nav.items, {
        opacity: 0,
        y: -20,
        duration: MotionConfig.durations.fast,
        stagger: MotionConfig.staggers.fast
      })
      .to(nav.overlay, {
        clipPath: 'circle(0% at 95% 5%)',
        duration: MotionConfig.durations.normal,
        onComplete: () => {
          nav.overlay.classList.remove('is-active');
          this.lenis.start();
        }
      }, '-=0.2');
    }
  }
  
  // ═══════════════════════════════════════════════════════════════
  // PAGE TRANSITIONS
  // ═══════════════════════════════════════════════════════════════
  
  initPageTransitions() {
    // Intercept all internal links
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href]');
      if (!link) return;
      
      const href = link.getAttribute('href');
      if (href.startsWith('http') || href.startsWith('#')) return;
      
      e.preventDefault();
      this.transitionToPage(href);
    });
    
    // Handle browser back/forward
    window.addEventListener('popstate', () => {
      this.transitionToPage(location.pathname, false);
    });
  }
  
  async transitionToPage(url, updateHistory = true) {
    if (this.state.isTransitioning) return;
    this.state.isTransitioning = true;
    
    // Phase 1: Exit current page
    await this.animatePageExit();
    
    // Phase 2: Load new content
    const response = await fetch(url);
    const html = await response.text();
    const parser = new DOMParser();
    const newDoc = parser.parseFromString(html, 'text/html');
    
    // Phase 3: Update DOM
    const newContent = newDoc.querySelector('.page-content');
    const currentContent = document.querySelector('.page-content');
    
    if (newContent && currentContent) {
      currentContent.innerHTML = newContent.innerHTML;
      
      // Update meta
      document.title = newDoc.title;
      
      // Update history
      if (updateHistory) {
        history.pushState({}, '', url);
      }
      
      // Phase 4: Reinitialize
      this.reinitialize();
      
      // Phase 5: Enter new page
      await this.animatePageEnter();
    }
    
    this.state.isTransitioning = false;
  }
  
  animatePageExit() {
    return new Promise(resolve => {
      const tl = gsap.timeline({
        onComplete: resolve,
        defaults: { ease: MotionConfig.easings.exit }
      });
      
      tl.to('.page-content', {
        opacity: 0,
        y: -30,
        duration: MotionConfig.durations.normal
      })
      .to('.header', {
        opacity: 0,
        duration: MotionConfig.durations.fast
      }, 0);
    });
  }
  
  animatePageEnter() {
    return new Promise(resolve => {
      const tl = gsap.timeline({
        onComplete: resolve,
        defaults: { ease: MotionConfig.easings.enter }
      });
      
      tl.fromTo('.page-content',
        { opacity: 0, y: 30 },
        { 
          opacity: 1,
          y: 0,
          duration: MotionConfig.durations.slow
        }
      )
      .fromTo('.header',
        { opacity: 0 },
        { 
          opacity: 1,
          duration: MotionConfig.durations.normal
        },
        '-=0.3'
      );
    });
  }
  
  reinitialize() {
    // Clear old animations
    ScrollTrigger.getAll().forEach(st => st.kill());
    
    // Reinit animations
    this.initCriticalAnimations();
    this.initDeferredAnimations();
    
    // Refresh
    ScrollTrigger.refresh();
    this.lenis.scrollTo(0, { immediate: true });
  }
  
  // ═══════════════════════════════════════════════════════════════
  // ANIMATIONS - CRITICAL PATH
  // ═══════════════════════════════════════════════════════════════
  
  async initCriticalAnimations() {
    // Hero animations first
    await this.animateHero();
    
    // Above-fold content
    this.animateAboveFold();
  }
  
  animateHero() {
    return new Promise(resolve => {
      const hero = {
        title: document.querySelectorAll('.hero-title .title-line'),
        subtitle: document.querySelector('.hero-subtitle'),
        image: document.querySelector('.hero-section .image-wrapper img'),
        stats: document.querySelectorAll('.hero-stats li')
      };
      
      if (!hero.title.length) {
        resolve();
        return;
      }
      
      const tl = gsap.timeline({
        onComplete: resolve,
        defaults: { ease: MotionConfig.easings.smooth }
      });
      
      // Set initial states
      gsap.set(hero.title, { 
        opacity: 0,
        y: 40,
        rotateX: -90,
        transformOrigin: 'center bottom'
      });
      
      if (hero.image) {
        gsap.set(hero.image, { scale: 1.2 });
      }
      
      // Animate
      tl.to(hero.title, {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: MotionConfig.durations.slow,
        stagger: MotionConfig.staggers.normal
      });
      
      if (hero.image) {
        tl.to(hero.image, {
          scale: 1,
          duration: MotionConfig.durations.slowest,
          ease: MotionConfig.easings.enter
        }, 0);
      }
      
      if (hero.subtitle) {
        tl.fromTo(hero.subtitle,
          { opacity: 0, y: 20 },
          { 
            opacity: 1,
            y: 0,
            duration: MotionConfig.durations.normal
          },
          '-=0.4'
        );
      }
      
      if (hero.stats.length) {
        tl.fromTo(hero.stats,
          { opacity: 0, scale: 0.8 },
          {
            opacity: 1,
            scale: 1,
            duration: MotionConfig.durations.normal,
            stagger: MotionConfig.staggers.fast
          },
          '-=0.3'
        );
      }
    });
  }
  
  animateAboveFold() {
    // Immediate animations for visible content
    const elements = document.querySelectorAll('[data-animate]:not([data-animate-defer])');
    
    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        this.animateElement(el, true);
      }
    });
  }
  
  // ═══════════════════════════════════════════════════════════════
  // ANIMATIONS - DEFERRED
  // ═══════════════════════════════════════════════════════════════
  
  initDeferredAnimations() {
    // Use requestIdleCallback for non-critical animations
    const idle = window.requestIdleCallback || (cb => setTimeout(cb, 1));
    
    idle(() => {
      this.initScrollAnimations();
      this.initParallaxEffects();
      this.initHoverEffects();
    });
  }
  
  initScrollAnimations() {
    // Batch ScrollTrigger creation for performance
    ScrollTrigger.batch('[data-animate]', {
      onEnter: batch => {
        gsap.fromTo(batch,
          { 
            opacity: 0,
            y: 30
          },
          {
            opacity: 1,
            y: 0,
            duration: MotionConfig.durations.normal,
            stagger: MotionConfig.staggers.normal,
            overwrite: true
          }
        );
      },
      start: 'top 85%',
      once: true
    });
    
    // Project cards with optimized animation
    ScrollTrigger.batch('.project-card', {
      onEnter: batch => {
        gsap.fromTo(batch,
          {
            opacity: 0,
            y: 60,
            scale: 0.95
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: MotionConfig.durations.slow,
            stagger: MotionConfig.staggers.slow,
            ease: MotionConfig.easings.emphasis
          }
        );
      },
      start: 'top 80%',
      once: true
    });
    
    // Titles with split animation
    document.querySelectorAll('[data-split-title]').forEach(title => {
      const lines = title.querySelectorAll('.title-line');
      if (!lines.length) return;
      
      gsap.fromTo(lines,
        {
          opacity: 0,
          yPercent: 100,
          rotateX: -90
        },
        {
          opacity: 1,
          yPercent: 0,
          rotateX: 0,
          duration: MotionConfig.durations.slow,
          stagger: MotionConfig.staggers.normal,
          ease: MotionConfig.easings.smooth,
          scrollTrigger: {
            trigger: title,
            start: 'top 80%',
            once: true
          }
        }
      );
    });
  }
  
  initParallaxEffects() {
    // Optimized parallax with will-change management
    document.querySelectorAll('[data-parallax]').forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0.5;
      
      ScrollTrigger.create({
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
        onEnter: () => el.style.willChange = 'transform',
        onLeave: () => el.style.willChange = 'auto',
        onEnterBack: () => el.style.willChange = 'transform',
        onLeaveBack: () => el.style.willChange = 'auto',
        animation: gsap.fromTo(el,
          { yPercent: speed * -10 },
          { 
            yPercent: speed * 10,
            ease: 'none'
          }
        )
      });
    });
  }
  
  initHoverEffects() {
    // Delegated event handling for performance
    document.addEventListener('mouseover', (e) => {
      const card = e.target.closest('.project-card');
      if (card && !card.dataset.hovering) {
        card.dataset.hovering = 'true';
        this.handleCardHover(card, true);
      }
      
      const button = e.target.closest('.button');
      if (button && !button.dataset.hovering) {
        button.dataset.hovering = 'true';
        this.handleButtonHover(button, true);
      }
    });
    
    document.addEventListener('mouseout', (e) => {
      const card = e.target.closest('.project-card');
      if (card && card.dataset.hovering && !card.contains(e.relatedTarget)) {
        delete card.dataset.hovering;
        this.handleCardHover(card, false);
      }
      
      const button = e.target.closest('.button');
      if (button && button.dataset.hovering && !button.contains(e.relatedTarget)) {
        delete button.dataset.hovering;
        this.handleButtonHover(button, false);
      }
    });
  }
  
  handleCardHover(card, isEntering) {
    const tl = gsap.timeline({
      defaults: { 
        duration: MotionConfig.durations.fast,
        ease: MotionConfig.easings.smooth
      }
    });
    
    if (isEntering) {
      tl.to(card, {
        scale: 1.03,
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
      });
    } else {
      tl.to(card, {
        scale: 1,
        boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
      });
    }
  }
  
  handleButtonHover(button, isEntering) {
    const arrow = button.querySelector('.arrow');
    if (!arrow) return;
    
    gsap.to(arrow, {
      x: isEntering ? 8 : 0,
      duration: MotionConfig.durations.fast,
      ease: MotionConfig.easings.smooth
    });
  }
  
  // ═══════════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════════
  
  animateElement(element, immediate = false) {
    const type = element.dataset.animate;
    const delay = immediate ? 0 : parseFloat(element.dataset.delay) || 0;
    
    const animations = {
      'fade': { opacity: 0 },
      'fade-up': { opacity: 0, y: 30 },
      'fade-down': { opacity: 0, y: -30 },
      'scale': { opacity: 0, scale: 0.9 },
      'rotate': { opacity: 0, rotation: -5 }
    };
    
    const from = animations[type] || animations['fade-up'];
    
    gsap.fromTo(element, from, {
      opacity: 1,
      y: 0,
      scale: 1,
      rotation: 0,
      duration: MotionConfig.durations.normal,
      delay,
      ease: MotionConfig.easings.smooth,
      clearProps: 'all'
    });
  }
  
  destroy() {
    // Clean up everything
    ScrollTrigger.getAll().forEach(st => st.kill());
    this.lenis?.destroy();
    gsap.globalTimeline.clear();
    
    // Remove event listeners
    this.performance.observers.forEach(observer => observer.disconnect());
    
    console.log('🧹 Animation system destroyed');
  }
}

// ═══════════════════════════════════════════════════════════════
// INITIALIZE WITH PROPER TIMING
// ═══════════════════════════════════════════════════════════════

(() => {
  let animationSystem;
  
  const init = () => {
    // Only initialize once
    if (animationSystem) return;
    
    try {
      animationSystem = new M0NARQAnimations();
      window.M0NARQ = animationSystem;
    } catch (error) {
      console.error('Failed to initialize animations:', error);
    }
  };
  
  // Initialize at the optimal time
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // DOM already loaded - init immediately
    init();
  }
  
  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    animationSystem?.destroy();
  });
})();
