# Complete Website Fix Instructions for GitHub Copilot Task Agent

## Agent task metadata
- agent_task_file: website-fix-guide.md
- dynamic_island_file: "dynamic island.txt" (repo root)

## Context
You are fixing a multi-page website (M0NARQ AI) with animation, scroll, and layout issues. The user provided `dynamic island.txt` containing the Dynamic Island navigation component code.

## File Structure
```
project/
├── index.html
├── story.html
├── studio.html
├── css/
│   └── combined.css
└── js/
    ├── animations.js (PRIMARY FILE TO FIX)
    └── webp-fallback.js
```

---

## TASK 1: Fix `js/animations.js` - Complete Rewrite

### Requirements:
1. **Integrate Dynamic Island Navigation**
   - Extract the `DynamicIslandNav` class from `dynamic island.txt`
   - Extract the `ScrambleText` class from `dynamic island.txt`
   - Initialize Dynamic Island in the main initialization flow
   - Ensure it works with the existing scroll system

2. **Fix Scroll System**
   - Keep single Lenis instance (already correct)
   - Add proper ScrollTrigger integration
   - Fix: Remove `gsap.ticker.lagSmoothing()` - it causes stutter
   - Add: `ScrollTrigger.defaults({ markers: false })`
   - Ensure: Lenis updates ScrollTrigger on every scroll event

3. **Implement Missing Animation Handlers**
   
   **A. Parallax Effect (`data-parallax` attribute)**
   ```javascript
   // For elements with data-parallax attribute
   // Read data-speed attribute (default 0.5)
   // Create ScrollTrigger with scrub
   // Animate yPercent based on speed
   // Add will-change management (add on enter, remove on leave)
   ```

   **B. Bloom Effect (`data-bloom` attribute)**
   ```javascript
   // For elements with data-bloom attribute
   // On scroll, apply brightness and blur filter
   // Formula: brightness(1 + progress * 0.2) blur(progress * 2px)
   // Where progress = scroll distance / viewport height
   // Throttle updates for performance
   ```

   **C. Stats Counter (`data-counter` attribute)**
   ```javascript
   // Find elements with class .stat-value and data-counter attribute
   // On scroll into view (ScrollTrigger)
   // Animate from 0 to data-counter value
   // Duration: 2 seconds
   // Easing: power2.out
   // Format numbers properly (commas, decimals if present)
   ```

   **D. Title Split Animation**
   ```javascript
   // Elements with data-animate="title-split"
   // Find all .title-line children
   // Animate each line from: { opacity: 0, yPercent: 100, rotateX: -90 }
   // Animate to: { opacity: 1, yPercent: 0, rotateX: 0 }
   // Stagger: 0.1s between lines
   // Trigger: when title enters viewport (top 80%)
   ```

4. **Fix Hero Animation**
   - Wait for hero image to load before animating
   - Use `image.decode()` or `image.complete` check
   - Sequence: Image scale → Title lines → Subtitle → Stats
   - Add proper error handling if elements don't exist

5. **Fix Loader Removal**
   ```javascript
   // Current: Instant removal
   // Fix: Animate out with fade + scale
   // Duration: 0.4s
   // Then remove from DOM
   // Add 'loaded' class to body only after loader is gone
   ```

6. **Fix Menu Toggle**
   - Clip-path animation is defined in CSS but not triggered properly
   - Ensure `.menu-overlay.is-active` class is added/removed
   - Fix timing: overlay animates in → items fade in with stagger
   - Stop Lenis scroll when menu opens, restart when closed

7. **Optimize ScrollTrigger Batch**
   - Current batch animation is correct
   - Add: `invalidateOnRefresh: true`
   - Add: Check if element already animated (add data attribute)

8. **Add Missing Utilities**n   **A. Smart Image Loading**
   ```javascript
   // Function: preloadCriticalImages()
   // Find all images with fetchpriority="high" or loading="eager"
   // Preload using Image() constructor
   // Return Promise.all()
   // Call before hero animation
   ```

   **B. Resize Handler**
   ```javascript
   // Debounced resize handler (300ms)
   // Refresh ScrollTrigger
   // Update any cached viewport dimensions
   ```

   **C. Viewport Check**
   ```javascript
   // Function: isInViewport(element, threshold = 0.1)
   // Returns boolean
   // Use for conditional animation initialization
   ```

9. **Performance Optimizations**
   - Add `will-change: transform` only during animation
   - Remove `will-change` after animation completes
   - Use `gsap.set()` for initial states instead of CSS
   - Add `force3D: true` to all transform animations
   - Limit ScrollTrigger refresh to 60fps max

10. **Error Handling**
    - Wrap all initialization in try-catch blocks
    - Log errors to console with descriptive messages
    - Provide fallback behavior (no animations if GSAP fails)
    - Check for element existence before animating

### Code Structure Template:
```javascript
/**
 * M0NARQ Animation System v6.0
 * Fixed: All scroll, animation, and dynamic island issues
 */

// 1. Motion Config (keep existing)

// 2. Performance Manager (keep existing, add viewport checker)

// 3. ScrambleText class (from dynamic island.txt)

// 4. DynamicIslandNav class (from dynamic island.txt)

// 5. M0NARQAnimations class (extensive fixes)
class M0NARQAnimations {
  constructor() {
    this.performance = new PerformanceManager();
    this.dynamicIsland = null;
    this.state = {
      isInitialized: false,
      isTransitioning: false,
      currentPage: null,
      criticalImagesLoaded: false
    };
    this.init();
  }

  async init() {
    // 1. Remove loader with animation
    await this.removeLoaderAnimated();
    
    // 2. Validate dependencies
    this.validateDependencies();
    
    // 3. Initialize GSAP (with fixes)
    this.initGSAP();
    
    // 4. Initialize scroll system (with fixes)
    this.initScrollSystem();
    
    // 5. Preload critical images
    await this.preloadCriticalImages();
    
    // 6. Initialize Dynamic Island
    this.initDynamicIsland();
    
    // 7. Initialize navigation
    this.initNavigation();
    
    // 8. Critical animations
    await this.initCriticalAnimations();
    
    // 9. Deferred animations (idle callback)
    this.initDeferredAnimations();
    
    // 10. Add resize handler
    this.initResizeHandler();
    
    this.state.isInitialized = true;
    console.log('✨ M0NARQ v6.0 initialized - all fixes applied');
  }

  // NEW: Animated loader removal
  async removeLoaderAnimated() { /* implement */ }

  // FIXED: GSAP initialization
  initGSAP() {
    gsap.registerPlugin(ScrollTrigger);
    gsap.defaults({
      ease: MotionConfig.easings.default,
      duration: MotionConfig.durations.normal,
      overwrite: 'auto'
    });
    gsap.config({
      autoSleep: 60,
      force3D: true,
      nullTargetWarn: false
    });
    // REMOVED: gsap.ticker.lagSmoothing() - causes issues
    ScrollTrigger.defaults({ markers: false });
  }

  // FIXED: Scroll system
  initScrollSystem() { /* keep existing, ensure ScrollTrigger.update() on scroll */ }

  // NEW: Preload critical images
  async preloadCriticalImages() { /* implement */ }

  // NEW: Initialize Dynamic Island
  initDynamicIsland() {
    try {
      this.dynamicIsland = new DynamicIslandNav();
    } catch (error) {
      console.error('Dynamic Island init failed:', error);
    }
  }

  // FIXED: Navigation with proper menu animations
  initNavigation() { /* fix clip-path timing */ }

  // NEW: All missing animation handlers
  initParallaxEffects() { /* implement with will-change management */ }
  initBloomEffects() { /* implement */ }
  initStatsCounters() { /* implement */ }
  initTitleSplitAnimations() { /* implement */ }

  // FIXED: Hero animation with image loading
  async animateHero() { /* wait for image decode */ }

  // NEW: Resize handler
  initResizeHandler() {
    const handleResize = this.performance.debounce(() => {
      ScrollTrigger.refresh();
    }, 300);
    window.addEventListener('resize', handleResize);
  }

  // ... rest of existing methods with fixes applied
}

// 6. Initialize
(() => {
  let animationSystem;
  const init = () => {
    if (animationSystem) return;
    try {
      animationSystem = new M0NARQAnimations();
      window.M0NARQ = animationSystem;
    } catch (error) {
      console.error('Failed to initialize:', error);
      document.body.classList.add('loaded'); // Fallback
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.addEventListener('beforeunload', () => {
    animationSystem?.destroy();
  });
})();
```

---

## TASK 2: Fix `css/combined.css`

### Specific Fixes Needed:

1. **Remove Duplicate Dynamic Island Styles**
   - Keep only ONE set of Dynamic Island styles
   - Remove any duplicates from the middle of the file
   - Ensure all island-related styles are in the "DYNAMIC ISLAND NAVIGATION" section

2. **Fix Scroll Behavior**
   ```css
   /* CHANGE THIS: */
   html {
     scroll-behavior: auto; /* conflicts with Lenis */
   }
   
   /* TO THIS: */
   html {
     scroll-behavior: smooth; /* or remove entirely */
   }
   ```

3. **Fix Section Heights**n   ```css
   /* CHANGE: */
   .full-bleed, .story-chapter {
     min-height: 140vh; /* too tall, causes excessive scroll */
   }
   
   /* TO: */
   .full-bleed, .story-chapter {
     min-height: 100vh;
     display: flex;
     align-items: center;
     justify-content: center;
   }
   ```

4. **Fix Parallax Container**
   ```css
   /* ADD this to parallax parent elements: */
   [data-parallax] {
     will-change: transform;
     backface-visibility: hidden;
     transform: translateZ(0);
   }
   
   /* ADD this to sections containing parallax images: */
   .story-chapter,
   .full-bleed,
   #problem-space,
   #demo-snapshot {
     position: relative;
     overflow: hidden; /* CRITICAL - prevents parallax overflow */
   }
   ```

5. **Fix Image Positioning in Sections**n   ```css
   /* CHANGE background images in sections: */
   .full-bleed img,
   .story-chapter .chapter-background img {
     position: absolute;
     inset: 0;
     width: 100%;
     height: 100%;
     object-fit: cover;
     z-index: 0;
     /* REMOVE: opacity, mix-blend-mode if causing issues */
   }
   
   /* ADD: */
   .chapter-background,
   .full-bleed::after {
     position: absolute;
     inset: 0;
     z-index: 0;
     pointer-events: none;
   }
   ```

6. **Fix Z-Index Layering**n   ```css
   /* Ensure proper stacking: */
   .header { z-index: 1000; }
   .menu-overlay { z-index: 999; }
   .nav-container { z-index: 10000; } /* Dynamic Island must be on top */
   .loader { z-index: 99999; }
   ```

7. **Fix Menu Overlay**
   ```css
   .menu-overlay {
     position: fixed;
     top: 0;
     right: 0;
     width: 100vw;
     height: 100vh;
     background: var(--color-dark-grey);
     clip-path: circle(0% at 100% 0%);
     z-index: var(--z-overlay);
     display: flex;
     align-items: center;
     justify-content: center;
     pointer-events: none;
     transition: clip-path 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
   }
   
   .menu-overlay.is-active {
     clip-path: circle(150% at 100% 0%); /* increased from 141.42% */
     pointer-events: all;
   }
   ```

8. **Add Missing Utility Classes**
   ```css
   /* ADD at end of file: */
   .will-change-transform {
     will-change: transform;
   }
   
   .loaded {
     opacity: 1;
     visibility: visible;
   }
   
   /* Fix for bloom effect */
   [data-bloom] {
     transition: filter 0.3s ease-out;
     will-change: filter;
   }
   ```

9. **Mobile Responsive Fixes**
   ```css
   @media (max-width: 768px) {
     .full-bleed, .story-chapter {
       min-height: 100vh; /* not 140vh */
       padding: var(--spacing-lg) var(--spacing-sm);
     }
     
     .dynamic-island {
       width: 6rem;
     }
     
     .dynamic-island.expanded {
       width: 9rem;
     }
   }
   ```

10. **Performance CSS**
    ```css
    /* ADD for better animation performance: */
    .project-card,
    .capability-card,
    .mini-case {
      will-change: transform;
      transform: translateZ(0);
      backface-visibility: hidden;
    }
    
    /* Remove will-change after page load (add via JS): */
    .loaded .project-card,
    .loaded .capability-card,
    .loaded .mini-case {
      will-change: auto;
    }
    ```

---

## TASK 3: Fix HTML Files (index.html, story.html, studio.html)

### Changes needed in ALL HTML files:

1. **Add Image Decode Attributes**
   ```html
   <!-- FOR HERO IMAGES: -->
   <img src="assets/images/hero-satellite-earth.webp"
        alt="Satellite view of Earth from space"
        fetchpriority="high"
        loading="eager"
        decoding="async"  <!-- ADD THIS -->
        width="1920"
        height="1080"
        data-parallax
        data-speed="0.4"
        data-bloom />
   ```

2. **Fix Image Paths**n   - Ensure all image paths exist in your assets folder
   - Common missing images:
     - `assets/images/hero-satellite-earth.webp`
     - `assets/images/bg-flood-map.webp`
     - `assets/images/story-*.webp` (5 images)
     - `assets/images/bg-*.webp` (various backgrounds)
   - If images don't exist, replace with placeholder or remove data attributes

3. **Fix Data Attributes**
   ```html
   <!-- Ensure sections have proper attributes: -->
   <section id="hero" 
            class="full-bleed" 
            data-nav-section 
            data-nav-title="Home">
   ```

4. **Add Missing ARIA Labels**
   ```html
   <!-- All buttons need aria-label: -->
   <button class="nav-arrow prev" 
           id="prevBtn" 
           aria-label="Previous section">
   ```

5. **Script Loading Order**n   ```html
   <!-- Current order is correct, but ensure: -->
   <script src="js/webp-fallback.js"></script> <!-- First -->
   <script src="js/animations.js" defer></script> <!-- Deferred -->
   ```

---

## TASK 4: Testing Checklist

After implementing all fixes, test:

### Functionality Tests:
- [ ] Loader animates out smoothly (fade + scale)
- [ ] Hero animation plays (image → title → subtitle → stats)
- [ ] Dynamic Island appears at bottom center
- [ ] Dynamic Island expands on click
- [ ] Dynamic Island text updates on scroll (scramble effect)
- [ ] Dynamic Island arrows navigate between sections
- [ ] Progress bar updates as you scroll
- [ ] Menu button opens/closes island menu panel
- [ ] Hamburger menu (top right) opens full overlay
- [ ] Menu overlay has working clip-path animation
- [ ] Smooth scroll between sections
- [ ] Parallax images move at different speeds
- [ ] Stats counter animates when in view
- [ ] All images load properly (with webp fallback)

### Performance Tests:
- [ ] No console errors
- [ ] Scroll is smooth at 60fps
- [ ] No layout shift when images load
- [ ] Mobile responsive (test at 375px width)
- [ ] Page transition works (if using SPA mode)

### Visual Tests:
- [ ] No excessive whitespace between sections
- [ ] Images visible and properly positioned
- [ ] Text readable over background images
- [ ] Dynamic Island always on top (z-index)
- [ ] Menu overlay covers entire screen

---

## TASK 5: Common Issues & Solutions

### If Dynamic Island doesn't appear:
1. Check console for errors in DynamicIslandNav class
2. Verify sections have `data-nav-section` attribute
3. Check z-index (should be 10000)
4. Verify `.nav-container` has `position: fixed`

### If scrolling is stuck:
1. Remove `scroll-behavior: auto` from CSS
2. Check Lenis initialization
3. Ensure no `overflow: hidden` on body
4. Check for JS errors blocking scroll

### If images don't appear:
1. Check file paths in HTML
2. Verify webp-fallback.js is running
3. Check if images exist in assets folder
4. Look for 404 errors in Network tab

### If animations stutter:
1. Add `force3D: true` to GSAP config
2. Reduce ScrollTrigger batch size
3. Add will-change management
4. Check for too many active animations

---

## TASK 6: Final Optimization

After everything works:

1. **Minify CSS** (combined.css is large)
2. **Lazy load below-fold images** (change loading="lazy")
3. **Add font-display: swap** (already done)
4. **Consider code splitting** for animations.js
5. **Add Service Worker** for offline support
6. **Compress images** (webp at 80% quality)

---

## Summary

**Priority Order:**
1. Fix animations.js (integrate Dynamic Island, add missing handlers)
2. Fix combined.css (remove duplicates, fix heights, add overflow:hidden)
3. Test all functionality
4. Optimize performance

**Most Critical Fixes:**
- Dynamic Island integration
- Scroll system (single source, no conflicts)
- Section heights (100vh not 140vh)
- Parallax overflow (add overflow:hidden)
- Image loading (preload critical images)
- Menu animations (fix clip-path timing)

Good luck! This should resolve all issues. Test thoroughly after each major change.
