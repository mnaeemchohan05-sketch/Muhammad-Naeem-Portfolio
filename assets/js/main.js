// =========================
// Global Setup & Animations
// =========================
// Ensure preloader is hidden even if other scripts fail to execute
window.addEventListener('load', () => {
  try {
    const loader = document.getElementById('preloader');
    if (loader) loader.classList.add('hidden');
  } catch (e) {
    // silent
  }
});

document.addEventListener('DOMContentLoaded', () => {
  try {
  // Navbar color change on scroll + progress bar
  const nav = document.getElementById('navbar');
  const progress = document.getElementById('scroll-progress');
  const scrollTopBtn = document.getElementById('scrollTop');
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');

  const onScroll = () => {
    const doc = document.documentElement;
    const scrolled = (doc.scrollTop || document.body.scrollTop);
    const height = doc.scrollHeight - doc.clientHeight;
    const pct = Math.min(100, (scrolled / height) * 100);
    progress.style.width = pct + '%';
    if (nav) {
      if (scrolled > 20) nav.classList.add('scrolled'); else nav.classList.remove('scrolled');
    }
    if (scrollTopBtn) scrollTopBtn.style.opacity = scrolled > 300 ? '1' : '0';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Smooth scroll for internal anchors using CSS scroll-margin-top for offset
  // and `scrollIntoView` to keep behavior simple and allow native fallbacks.
  const updateNavHeightVar = () => {
    if (nav && nav.offsetHeight) {
      document.documentElement.style.setProperty('--nav-height', nav.offsetHeight + 'px');
    }
  };
  updateNavHeightVar();
  window.addEventListener('resize', updateNavHeightVar);

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      if (anchor.classList.contains('js-project-view')) return; // modal triggers handled separately
      const targetId = anchor.getAttribute('href');
      if (targetId && targetId !== '#') {
        const el = document.querySelector(targetId);
        if (el) {
          e.preventDefault();
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }
      // if element not found we let browser handle default (maybe anchor or noop)
    });
  });

  // Scroll to top
  if (scrollTopBtn) {
    scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

   // Scroll spy: active section highlight
  const navLinks = Array.from(document.querySelectorAll('a.nav-link[href^="#"]'));
  const sections = navLinks
    .map(l => document.querySelector(l.getAttribute('href')))
    .filter(Boolean);
  if (sections.length) {
    // create moving underline indicator
    let indicator;
    if (nav) {
      indicator = document.getElementById('nav-indicator') || (() => {
        const el = document.createElement('div');
        el.id = 'nav-indicator';
        nav.appendChild(el);
        return el;
      })();
    }
    const positionIndicator = (link) => {
      if (!nav || !indicator || !link) return;
      const nr = nav.getBoundingClientRect();
      const lr = link.getBoundingClientRect();
      indicator.style.width = lr.width + 'px';
      indicator.style.left = (lr.left - nr.left) + 'px';
    };
    const setActive = (id) => {
      navLinks.forEach(l => {
        const match = l.getAttribute('href') === id;
        l.classList.toggle('active', match);
        if (match) positionIndicator(l);
      });
    };
    // Use navbar height to offset intersection root so active state accounts for fixed header
    const navHeightForSpy = (nav && nav.offsetHeight) ? nav.offsetHeight : 70;
    const ioSpy = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActive('#' + entry.target.id);
        }
      });
    }, { rootMargin: `-${navHeightForSpy}px 0px 0px 0px`, threshold: 0.5 });
    sections.forEach(s => ioSpy.observe(s));
    window.addEventListener('resize', () => {
      const active = document.querySelector('.navbar .nav-link.active');
      if (active) positionIndicator(active);
    });
  }

  // Hamburger animation on collapse events (mobile menu)
  if (navMenu && hamburger && window.bootstrap) {
    navMenu.addEventListener('shown.bs.collapse', () => hamburger.classList.add('active'));
    navMenu.addEventListener('hidden.bs.collapse', () => hamburger.classList.remove('active'));
  }

  // Collapse mobile menu when a nav link is clicked (useful on small screens)
  document.querySelectorAll('.nav-link[href^="#"]').forEach(link => {
    link.addEventListener('click', () => {
      try {
        if (navMenu && navMenu.classList.contains('show') && window.bootstrap) {
          const collapseInstance = bootstrap.Collapse.getInstance(navMenu) || new bootstrap.Collapse(navMenu, { toggle: false });
          collapseInstance.hide();
        }
      } catch (err) {
        // fail silently if bootstrap object isn't available
        // (keeps behavior safe and avoids console errors)
      }
    });
  });

  // AOS (Animate On Scroll) - replay animations on every scroll in/out
  const forceShowAosElements = () => {
    try {
      document.querySelectorAll('[data-aos]').forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.classList.add('aos-animate');
      });
      document.body.classList.add('aos-fallback');
    } catch (_) {}
  };
  if (window.AOS && typeof AOS.init === 'function') {
    try {
      AOS.init({
        duration: 1000,
        once: false,
        mirror: true,
        offset: 80,
        easing: 'ease-out-quart',
      });
      setTimeout(() => {
        const hasAnyAnimated = !!document.querySelector('.aos-animate');
        if (!hasAnyAnimated) forceShowAosElements();
      }, 800);
    } catch (e) {
      forceShowAosElements();
    }
  } else {
    forceShowAosElements();
  }


  // GSAP Page Intro Animation (aligned with current hero classes)
  if (window.gsap) {
    const splitWords = (el) => {
      if (!el) return [];
      const text = el.textContent.trim().split(' ');
      el.innerHTML = text.map(w => `<span class="split-word" style="display:inline-block">${w}</span>`).join(' ');
      return Array.from(el.querySelectorAll('.split-word'));
    };
    window.addEventListener('load', () => {
      const loader = document.getElementById('preloader');
      const nameEl = document.querySelector('.name');
      const titleEl = document.querySelector('.title');
      const words = [...splitWords(nameEl), ...splitWords(titleEl)];
      const tl = gsap.timeline();
      if (loader) {
        tl.to(loader, { opacity: 0, duration: 0.4, ease: 'power2.out', onComplete: () => loader.classList.add('hidden') });
      }
      tl.from('.intro', { y: 16, opacity: 0, duration: 0.45, ease: 'power3.out' }, '-=0.1')
        .from(words, { y: 20, opacity: 0, duration: 0.6, stagger: 0.05, ease: 'power2.out' }, '-=0.05')
        .from('.skills-line', { y: 14, opacity: 0, duration: 0.45 }, '-=0.25')
        .from('.hero-buttons a', { y: 12, opacity: 0, duration: 0.4, stagger: 0.08 }, '-=0.25')
        .from('.image-box', { y: 18, opacity: 0, duration: 0.6, ease: 'power2.out' }, '-=0.4');
    });
  }

  // Preloader hide when page fully loaded
  window.addEventListener('load', () => {
    const loader = document.getElementById('preloader');
    if (loader) loader.classList.add('hidden');
  });

  // Animated Counters when in view (replay when re-entering viewport)
  const counters = document.querySelectorAll('.counter');
  if (counters.length) {
    const animateCounter = (el) => {
      const target = parseInt(el.getAttribute('data-counter-target') || '0', 10);
      const duration = 1200;
      let start = 0;
      const startTime = performance.now();
      const step = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const value = Math.floor(progress * target);
        el.textContent = value.toString();
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const el = entry.target;
        if (entry.isIntersecting) {
          animateCounter(el);
        } else {
          el.textContent = '0';
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(c => io.observe(c));
  }

  // Skills: animate progress bars when in view (replay on re-enter)
  const pbs = document.querySelectorAll('.progress-bar[data-skill]');
  if (pbs.length) {
    const ioBars = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const bar = entry.target;
        const pct = parseInt(bar.getAttribute('data-skill') || '0', 10);
        const valEl = bar.closest('.skill') ? bar.closest('.skill').querySelector('.skill-value') : null;
        if (entry.isIntersecting) {
          bar.style.width = pct + '%';
          if (valEl) {
            const startTime = performance.now();
            const duration = 1000;
            const step = (now) => {
              const t = Math.min((now - startTime) / duration, 1);
              const v = Math.floor(t * pct);
              valEl.textContent = v + '%';
              if (t < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
          }
        } else {
          bar.style.width = '0%';
          if (valEl) valEl.textContent = '0%';
        }
      });
    }, { threshold: 0.4 });
    pbs.forEach(b => ioBars.observe(b));
  }

  // Parallax effect for hero shapes
  const shapes = document.querySelectorAll('.floating-shape');
  window.addEventListener('scroll', () => {
    const offset = window.pageYOffset || document.documentElement.scrollTop || 0;
    shapes.forEach((el, i) => {
      const depth = (i + 1) * 0.04;
      el.style.transform = `translateY(${-(offset * depth)}px)`;
    });
  }, { passive: true });

  // Project "View Details" modal handler
  document.querySelectorAll('.js-project-view').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopImmediatePropagation();
      const card = btn.closest('.project-card');
      if (!card) return;
      const title = (card.querySelector('h5') && card.querySelector('h5').textContent.trim()) || 'Project';
      const desc = (card.querySelector('p') && card.querySelector('p').textContent.trim()) || '';
      const thumb = card.querySelector('.project-thumb');
      let imgUrl = '';
      if (thumb) {
        const bg = getComputedStyle(thumb).backgroundImage || '';
        const start = bg.indexOf('url(');
        const end = bg.lastIndexOf(')');
        if (start !== -1 && end !== -1) imgUrl = bg.slice(start + 4, end).replace(/["']/g, '');
      }
      const modal = document.getElementById('projectModal');
      if (modal && window.bootstrap) {
        const label = modal.querySelector('#projectModalLabel');
        const bodyDesc = modal.querySelector('#projectModalDesc');
        const imageBox = modal.querySelector('.project-modal-image');
        if (label) label.textContent = title;
        if (bodyDesc) bodyDesc.textContent = desc;
        if (imageBox) imageBox.style.backgroundImage = imgUrl ? `url('${imgUrl}')` : 'none';
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();
      } else {
        const target = document.querySelector('#projects');
        if (target) {
          const navHeight = (nav && nav.offsetHeight) ? nav.offsetHeight : 70;
          const yOffset = -navHeight;
          const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }
    });
  });
  // Button ripple effect
  document.querySelectorAll('.ripple').forEach(btn => {
    btn.addEventListener('click', function (e) {
      const rect = this.getBoundingClientRect();
      const circle = document.createElement('span');
      const d = Math.max(rect.width, rect.height);
      circle.style.width = circle.style.height = d + 'px';
      circle.style.left = (e.clientX - rect.left - d / 2) + 'px';
      circle.style.top = (e.clientY - rect.top - d / 2) + 'px';
      circle.classList.add('ripple-circle');
      this.appendChild(circle);
      setTimeout(() => circle.remove(), 600);
    });
  });

  // Contact form (client-side success animation only)
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
      }
      const success = document.getElementById('form-success');
      if (success) {
        success.classList.remove('d-none');
        success.style.opacity = '0';
        requestAnimationFrame(() => {
          success.style.transition = 'opacity .4s ease';
          success.style.opacity = '1';
        });
        setTimeout(() => {
          success.style.opacity = '0';
          setTimeout(() => success.classList.add('d-none'), 400);
        }, 2500);
      }
      form.reset();
    });
  }

  // (Particles.js not used now - hero uses animated blue gradient background)

  // Custom cursor (desktop only)
  const cursor = document.getElementById('cursor');
  if (cursor && window.matchMedia('(pointer:fine)').matches) {
    let x = 0, y = 0;
    const follow = (e) => {
      x = e.clientX; y = e.clientY;
      const scale = cursor.classList.contains('cursor-active') ? 1.3 : 1;
      cursor.style.transform = `translate(${x}px, ${y}px) translate(-50%,-50%) scale(${scale})`;
    };
    window.addEventListener('mousemove', follow, { passive: true });
    window.addEventListener('mousedown', () => {
      const scale = cursor.classList.contains('cursor-active') ? 1.4 : 1.2;
      cursor.style.transform = `translate(${x}px, ${y}px) translate(-50%,-50%) scale(${scale})`;
    });
    window.addEventListener('mouseup', () => {
      const scale = cursor.classList.contains('cursor-active') ? 1.3 : 1;
      cursor.style.transform = `translate(${x}px, ${y}px) translate(-50%,-50%) scale(${scale})`;
    });
    document.querySelectorAll('a, button, .btn, [role="button"]').forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('cursor-active'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-active'));
    });
  } else if (cursor) {
    cursor.style.display = 'none';
  }

  // 3D tilt effect on cards (desktop only)
  if (window.matchMedia('(pointer:fine)').matches) {
    const tiltEls = document.querySelectorAll('.tilt');
    tiltEls.forEach(el => {
      const rect = () => el.getBoundingClientRect();
      const enter = () => el.style.transition = 'transform .1s ease-out';
      const leave = () => {
        el.style.transition = 'transform .4s ease';
        el.style.transform = 'rotateX(0) rotateY(0)';
      };
      const move = (e) => {
        const r = rect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        const rx = (-py * 10).toFixed(2);
        const ry = (px * 12).toFixed(2);
        el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      };
      el.addEventListener('mouseenter', enter);
      el.addEventListener('mousemove', move);
      el.addEventListener('mouseleave', leave);
    });
  }

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    const revealEls = gsap.utils.toArray('#about .glass-card, #skills .glass-card, #services .service-card, #projects .project-card, #education .timeline, #objective .objective-card, #contact .glass-card, #tech .tech-item, #stats .counter-card');
    revealEls.forEach((el) => {
      gsap.from(el, {
        y: 24,
        opacity: 0,
        scale: 0.98,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none reset'
        }
      });
    });
    const titles = gsap.utils.toArray('.section-title');
    titles.forEach((t) => {
      gsap.from(t, {
        y: 18,
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: t,
          start: 'top 90%',
          toggleActions: 'play none none reset'
        }
      });
    });
  }

  const timeline = document.querySelector('.timeline');
  if (timeline) {
    const ioT = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) timeline.classList.add('animate'); else timeline.classList.remove('animate');
      });
    }, { threshold: 0.3 });
    ioT.observe(timeline);
  }

  let lastY = 0;
  const onScrollNav = () => {
    const y = window.pageYOffset || document.documentElement.scrollTop || 0;
    const down = y > lastY;
    if (nav) {
      if (navMenu && navMenu.classList.contains('show')) {
        nav.classList.remove('nav-hide');
      } else {
        if (down && y > 120) nav.classList.add('nav-hide'); else nav.classList.remove('nav-hide');
      }
    }
    if (scrollTopBtn) {
      if (y > 300) scrollTopBtn.classList.add('show'); else scrollTopBtn.classList.remove('show');
    }
    lastY = y;
  };
  window.addEventListener('scroll', onScrollNav, { passive: true });
  onScrollNav();
  } catch (err) {
    // Prevent script errors from stopping page rendering
    // Log to console for debugging but keep UI visible
    console.error('Error in main DOMContentLoaded handler:', err);
  }
});
