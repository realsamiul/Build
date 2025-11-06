
/*
══════════════════════════════════════════════════════════════════
M0NARQ AI - ANIMATIONS v4.0
Premium Dynamic Island + Smooth Scroll + Fixed Parallax
══════════════════════════════════════════════════════════════════
*/

class M0NARQ_Animations {
  constructor() {
    this.killLoader();
    
    if (typeof gsap === "undefined" || typeof Lenis === "undefined") {
      console.error("❌ Missing GSAP/Lenis");
      return;
    }

    this.initGSAP();
    this.initLenis();
    this.initMenu();
    this.initVideos();
    this.initHoverEffects();
    this.initDynamicIsland();

    const idleCallback = window.requestIdleCallback || function(cb) {
      return setTimeout(cb, 1);
    };

    idleCallback(() => {
      this.animatePageEntry();
      this.initScrollAnimations();
      this.initHeaderBlend();
      this.detectPage();
      ScrollTrigger.refresh();
    });

    this.handleResize();
    console.log("🚀 M0NARQ v4.0 - Premium Island Active");
  }

  killLoader() {
    document.querySelectorAll('.loader,[data-loader]').forEach(l => l.remove());
    document.body.style.opacity = '1';
    document.body.style.visibility = 'visible';
    document.documentElement.style.overflow = '';
  }

  initGSAP() {
    gsap.registerPlugin(ScrollTrigger, CustomEase);
    gsap.ticker.lagSmoothing(1000, 16);
    CustomEase.create("customGentle", "M0,0 C0,0.202 0.204,1 1,1");
    CustomEase.create("customStrong", "M0,0 C0.496,0.004 0,1 1,1");
    CustomEase.create("expandEase", "M0,0 C0.25,0.1 0.39,0.29 0.62,0.62 0.83,0.84 1,1 1,1");
    gsap.defaults({ ease: "power2.out", duration: 0.6 });
    gsap.config({ force3D: true, nullTargetWarn: false });
    console.log("✅ GSAP (GPU mode)");
  }

  initLenis() {
    this.lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smooth: true,
      smoothTouch: false,
      touchInertiaMultiplier: 35,
      infinite: false
    });

    const raf = (time) => {
      this.lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    this.lenis.on("scroll", ScrollTrigger.update);
    console.log("✅ Lenis (smooth: 1.2s)");
  }

  initMenu() {
    const btn = document.querySelector('.header .menu-button');
    const overlay = document.querySelector('.menu-overlay');
    const burger = document.querySelector('.burger');
    const lines = document.querySelectorAll('.burger-line');
    const items = document.querySelectorAll('.menu-overlay .menu-item');

    if (!btn || !overlay) return;

    let open = false;

    btn.addEventListener("click", () => {
      open = !open;
      open ? this.openMenu(overlay, burger, lines, items)
           : this.closeMenu(overlay, burger, lines, items);
    });

    items.forEach(item => {
      item.addEventListener("click", () => {
        if (open) {
          this.closeMenu(overlay, burger, lines, items);
          open = false;
        }
      });
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && open) {
        this.closeMenu(overlay, burger, lines, items);
        open = false;
      }
    });

    console.log("✅ Menu");
  }

  openMenu(overlay, burger, lines, items) {
    if (this.lenis) this.lenis.stop();

    gsap.fromTo(overlay,
      { clipPath: "circle(0% at 100% 0%)" },
      { clipPath: "circle(141.42% at 100% 0%)", duration: 0.8, ease: "power3.inOut" }
    );

    overlay.classList.add("is-active");
    burger.classList.add("is-active");

    const [top, mid, bot] = lines;
    gsap.to(top, { y: 8, rotation: 45, transformOrigin: "center", duration: 0.3 });
    gsap.to(mid, { autoAlpha: 0, duration: 0.1 });
    gsap.to(bot, { y: -8, rotation: -45, transformOrigin: "center", duration: 0.3 });

    gsap.fromTo(items,
      { autoAlpha: 0, y: 30, rotation: -5 },
      { autoAlpha: 1, y: 0, rotation: 0, stagger: 0.08, duration: 0.6, delay: 0.3, ease: "power2.out" }
    );
  }

  closeMenu(overlay, burger, lines, items) {
    if (this.lenis) this.lenis.start();

    gsap.to(overlay, {
      clipPath: "circle(0% at 100% 0%)",
      duration: 0.6,
      ease: "power3.inOut",
      onComplete: () => overlay.classList.remove("is-active")
    });

    burger.classList.remove("is-active");

    const [top, mid, bot] = lines;
    gsap.to(top, { y: 0, rotation: 0, duration: 0.3 });
    gsap.to(mid, { autoAlpha: 1, duration: 0.2 });
    gsap.to(bot, { y: 0, rotation: 0, duration: 0.3 });
    gsap.to(items, { autoAlpha: 0, duration: 0.2 });
  }

  initVideos() {
    const videos = document.querySelectorAll('.project-video, .hero-video');
    if (!videos.length) return;

    videos.forEach(video => {
      video.muted = true;
      video.playsInline = true;
      video.loop = true;
      video.preload = "metadata";

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting && video.readyState < 2) {
              video.load();
            }
          });
        },
        { rootMargin: "400px", threshold: 0 }
      );

      observer.observe(video);
    });

    document.querySelectorAll(".project-card").forEach(card => {
      const img = card.querySelector(".project-image");
      const vid = card.querySelector(".project-video");

      if (!vid || !img) return;

      vid.load();
      let isPlaying = false;

      card.addEventListener("mouseenter", () => {
        if (!isPlaying) {
          isPlaying = true;
          gsap.to(img, { autoAlpha: 0, duration: 0.4 });
          gsap.to(vid, { autoAlpha: 1, duration: 0.4 });
          const playPromise = vid.play();
          if (playPromise !== undefined) {
            playPromise.catch(() => {});
          }
        }
      });

      card.addEventListener("mouseleave", () => {
        if (isPlaying) {
          isPlaying = false;
          gsap.to(vid, {
            autoAlpha: 0,
            duration: 0.3,
            onComplete: () => {
              vid.pause();
              vid.currentTime = 0;
            }
          });
          gsap.to(img, { autoAlpha: 1, duration: 0.3 });
        }
      });
    });

    console.log(`✅ Videos (${videos.length} passive)`);
  }

  initHoverEffects() {
    document.querySelectorAll('.button').forEach(btn => {
      const arrow = btn.querySelector('.arrow');
      if (!arrow) return;

      btn.addEventListener("mouseenter", () => {
        gsap.to(arrow, { x: 5, duration: 0.3, ease: "power2.out" });
      });

      btn.addEventListener("mouseleave", () => {
        gsap.to(arrow, { x: 0, duration: 0.3, ease: "power2.out" });
      });
    });

    console.log("✅ Button hover");
  }

  animatePageEntry() {
    const titleLines = gsap.utils.toArray('.hero-title .title-line, .project-title-main .title-line');
    const heroMedia = document.querySelector('.hero-section .image-wrapper img, .page-hero .image-wrapper img, .project-hero .hero-video, .full-bleed img');
    const heroMeta = gsap.utils.toArray('.hero-subtitle, .project-subtitle, .full-bleed h1, .full-bleed .sub');

    const tl = gsap.timeline({ defaults: { ease: "customGentle" } });

    if (titleLines.length) {
      gsap.set(titleLines, { autoAlpha: 0, rotation: 7, yPercent: 100, force3D: true });
      tl.to(titleLines, {
        autoAlpha: 1,
        rotation: 0,
        yPercent: 0,
        stagger: 0.12,
        duration: 1,
        clearProps: "all"
      }, 0.2);
    }

    if (heroMedia) {
      gsap.set(heroMedia, { scale: 1.3, transformOrigin: "center center", force3D: true });
      tl.to(heroMedia, {
        scale: 1,
        duration: 1.4,
        ease: "power2.out",
        clearProps: "scale"
      }, 0);
    }

    if (heroMeta.length) {
      gsap.set(heroMeta, { autoAlpha: 0, y: 20 });
      tl.to(heroMeta, { autoAlpha: 1, y: 0, stagger: 0.15, duration: 0.8 }, 0.6);
    }

    console.log("✅ Page entry animated");
  }

  initScrollAnimations() {
    gsap.utils.toArray('[data-animate="title-split"]').forEach(element => {
      const lines = element.querySelectorAll(".title-line");
      if (!lines.length) return;

      gsap.fromTo(lines,
        { autoAlpha: 0, rotation: 7, yPercent: 100, force3D: true },
        {
          autoAlpha: 1,
          rotation: 0,
          yPercent: 0,
          stagger: 0.1,
          duration: 1,
          ease: "customGentle",
          scrollTrigger: {
            trigger: element,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

        
gsap.utils.toArray('[data-animate="fade-up"]').forEach(el => {
      gsap.fromTo(el,
        { autoAlpha: 0, y: 40, force3D: true },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%"
          }
        }
      );
    });

    gsap.utils.toArray('[data-stagger-children]').forEach(parent => {
      const children = parent.querySelectorAll('[data-animate]');
      if (!children.length) return;

      gsap.fromTo(children,
        { autoAlpha: 0, y: 40, scale: 0.95, force3D: true },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          stagger: { amount: 0.6, from: "start" },
          duration: 0.9,
          ease: "power2.out",
          scrollTrigger: {
            trigger: parent,
            start: "top 75%"
          }
        }
      );
    });

    gsap.utils.toArray('[data-parallax]').forEach(el => {
      const speed = parseFloat(el.dataset.speed || el.dataset.parallax) || 0.5;
      
      gsap.to(el, {
        yPercent: -50 * speed,
        ease: "none",
        force3D: true,
        scrollTrigger: {
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          scrub: true,
          invalidateOnRefresh: true
        }
      });
    });

    gsap.utils.toArray(".project-card").forEach(card => {
      gsap.fromTo(card,
        { autoAlpha: 0, y: 80, scale: 0.96, force3D: true },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: card,
            start: "top 80%"
          }
        }
      );
    });

    gsap.utils.toArray('[data-bloom], .full-bleed img, .page-hero .image-wrapper img, .story-chapter .image-wrapper img').forEach(img => {
      gsap.set(img, { filter: "brightness(1) saturate(1)" });
      
      ScrollTrigger.create({
        trigger: img,
        start: "top 80%",
        end: "bottom 20%",
        onEnter: () => {
          gsap.to(img, {
            filter: "brightness(1.45) saturate(1.35)",
            duration: 0.8,
            ease: "power2.out"
          });
        },
        onLeaveBack: () => {
          gsap.to(img, {
            filter: "brightness(1) saturate(1)",
            duration: 0.8,
            ease: "power2.out"
          });
        }
      });
    });

    const footer = document.querySelector(".footer");
    if (footer) {
      gsap.fromTo(footer,
        { y: 100, autoAlpha: 0, force3D: true },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.9,
          ease: "power2.out",
          scrollTrigger: {
            trigger: footer,
            start: "top 90%"
          }
        }
      );
    }

    console.log("✅ Scroll animations (fixed parallax)");
  }

  initHeaderBlend() {
    const heroSection = document.querySelector(".full-bleed, .hero-section, .page-hero");
    if (!heroSection) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            document.body.classList.add("is-at-hero");
          } else {
            document.body.classList.remove("is-at-hero");
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(heroSection);
    console.log("✅ Header blend mode activated");
  }

  initDynamicIsland() {
    if (document.getElementById("dynamicIsland")) {
      this.dynamicIsland = new DynamicIslandNav(this.lenis);
    }
  }

  detectPage() {
    const body = document.body;

    if (body.classList.contains("page-home")) this.initHomepage();
    if (body.classList.contains("page-studio")) this.initStudioPage();
    if (body.classList.contains("page-story")) this.initStoryPage();
    if (body.classList.contains("page-project")) this.initProjectPage();
  }

  initHomepage() {
    document.querySelectorAll('.stat-value').forEach(stat => {
      const text = stat.textContent.trim();

      const match = text.match(/([\d.]+)/);
      if (!match) return;

      const value = parseFloat(match[1]);
      const prefix = text.substring(0, match.index);
      const suffix = text.substring(match.index + match[1].length);

      gsap.fromTo(stat,
        { textContent: 0 },
        {
          textContent: value,
          duration: 2.5,
          ease: "power1.out",
          snap: { textContent: value < 10 ? 0.1 : 1 },
          scrollTrigger: {
            trigger: stat,
            start: "top 80%"
          },
          onUpdate: function() {
            const current = gsap.getProperty(stat, "textContent");
            stat.textContent = prefix + (value < 10 ? current.toFixed(1) : Math.round(current)) + suffix;
          }
        }
      );
    });

    console.log("✅ Homepage stats");
  }

  initStudioPage() {
    console.log("✅ Studio page ready");
  }

  initStoryPage() {
    console.log("✅ Story page ready");
  }

  initProjectPage() {
    console.log("✅ Project page ready");
  }

  handleResize() {
    let ticking = false;

    window.addEventListener("resize", () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          ScrollTrigger.refresh();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  refresh() {
    ScrollTrigger.refresh();
  }

  destroy() {
    ScrollTrigger.getAll().forEach(st => st.kill());
    gsap.globalTimeline.clear();
    if (this.lenis) this.lenis.destroy();
  }
}

/* ==============================================================
   DYNAMIC ISLAND NAVIGATION (PREMIUM VERSION)
   ============================================================== */
class ScrambleText {
  constructor(element) {
    this.element = element;
    this.chars = "!#$%&'()*+,-./:;<=>?@[]^_`{|}~";
    this.originalText = element.textContent;
  }

  scramble(newText, duration = 0.6) {
    const oldText = this.element.textContent;
    const maxLength = Math.max(oldText.length, newText.length);
    const frames = Math.round(duration * 60);
    
    let f = 0;
    clearInterval(this._id);
    
    this._id = setInterval(() => {
      f++;
      let out = "";
      
      for (let i = 0; i < maxLength; i++) {
        if (i / maxLength < f / frames) {
          out += newText[i] || "";
        } else {
          out += this.chars[Math.floor(Math.random() * this.chars.length)];
        }
      }
      
      this.element.textContent = out;
      
      if (f >= frames) {
        clearInterval(this._id);
        this.element.textContent = newText;
      }
    }, 1000 / 60);
  }
}

class DynamicIslandNav {
  constructor(lenisInstance = null) {
    this.lenis = lenisInstance;
    this.sections = [...document.querySelectorAll('[data-nav-section]')]
      .map((sec, i) => (sec.dataset.index = i, sec));
    
    if (!this.sections.length) return;
    
    this.island = document.getElementById('dynamicIsland');
    this.textWrapper = this.island?.querySelector('.text-content');
    this.scrambler = new ScrambleText(this.textWrapper);
    this.prevBtn = document.getElementById('prevBtn');
    this.nextBtn = document.getElementById('nextBtn');
    this.progressBar = document.getElementById('progressBar');
    this.menuBtn = document.getElementById('menuButton');
    this.menuPanel = document.getElementById('menuPanel');
    this.menuItems = [...this.menuPanel?.querySelectorAll('.menu-item') || []];

    this.state = {
      idx: 0,
      expanded: false,
      menu: false,
      isAnimating: false,
      idleTimeout: null,
      morphTimeout: null
    };

    this.sections.forEach(sec => {
      if (!sec.dataset.navTitle) {
        const h = sec.querySelector('h1, h2, h3');
        sec.dataset.navTitle = h ? h.textContent.trim() : `Section ${sec.dataset.index}`;
      }
    });

    this.bind();
    this.observe();
    this.updateUI(0, true);
    this.updatePageMenu();
    this.startIdleAnimation();
  }

  observe() {
    this.sections.forEach(sec => {
      new IntersectionObserver(([e]) => {
        e.isIntersecting && this.updateUI(+e.target.dataset.index);
      }, { threshold: 0.6 }).observe(sec);
    });
  }

  bind() {
    this.island.addEventListener('click', e => {
      if (e.target.closest('.nav-arrow')) return;
      this.toggleExpand();
    });

    this.prevBtn.addEventListener('click', e => {
      e.stopPropagation();
      this.go(this.state.idx - 1);
    });

    this.nextBtn.addEventListener('click', e => {
      e.stopPropagation();
      this.go(this.state.idx + 1);
    });

    this.menuBtn.addEventListener('click', e => {
      e.stopPropagation();
      this.toggleMenu();
    });

    document.addEventListener('click', e => {
      if (!this.island.contains(e.target) && !this.menuBtn.contains(e.target)) {
        this.toggleExpand(false);
        this.toggleMenu(false);
      }
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') this.go(this.state.idx - 1);
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') this.go(this.state.idx + 1);
      if (e.key === 'Escape') {
        this.toggleExpand(false);
        this.toggleMenu(false);
      }
    });

    let touchStartY = 0;
    this.island.addEventListener('touchstart', e => {
      touchStartY = e.touches[0].clientY;
    });

    this.island.addEventListener('touchend', e => {
      const touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartY - touchEndY;
      if (Math.abs(diff) > 50) {
        this.go(this.state.idx + (diff > 0 ? 1 : -1));
      }
    });
  }

  startIdleAnimation() {
    if (this.state.morphTimeout) {
      clearTimeout(this.state.morphTimeout);
    }

    if (!this.state.expanded && !this.state.menu) {
      this.state.morphTimeout = setTimeout(() => {
        if (!this.state.expanded && !this.state.menu) {
          this.glitchText();
          this.startIdleAnimation();
        }
      }, 3000 + Math.random() * 2000);
    }
  }

  glitchText() {
    const currentText = this.textWrapper.textContent;
    const glitchChars = "!@#$%^&*()_+";
    
    this.textWrapper.classList.add('glitching');
    
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
        this.textWrapper.textContent = glitched;
        glitchCount++;
      } else {
        clearInterval(glitchInterval);
        this.textWrapper.textContent = currentText;
        this.textWrapper.classList.remove('glitching');
      }
    }, 50);
  }

  updateUI(i, init = false) {
    if (i === this.state.idx && !init) return;
    this.state.idx = i;
    const title = this.sections[i].dataset.navTitle.toUpperCase();
    
    if (!init) {
      this.updateText(title);
    } else {
      this.textWrapper.textContent = title;
    }

    this.sections.forEach(s => s.classList.toggle('active', +s.dataset.index === i));
    gsap.to(this.progressBar, {
      width: `${(i + 1) / this.sections.length * 100}%`,
      duration: 0.6,
      ease: "power2.out"
    });

    this.menuItems.forEach(li => {
      const href = li.getAttribute('href');
      const currentPage = window.location.pathname.split('/').pop() || 'index.html';
      li.classList.toggle('active', href === currentPage);
    });
  }

  updateText(newText) {
    if (this.state.isAnimating) return;
    this.state.isAnimating = true;

    if (this.state.morphTimeout) {
      clearTimeout(this.state.morphTimeout);
    }

    this.scrambler.scramble(newText, 0.6);
    
    setTimeout(() => {
      this.state.isAnimating = false;
      if (!this.state.expanded) {
        this.startIdleAnimation();
      }
    }, 600);
  }

  go(i) {
    if (this.state.isAnimating) return;
    
    const clampedIndex = Math.max(0, Math.min(this.sections.length - 1, i));
    if (clampedIndex === this.state.idx) return;

    if (this.lenis) {
      this.lenis.scrollTo(this.sections[clampedIndex], {
        offset: 0,
        duration: 1.1,
        easing: (t) => 1 - Math.pow(1 - t, 3)
      });
    } else {
      gsap.to(window, {
        scrollTo: { y: this.sections[clampedIndex], autoKill: false },
        duration: 1,
        ease: "power2.inOut"
      });
    }
  }

  toggleExpand(force) {
    const exp = force !== undefined ? force : !this.state.expanded;
    if (exp === this.state.expanded) return;
    this.state.expanded = exp;
    this.island.classList.toggle('expanded', exp);

    gsap.to(this.island, {
      width: exp ? 'var(--island-width-expanded)' : 'var(--island-width-collapsed)',
      duration: 0.4,
      ease: "expandEase"
    });

    gsap.to([this.prevBtn, this.nextBtn], {
      opacity: exp ? 1 : 0,
      scale: exp ? 1 : 0.6,
      pointerEvents: exp ? 'all' : 'none',
      duration: 0.3,
      ease: "power2.inOut",
      stagger: exp ? 0.05 : 0
    });

    if (exp) {
      if (this.state.morphTimeout) {
        clearTimeout(this.state.morphTimeout);
      }
    } else {
      this.startIdleAnimation();
    }
  }

  toggleMenu(force = null) {
    const shouldOpen = force !== null ? force : !this.state.menu;
    this.state.menu = shouldOpen;

    this.menuBtn.classList.toggle('menu-open', shouldOpen);

    gsap.to(this.menuPanel, {
      opacity: shouldOpen ? 1 : 0,
      scale: shouldOpen ? 1 : 0.8,
      pointerEvents: shouldOpen ? 'all' : 'none',
      duration: 0.3,
      ease: "power2.inOut"
    });

    if (shouldOpen) {
      gsap.fromTo(this.menuItems,
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.3, stagger: 0.03, delay: 0.1 }
      );
    }
  }

  updatePageMenu() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    this.menuItems.forEach(item => {
      const href = item.getAttribute('href');
      item.classList.toggle('active', href === currentPage);
    });
  }
}

/* ═════════════════════════════════════════════════════════════
   INITIALIZE
   ═════════════════════════════════════════════════════════════ */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.m0narqAnimations = new M0NARQ_Animations();
  });
} else {
  window.m0narqAnimations = new M0NARQ_Animations();
}
