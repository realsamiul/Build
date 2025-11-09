/**
 * M0NARQ Animation System v6.0
 * Fixed: All scroll, animation, and dynamic island issues
 * 
 * Features:
 * - Dynamic Island Navigation integrated
 * - Unified motion language
 * - Progressive enhancement
 * - Optimized scroll performance
 * - Complete animation handlers
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
  
  // Viewport checker utility
  isInViewport(element, threshold = 0.1) {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    const windowHeight = window.innerHeight || document.documentElement.clientHeight;
    const windowWidth = window.innerWidth || document.documentElement.clientWidth;
    
    const vertInView = (rect.top <= windowHeight) && ((rect.top + rect.height) >= 0);
    const horInView = (rect.left <= windowWidth) && ((rect.left + rect.width) >= 0);
    
    return (vertInView && horInView);
  }
}

// ═══════════════════════════════════════════════════════════════
// SCRAMBLE TEXT CLASS (from Dynamic Island)
// ═══════════════════════════════════════════════════════════════
class ScrambleText {
  constructor(element) {
    this.element = element;
    this.chars = "!#$%&'()*+,-./:;<=>?@[]^_`{|}~";
    this.originalText = element ? element.textContent : '';
  }

  scramble(newText, duration = 0.8) {
    if (!this.element) return null;
    
    const oldText = this.element.textContent;
    const maxLength = Math.max(oldText.length, newText.length);
    const scrambleDuration = duration * 0.8;
    
    let frame = 0;
    const totalFrames = scrambleDuration * 60; // 60fps
    
    const scrambleInterval = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      
      let scrambled = '';
      for (let i = 0; i < maxLength; i++) {
        if (i < newText.length * progress) {
          scrambled += newText[i];
        } else if (i < maxLength) {
          scrambled += this.chars[Math.floor(Math.random() * this.chars.length)];
        }
      }
      
      this.element.textContent = scrambled.substring(0, maxLength);
      
      if (frame >= totalFrames) {
        clearInterval(scrambleInterval);
        this.element.textContent = newText;
      }
    }, 1000 / 60);
    
    return scrambleInterval;
  }
}

// ═══════════════════════════════════════════════════════════════
// DYNAMIC ISLAND NAVIGATION CLASS
// ═══════════════════════════════════════════════════════════════
class DynamicIslandNav {
  constructor() {
    // Auto-detect sections
    this.sections = document.querySelectorAll('[data-nav-section], .nav-section');
    this.island = document.getElementById('dynamicIsland');
    this.textElement = document.querySelector('.text-content');
    this.prevBtn = document.getElementById('prevBtn');
    this.nextBtn = document.getElementById('nextBtn');
    this.menuButton = document.getElementById('menuButton');
    this.menuPanel = document.getElementById('menuPanel');
    this.progressBar = document.getElementById('progressBar');
    
    // Check if required elements exist
    if (!this.island || !this.textElement) {
      console.warn('Dynamic Island elements not found');
      return;
    }
    
    this.menuItems = this.menuPanel ? this.menuPanel.querySelectorAll('.menu-item') : [];
    this.scrambler = new ScrambleText(this.textElement);
    
    this.state = {
      currentIndex: 0,
      isExpanded: false,
      isMenuOpen: false,
      isAnimating: false,
      idleTimeout: null,
      scrambleInterval: null,
      morphTimeout: null
    };

    this.processSections();
    this.init();
  }

  processSections() {
    this.sections.forEach((section, index) => {
      section.dataset.index = index;
      
      if (!section.dataset.navTitle) {
        const heading = section.querySelector('h1, h2, h3');
        if (heading) {
          section.dataset.navTitle = heading.textContent.trim();
        } else {
          section.dataset.navTitle = `Section ${index + 1}`;
        }
      }
    });
  }

  init() {
    if (this.sections.length === 0) {
      console.warn('No sections found for Dynamic Island navigation');
      return;
    }
    
    this.setupEventListeners();
    this.setupIntersectionObserver();
    this.updateProgress();
    
    // Set initial text
    const firstTitle = this.sections[0].dataset.navTitle.toUpperCase();
    this.textElement.textContent = firstTitle;
    
    // Start idle animation
    this.startIdleAnimation();
    
    if (this.menuItems.length > 0) {
      this.updatePageMenu();
    }
  }

  startIdleAnimation() {
    // Clear any existing timeout
    if (this.state.morphTimeout) {
      clearTimeout(this.state.morphTimeout);
    }

    // Only animate when not expanded and not in menu
    if (!this.state.isExpanded && !this.state.isMenuOpen) {
      this.state.morphTimeout = setTimeout(() => {
        if (!this.state.isExpanded && !this.state.isMenuOpen) {
          this.glitchText();
          this.startIdleAnimation();
        }
      }, 3000 + Math.random() * 2000);
    }
  }

  glitchText() {
    if (!this.textElement) return;
    
    const currentText = this.textElement.textContent;
    const glitchChars = "!@#$%^&*()_+";
    
    // Add glitch class for visual effect
    this.textElement.classList.add('glitching');
    
    // Quick glitch animation
    let glitchCount = 0;
    const glitchInterval = setInterval(() => {
      if (glitchCount < 5) {
        let glitched = '';
        for (let i = 0; i < currentText.length; i++) {
          if (Math.random() < 0.1) {
            glitched += glitchChars[Math.floor(Math.random() * glitchChars.length)];
          } else {
            glitched += currentText[i];
          }
        }
        this.textElement.textContent = glitched;
        glitchCount++;
      } else {
        clearInterval(glitchInterval);
        this.textElement.textContent = currentText;
        this.textElement.classList.remove('glitching');
      }
    }, 50);
  }

  updateText(newText) {
    if (this.state.isAnimating || !this.textElement) return;
    this.state.isAnimating = true;

    // Clear any existing scramble
    if (this.state.scrambleInterval) {
      clearInterval(this.state.scrambleInterval);
    }

    // Stop idle animation during text change
    if (this.state.morphTimeout) {
      clearTimeout(this.state.morphTimeout);
    }

    // Scramble to new text
    this.state.scrambleInterval = this.scrambler.scramble(newText.toUpperCase(), 0.6);
    
    setTimeout(() => {
      this.state.isAnimating = false;
      if (!this.state.isExpanded) {
        this.startIdleAnimation();
      }
    }, 600);
  }

  updatePageMenu() {
    if (this.menuItems.length === 0) return;
    
    const currentPath = window.location.pathname;
    this.menuItems.forEach(item => {
      try {
        const itemPath = new URL(item.href).pathname;
        item.classList.toggle('active', itemPath === currentPath);
      } catch (e) {
        // Skip invalid URLs
      }
    });
  }

  setupEventListeners() {
    // Island expansion
    if (this.island) {
      this.island.addEventListener('click', (e) => {
        if (!e.target.closest('.nav-arrow')) {
          this.toggleExpanded(!this.state.isExpanded);
        }
      });
    }

    // Menu button
    if (this.menuButton) {
      this.menuButton.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleMenu();
      });
    }

    // Navigation arrows
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.navigateToSection(this.state.currentIndex - 1);
        this.resetIdleTimer();
      });
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.navigateToSection(this.state.currentIndex + 1);
        this.resetIdleTimer();
      });
    }

    // Click outside
    document.addEventListener('click', (e) => {
      if (this.island && this.menuButton && 
          !this.island.contains(e.target) && !this.menuButton.contains(e.target)) {
        this.toggleExpanded(false);
        this.toggleMenu(false);
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        this.navigateToSection(this.state.currentIndex - 1);
      } else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        this.navigateToSection(this.state.currentIndex + 1);
      } else if (e.key === 'Escape') {
        this.toggleExpanded(false);
        this.toggleMenu(false);
      }
    });

    // Touch gestures
    let touchStartY = 0;
    if (this.island) {
      this.island.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
      });

      this.island.addEventListener('touchend', (e) => {
        const touchEndY = e.changedTouches[0].clientY;
        const diff = touchStartY - touchEndY;
        if (Math.abs(diff) > 50) {
          this.navigateToSection(this.state.currentIndex + (diff > 0 ? 1 : -1));
        }
      });
    }
  }

  setupIntersectionObserver() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.dataset.index);
            if (!isNaN(index) && index !== this.state.currentIndex) {
              this.updateCurrentSection(index);
            }
          }
        });
      },
      { threshold: 0.6 }
    );

    this.sections.forEach(section => observer.observe(section));
  }

  updateCurrentSection(index) {
    this.state.currentIndex = index;
    const section = this.sections[index];
    if (!section) return;
    
    const title = section.dataset.navTitle;
    
    this.updateText(title);
    
    this.sections.forEach(s => s.classList.remove('active'));
    section.classList.add('active');
    
    this.updateProgress();
  }

  resetIdleTimer() {
    if (this.state.idleTimeout) {
      clearTimeout(this.state.idleTimeout);
    }

    if (this.state.isExpanded) {
      this.state.idleTimeout = setTimeout(() => {
        this.toggleExpanded(false);
      }, 5000);
    }
  }

  toggleExpanded(shouldExpand) {
    if (!this.island) return;
    
    this.state.isExpanded = shouldExpand;

    if (shouldExpand) {
      this.island.classList.add('expanded');
      this.resetIdleTimer();
      // Stop idle animation when expanded
      if (this.state.morphTimeout) {
        clearTimeout(this.state.morphTimeout);
      }
    } else {
      this.island.classList.remove('expanded');
      if (this.state.idleTimeout) {
        clearTimeout(this.state.idleTimeout);
      }
      // Restart idle animation when collapsed
      this.startIdleAnimation();
    }

    // Smooth width transition
    if (typeof gsap !== 'undefined') {
      gsap.to(this.island, {
        width: shouldExpand ? 'var(--island-width-expanded)' : 'var(--island-width-collapsed)',
        duration: 0.4,
        ease: "power2.inOut"
      });

      // Arrow animations
      if (this.prevBtn && this.nextBtn) {
        gsap.to([this.prevBtn, this.nextBtn], {
          opacity: shouldExpand ? 1 : 0,
          scale: shouldExpand ? 1 : 0.6,
          pointerEvents: shouldExpand ? 'all' : 'none',
          duration: 0.3,
          ease: "power2.inOut",
          stagger: shouldExpand ? 0.05 : 0
        });
      }
    }
  }

  toggleMenu(force = null) {
    if (!this.menuPanel || !this.menuButton) return;
    
    const shouldOpen = force !== null ? force : !this.state.isMenuOpen;
    this.state.isMenuOpen = shouldOpen;

    this.menuButton.classList.toggle('menu-open', shouldOpen);

    if (typeof gsap !== 'undefined') {
      gsap.to(this.menuPanel, {
        opacity: shouldOpen ? 1 : 0,
        scale: shouldOpen ? 1 : 0.8,
        pointerEvents: shouldOpen ? 'all' : 'none',
        duration: 0.3,
        ease: "power2.inOut"
      });

      if (shouldOpen && this.menuItems.length > 0) {
        gsap.fromTo(this.menuItems, 
          { y: 10, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.3, stagger: 0.03, delay: 0.1 }
        );
      }
    }
  }

  navigateToSection(index) {
    if (this.state.isAnimating) return;
    
    const clampedIndex = Math.max(0, Math.min(this.sections.length - 1, index));
    if (clampedIndex === this.state.currentIndex) return;

    if (typeof gsap !== 'undefined' && window.M0NARQ && window.M0NARQ.lenis) {
      // Use Lenis for smooth scrolling
      window.M0NARQ.lenis.scrollTo(this.sections[clampedIndex], {
        duration: 1,
        easing: (t) => 1 - Math.pow(1 - t, 3)
      });
    } else {
      // Fallback to native scroll
      this.sections[clampedIndex].scrollIntoView({ behavior: 'smooth' });
    }
  }

  updateProgress() {
    if (!this.progressBar) return;
    
    const progress = ((this.state.currentIndex + 1) / this.sections.length) * 100;
    
    if (typeof gsap !== 'undefined') {
      gsap.to(this.progressBar, {
        width: `${progress}%`,
        duration: 0.6,
        ease: "power2.inOut"
      });
    } else {
      this.progressBar.style.width = `${progress}%`;
    }
  }
  
  destroy() {
    // Clean up timers
    if (this.state.idleTimeout) clearTimeout(this.state.idleTimeout);
    if (this.state.morphTimeout) clearTimeout(this.state.morphTimeout);
    if (this.state.scrambleInterval) clearInterval(this.state.scrambleInterval);
  }
}

// ═══════════════════════════════════════════════════════════════
// MAIN ANIMATION CLASS
// ═══════════════════════════════════════════════════════════════
class M0NARQAnimations {
  constructor() {
    this.performance = new PerformanceManager();
    this.dynamicIsland = null;
    this.lenis = null;
    this.state = {
      isInitialized: false,
      isTransitioning: false,
      currentPage: null,
      criticalImagesLoaded: false
    };
    
    // Initialize immediately
    this.init();
  }
  
  async init() {
    try {
      // Critical path first
      await this.removeLoaderAnimated();
      this.validateDependencies();
      
      // Core systems
      this.initGSAP();
      this.initScrollSystem();
      
      // Preload critical images
      await this.preloadCriticalImages();
      
      // Initialize Dynamic Island
      this.initDynamicIsland();
      
      // UI Components
      this.initNavigation();
      
      // Animations (progressive)
      await this.initCriticalAnimations();
      this.initDeferredAnimations();
      
      // Add resize handler
      this.initResizeHandler();
      
      this.state.isInitialized = true;
      console.log('✨ M0NARQ v6.0 initialized - all fixes applied');
    } catch (error) {
      console.error('Failed to initialize M0NARQ animations:', error);
      // Fallback: ensure page is visible
      document.body.classList.add('loaded');
      document.body.style.cssText = 'opacity: 1; visibility: visible;';
    }
  }
  
  // ═══════════════════════════════════════════════════════════════
  // INITIALIZATION
  // ═══════════════════════════════════════════════════════════════
  
  async removeLoaderAnimated() {
    return new Promise(resolve => {
      const loaders = document.querySelectorAll('.loader, [data-loader]');
      
      if (loaders.length === 0) {
        document.documentElement.classList.add('loaded');
        document.body.classList.add('loaded');
        resolve();
        return;
      }
      
      if (typeof gsap !== 'undefined') {
        // Animate out with fade + scale
        gsap.to(loaders, {
          opacity: 0,
          scale: 0.95,
          duration: MotionConfig.durations.normal,
          ease: MotionConfig.easings.exit,
          onComplete: () => {
            loaders.forEach(loader => loader.remove());
            document.documentElement.classList.add('loaded');
            document.body.classList.add('loaded');
            resolve();
          }
        });
      } else {
        // Fallback: instant removal
        loaders.forEach(loader => loader.remove());
        document.documentElement.classList.add('loaded');
        document.body.classList.add('loaded');
        resolve();
      }
    });
  }
  
  validateDependencies() {
    const required = ['gsap', 'ScrollTrigger', 'Lenis'];
    const missing = required.filter(dep => !window[dep]);
    
    if (missing.length) {
      console.warn(`Missing dependencies: ${missing.join(', ')}. Some features may not work.`);
    }
  }
  
  initGSAP() {
    if (typeof gsap === 'undefined') {
      console.warn('GSAP not loaded');
      return;
    }
    
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
    
    // CRITICAL: DO NOT USE lagSmoothing - causes stutter with Lenis
    // REMOVED: gsap.ticker.lagSmoothing(1000, 16);
    
    // ScrollTrigger defaults
    ScrollTrigger.defaults({ 
      markers: false,
      // CRITICAL: Use Lenis for scrolling, not ScrollTrigger
      scroller: window
    });
    
    // CRITICAL: Configure ScrollTrigger for Lenis
    ScrollTrigger.config({
      autoRefreshEvents: "visibilitychange,DOMContentLoaded,load",
      ignoreMobileResize: true
    });
    
    gsap.ticker.fps(60);
  }
  
  initScrollSystem() {
    if (typeof Lenis === 'undefined') {
      console.warn('Lenis not loaded, using native scroll');
      return;
    }
    
    // Reduced inertia for better ScrollTrigger sync
    this.lenis = new Lenis({
      duration: 1.0,  // CHANGED from 1.8 - reduced inertia for better sync
      easing: (t) => {
        // Custom luxury easing - ease-in-out with slight overshoot
        return t < 0.5
          ? 4 * t * t * t
          : 1 - Math.pow(-2 * t + 2, 3) / 2;
      },
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smooth: !this.performance.isReducedMotion,
      smoothTouch: false,  // Disable on touch for better mobile performance
      wheelMultiplier: 0.8,  // Softer wheel response
      touchMultiplier: 1.5,  // Smoother touch scrolling
      infinite: false,
      autoResize: true,
      // These prevent stalling
      syncTouch: true,
      syncTouchLerp: 0.1,
    });
    
    // CRITICAL FIX: Proper RAF loop with error handling
    const raf = (time) => {
      try {
        this.lenis.raf(time);
        requestAnimationFrame(raf);
      } catch (error) {
        console.error('Lenis RAF error:', error);
        // Fallback: try again
        requestAnimationFrame(raf);
      }
    };
    requestAnimationFrame(raf);
    
    // CRITICAL FIX: Proper ScrollTrigger integration with scrollerProxy
    if (typeof ScrollTrigger !== 'undefined') {
      const lenis = this.lenis;
      ScrollTrigger.scrollerProxy(document.scrollingElement || document.documentElement, {
        scrollTop(value) {
          if (arguments.length) {
            lenis.scrollTo(value, { duration: 0.5 });
          }
          return document.scrollingElement ? document.scrollingElement.scrollTop : document.documentElement.scrollTop;
        },
        getBoundingClientRect() {
          return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
        },
        getScrollHeight() {
          return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
        }
      });
      
      // Sync Lenis scroll with ScrollTrigger
      this.lenis.on('scroll', ScrollTrigger.update);
      
      // CRITICAL: Refresh ScrollTrigger after Lenis is ready
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100);
    }
    
    // Handle anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          this.scrollTo(target);
        }
      });
    });
  }
  
  scrollTo(target, options = {}) {
    if (!this.lenis) {
      target.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    
    const defaults = {
      offset: 0,
      duration: MotionConfig.durations.slowest,
      easing: (t) => 1 - Math.pow(1 - t, 3)
    };
    
    this.lenis.scrollTo(target, { ...defaults, ...options });
  }
  
  async preloadCriticalImages() {
    return new Promise(resolve => {
      try {
        const criticalImages = document.querySelectorAll('img[fetchpriority="high"], img[loading="eager"]');
        
        if (criticalImages.length === 0) {
          this.state.criticalImagesLoaded = true;
          resolve();
          return;
        }
        
        const imagePromises = Array.from(criticalImages).map(img => {
          return new Promise((imgResolve) => {
            if (img.complete && img.naturalHeight !== 0) {
              imgResolve();
            } else {
              // CRITICAL: Use decode() for better performance
              if (img.decode) {
                img.decode()
                  .then(() => imgResolve())
                  .catch(() => {
                    // Fallback to onload
                    img.onload = () => imgResolve();
                    img.onerror = () => imgResolve();
                  });
              } else {
                img.onload = () => imgResolve();
                img.onerror = () => imgResolve();
              }
            }
          });
        });
        
        Promise.all(imagePromises).then(() => {
          this.state.criticalImagesLoaded = true;
          console.log('✓ Critical images loaded');
          resolve();
        });
      } catch (error) {
        console.warn('Error preloading images:', error);
        this.state.criticalImagesLoaded = true;
        resolve();
      }
    });
  }
  
  initDynamicIsland() {
    try {
      // Check if Dynamic Island elements exist
      const islandElement = document.getElementById('dynamicIsland');
      if (islandElement) {
        this.dynamicIsland = new DynamicIslandNav();
      } else {
        console.info('Dynamic Island not found - skipping initialization');
      }
    } catch (error) {
      console.error('Dynamic Island init failed:', error);
    }
  }
  
  initResizeHandler() {
    const handleResize = this.performance.debounce(() => {
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
      }
    }, 300);
    
    window.addEventListener('resize', handleResize);
  }
  
  // ═══════════════════════════════════════════════════════════════
  // NAVIGATION
  // ═══════════════════════════════════════════════════════════════
  
  initNavigation() {
    const nav = {
      button: document.querySelector('[data-menu-toggle]'), // Top hamburger
      islandButton: document.getElementById('menuButton'), // Island hamburger
      overlay: document.querySelector('.menu-overlay'),
      items: document.querySelectorAll('.menu-overlay .menu-item'), // Only main menu items
      isOpen: false
    };
    
    if (!nav.button || !nav.overlay) return;
    
    // CRITICAL FIX: Both hamburgers should open FULL MENU
    const toggleHandler = () => {
      nav.isOpen = !nav.isOpen;
      this.toggleMenu(nav);
    };
    
    nav.button.addEventListener('click', toggleHandler);
    
    // CRITICAL: Island hamburger also opens full menu
    if (nav.islandButton) {
      nav.islandButton.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleHandler();
      });
    }
    
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
    if (typeof gsap === 'undefined') return;
    
    const tl = gsap.timeline({
      defaults: { ease: MotionConfig.easings.smooth }
    });
    
    if (nav.isOpen) {
      // Open menu - Stop Lenis scroll
      if (this.lenis) this.lenis.stop();
      nav.overlay.classList.add('is-active');
      
      // Overlay animates in
      tl.to(nav.overlay, {
        duration: MotionConfig.durations.slower,
        onStart: () => {
          nav.overlay.style.clipPath = 'circle(150% at 100% 0%)';
        }
      });
      
      // Items fade in with stagger
      if (nav.items.length > 0) {
        tl.fromTo(nav.items,
          { opacity: 0, y: 20, rotateX: -15 },
          {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: MotionConfig.durations.normal,
            stagger: MotionConfig.staggers.fast
          },
          '-=0.4'
        );
      }
      
    } else {
      // Close menu
      if (nav.items.length > 0) {
        tl.to(nav.items, {
          opacity: 0,
          y: -20,
          duration: MotionConfig.durations.fast,
          stagger: MotionConfig.staggers.fast
        });
      }
      
      tl.to(nav.overlay, {
        duration: MotionConfig.durations.normal,
        onStart: () => {
          nav.overlay.style.clipPath = 'circle(0% at 100% 0%)';
        },
        onComplete: () => {
          nav.overlay.classList.remove('is-active');
          if (this.lenis) this.lenis.start();
        }
      }, '-=0.2');
    }
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
  
  async animateHero() {
    return new Promise(resolve => {
      const hero = {
        section: document.querySelector('.hero-section, #hero'),
        title: document.querySelectorAll('.hero-title .title-line'),
        subtitle: document.querySelector('.hero-subtitle'),
        image: document.querySelector('.hero-section img, #hero img'),
        stats: document.querySelectorAll('.hero-stats li, .stat-item')
      };
      
      if (!hero.title.length && !hero.image) {
        resolve();
        return;
      }
      
      // Wait for hero image to load if it exists
      const waitForImage = () => {
        return new Promise(imgResolve => {
          if (!hero.image) {
            imgResolve();
            return;
          }
          
          if (hero.image.complete) {
            imgResolve();
          } else {
            // Use image.decode() if available
            if (hero.image.decode) {
              hero.image.decode()
                .then(() => imgResolve())
                .catch(() => imgResolve()); // Still resolve on error
            } else {
              hero.image.onload = () => imgResolve();
              hero.image.onerror = () => imgResolve();
            }
          }
        });
      };
      
      waitForImage().then(() => {
        if (typeof gsap === 'undefined') {
          resolve();
          return;
        }
        
        const tl = gsap.timeline({
          onComplete: resolve,
          defaults: { ease: MotionConfig.easings.smooth }
        });
        
        // Set initial states
        if (hero.title.length > 0) {
          gsap.set(hero.title, { 
            opacity: 0,
            y: 40,
            rotateX: -90,
            transformOrigin: 'center bottom',
            force3D: true
          });
        }
        
        if (hero.image) {
          gsap.set(hero.image, { scale: 1.2, force3D: true });
        }
        
        // Sequence: Image scale → Title lines → Subtitle → Stats
        if (hero.image) {
          tl.to(hero.image, {
            scale: 1,
            duration: MotionConfig.durations.slowest,
            ease: MotionConfig.easings.enter,
            force3D: true
          });
        }
        
        if (hero.title.length > 0) {
          tl.to(hero.title, {
            opacity: 1,
            y: 0,
            rotateX: 0,
            duration: MotionConfig.durations.slow,
            stagger: MotionConfig.staggers.normal,
            force3D: true
          }, hero.image ? '-=0.8' : 0);
        }
        
        if (hero.subtitle) {
          tl.fromTo(hero.subtitle,
            { opacity: 0, y: 20 },
            { 
              opacity: 1,
              y: 0,
              duration: MotionConfig.durations.normal,
              force3D: true
            },
            '-=0.4'
          );
        }
        
        if (hero.stats.length > 0) {
          tl.fromTo(hero.stats,
            { opacity: 0, scale: 0.8 },
            {
              opacity: 1,
              scale: 1,
              duration: MotionConfig.durations.normal,
              stagger: MotionConfig.staggers.fast,
              force3D: true
            },
            '-=0.3'
          );
        }
      });
    });
  }
  
  animateAboveFold() {
    // Immediate animations for visible content
    const elements = document.querySelectorAll('[data-animate]:not([data-animate-defer])');
    
    elements.forEach(el => {
      if (this.performance.isInViewport(el)) {
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
      this.initBloomEffects();
      this.initStatsCounters();
      this.initTitleSplitAnimations();
      this.initHoverEffects();
    });
  }
  
  initScrollAnimations() {
    if (typeof ScrollTrigger === 'undefined') return;
    
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
            overwrite: true,
            force3D: true,
            onStart: function() {
              // Mark as animated to prevent re-animation
              batch.forEach(el => el.dataset.animated = 'true');
            }
          }
        );
      },
      start: 'top 85%',
      once: true,
      invalidateOnRefresh: true
    });
    
    // Project cards with optimized animation
    ScrollTrigger.batch('.project-card', {
      onEnter: batch => {
        // Skip already animated elements
        const toAnimate = batch.filter(el => !el.dataset.animated);
        if (toAnimate.length === 0) return;
        
        gsap.fromTo(toAnimate,
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
            ease: MotionConfig.easings.emphasis,
            force3D: true,
            onStart: function() {
              toAnimate.forEach(el => el.dataset.animated = 'true');
            }
          }
        );
      },
      start: 'top 80%',
      once: true,
      invalidateOnRefresh: true
    });
  }
  
  initParallaxEffects() {
    if (typeof ScrollTrigger === 'undefined') return;
    
    // Optimized parallax with reduced amplitude and will-change management
    document.querySelectorAll('[data-parallax]').forEach(el => {
      const speed = parseFloat(el.dataset.speed || el.dataset.parallax) || 0.5;
      
      ScrollTrigger.create({
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 1,
        invalidateOnRefresh: false,  // Prevent heavy re-calcs during refresh loops
        onEnter: () => el.style.willChange = 'transform',
        onLeave: () => el.style.willChange = 'auto',
        onEnterBack: () => el.style.willChange = 'transform',
        onLeaveBack: () => el.style.willChange = 'auto',
        animation: gsap.fromTo(el,
          { yPercent: speed * -3 },  // CHANGED from -10 - reduced amplitude
          { 
            yPercent: speed * 3,  // CHANGED from 10 - reduced amplitude
            ease: 'none',
            force3D: true
          }
        )
      });
    });
  }
  
  initBloomEffects() {
    if (typeof ScrollTrigger === 'undefined') return;
    
    // Bloom effect with throttled updates - removed expensive blur
    document.querySelectorAll('[data-bloom]').forEach(el => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          this.performance.throttleRAF(() => {
            const progress = self.progress;
            const brightness = 1 + (progress * 0.2);
            // Removed blur - using brightness only for performance
            el.style.filter = `brightness(${brightness})`;
            // Ensure GPU acceleration
            el.style.transform = 'translateZ(0)';
          });
        }
      });
    });
  }
  
  initStatsCounters() {
    if (typeof ScrollTrigger === 'undefined') return;
    
    // Stats counter animation
    document.querySelectorAll('.stat-value[data-counter], [data-counter]').forEach(el => {
      const target = parseFloat(el.dataset.counter);
      if (isNaN(target)) return;
      
      const hasDecimals = el.dataset.counter.includes('.');
      const decimals = hasDecimals ? el.dataset.counter.split('.')[1].length : 0;
      
      ScrollTrigger.create({
        trigger: el,
        start: 'top 80%',
        once: true,
        onEnter: () => {
          const obj = { value: 0 };
          gsap.to(obj, {
            value: target,
            duration: 2,
            ease: 'power2.out',
            onUpdate: () => {
              // Format with commas and decimals
              const formatted = obj.value.toLocaleString('en-US', {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
              });
              el.textContent = formatted + (el.dataset.suffix || '');
            }
          });
        }
      });
    });
  }
  
  initTitleSplitAnimations() {
    if (typeof ScrollTrigger === 'undefined') return;
    
    // Title split animation
    document.querySelectorAll('[data-animate="title-split"], [data-split-title]').forEach(title => {
      const lines = title.querySelectorAll('.title-line');
      if (lines.length === 0) return;
      
      gsap.fromTo(lines,
        {
          opacity: 0,
          yPercent: 100,
          rotateX: -90,
          transformOrigin: 'center bottom'
        },
        {
          opacity: 1,
          yPercent: 0,
          rotateX: 0,
          duration: MotionConfig.durations.slow,
          stagger: 0.1,
          ease: MotionConfig.easings.smooth,
          force3D: true,
          scrollTrigger: {
            trigger: title,
            start: 'top 80%',
            once: true
          }
        }
      );
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
    if (typeof gsap === 'undefined') return;
    
    const tl = gsap.timeline({
      defaults: { 
        duration: MotionConfig.durations.fast,
        ease: MotionConfig.easings.smooth
      }
    });
    
    if (isEntering) {
      tl.to(card, {
        scale: 1.03,
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        force3D: true
      });
    } else {
      tl.to(card, {
        scale: 1,
        boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
        force3D: true
      });
    }
  }
  
  handleButtonHover(button, isEntering) {
    if (typeof gsap === 'undefined') return;
    
    const arrow = button.querySelector('.arrow');
    if (!arrow) return;
    
    gsap.to(arrow, {
      x: isEntering ? 8 : 0,
      duration: MotionConfig.durations.fast,
      ease: MotionConfig.easings.smooth,
      force3D: true
    });
  }
  
  // ═══════════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════════
  
  animateElement(element, immediate = false) {
    if (typeof gsap === 'undefined') return;
    
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
      clearProps: 'all',
      force3D: true
    });
  }
  
  destroy() {
    // Clean up everything
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.getAll().forEach(st => st.kill());
    }
    
    this.lenis?.destroy();
    this.dynamicIsland?.destroy();
    
    if (typeof gsap !== 'undefined') {
      gsap.globalTimeline.clear();
    }
    
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
      // Fallback: ensure page is visible
      document.body.classList.add('loaded');
      document.body.style.cssText = 'opacity: 1; visibility: visible;';
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
