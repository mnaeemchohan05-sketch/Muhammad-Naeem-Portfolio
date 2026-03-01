const hidePreloader = () => {
  const loader = document.getElementById('preloader');
  if (!loader) return;
  loader.classList.add('hidden');
};

window.addEventListener('load', () => {
  setTimeout(hidePreloader, 120);
});

document.addEventListener('DOMContentLoaded', () => {
  try {
    // Do not block content visibility until every external asset finishes loading.
    setTimeout(hidePreloader, 450);

    const nav = document.getElementById('navbar');
    const progress = document.getElementById('scroll-progress');
    const scrollTopBtn = document.getElementById('scrollTop');
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');

    const isMobile = window.matchMedia('(max-width: 767.98px)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isFinePointer = window.matchMedia('(pointer:fine)').matches;
    document.body.classList.add('js-ready');

    const updateNavHeightVar = () => {
      if (!nav) return;
      document.documentElement.style.setProperty('--nav-height', `${nav.offsetHeight || 72}px`);
    };

    updateNavHeightVar();
    window.addEventListener('resize', updateNavHeightVar, { passive: true });

    let lastY = 0;
    let ticking = false;
    const renderScroll = () => {
      const doc = document.documentElement;
      const y = window.pageYOffset || doc.scrollTop || 0;
      const height = Math.max(1, doc.scrollHeight - doc.clientHeight);

      if (progress) {
        const pct = Math.min(100, (y / height) * 100);
        progress.style.transform = `scaleX(${pct / 100})`;
      }

      if (nav) {
        nav.classList.toggle('scrolled', y > 16);
        if (navMenu && navMenu.classList.contains('show')) {
          nav.classList.remove('nav-hide');
        } else {
          nav.classList.toggle('nav-hide', y > 120 && y > lastY);
        }
      }

      if (scrollTopBtn) {
        scrollTopBtn.classList.toggle('show', y > 320);
      }

      lastY = y;
      ticking = false;
    };

    window.addEventListener(
      'scroll',
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(renderScroll);
      },
      { passive: true }
    );
    renderScroll();

    if (nav) {
      requestAnimationFrame(() => nav.classList.add('nav-ready'));
    }

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (!href || href === '#') return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();
        target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
      });
    });

    if (scrollTopBtn) {
      scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      });
    }

    if (navMenu && hamburger && window.bootstrap) {
      navMenu.addEventListener('shown.bs.collapse', () => hamburger.classList.add('active'));
      navMenu.addEventListener('hidden.bs.collapse', () => hamburger.classList.remove('active'));

      document.querySelectorAll('.nav-link[href^="#"]').forEach((link) => {
        link.addEventListener('click', () => {
          if (!navMenu.classList.contains('show')) return;
          const collapse = bootstrap.Collapse.getInstance(navMenu) || new bootstrap.Collapse(navMenu, { toggle: false });
          collapse.hide();
        });
      });
    }

    const navLinks = Array.from(document.querySelectorAll('.nav-link[href^="#"]'));
    const sections = navLinks.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
    if (sections.length) {
      const navOffset = nav ? nav.offsetHeight : 70;
      const spyObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const id = `#${entry.target.id}`;
            navLinks.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === id));
          });
        },
        { rootMargin: `-${navOffset}px 0px -50% 0px`, threshold: 0.14 }
      );
      sections.forEach((section) => spyObserver.observe(section));
    }

    const splitParagraphLines = (selector) => {
      const p = document.querySelector(selector);
      if (!p) return [];
      if (p.dataset.splitDone === '1') {
        return Array.from(p.querySelectorAll('.line'));
      }
      const original = p.textContent.trim().replace(/\s+/g, ' ');
      const lines = original
        .split('. ')
        .map((line) => line.trim())
        .filter(Boolean)
        .map((line, i, arr) => (i === arr.length - 1 || line.endsWith('.') ? line : `${line}.`));
      p.innerHTML = lines.map((line) => `<span class="line">${line}</span>`).join(' ');
      p.dataset.splitDone = '1';
      return Array.from(p.querySelectorAll('.line'));
    };

    const splitWords = (selector, cls) => {
      const el = document.querySelector(selector);
      if (!el) return [];
      if (el.dataset.splitDone === '1') {
        return Array.from(el.querySelectorAll(`.${cls}`));
      }
      const text = el.textContent.trim().replace(/\s+/g, ' ');
      const words = text.split(' ').filter(Boolean);
      el.innerHTML = words.map((word) => `<span class="${cls}">${word}</span>`).join(' ');
      el.dataset.splitDone = '1';
      return Array.from(el.querySelectorAll(`.${cls}`));
    };

    const typeText = (el, fullText, startDelay, speed) => {
      if (!el) return;
      gsap.delayedCall(startDelay, () => {
        el.textContent = '';
        let idx = 0;
        const tick = () => {
          if (idx >= fullText.length) return;
          idx += 1;
          el.textContent = fullText.slice(0, idx);
          setTimeout(tick, speed);
        };
        tick();
      });
    };

    const initMagnetic = () => {
      if (isMobile || prefersReducedMotion || !isFinePointer) return;
      document.querySelectorAll('.hero-buttons a').forEach((btn) => {
        btn.addEventListener('mousemove', (e) => {
          const rect = btn.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          gsap.to(btn, { x: x * 0.12, y: y * 0.2, duration: 0.2, ease: 'power2.out' });
        });
        btn.addEventListener('mouseleave', () => {
          gsap.to(btn, { x: 0, y: 0, duration: 0.25, ease: 'power2.out' });
        });
      });
    };

    const initHeroParallax = () => {
      if (isMobile || prefersReducedMotion || !isFinePointer) return;
      const hero = document.getElementById('home');
      if (!hero) return;
      const gradient = hero.querySelector('.hero-gradient');
      const image = hero.querySelector('.image-box');

      hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;

        if (gradient) {
          gsap.to(gradient, { x: px * 12, y: py * 10, duration: 0.35, ease: 'power2.out' });
        }
        if (image) {
          gsap.to(image, { x: px * 6, y: py * 5, duration: 0.35, ease: 'power2.out' });
        }
      });

      hero.addEventListener('mouseleave', () => {
        if (gradient) gsap.to(gradient, { x: 0, y: 0, duration: 0.4, ease: 'power2.out' });
        if (image) gsap.to(image, { x: 0, y: 0, duration: 0.4, ease: 'power2.out' });
      });
    };

    const initRipple = () => {
      document.querySelectorAll('.ripple').forEach((el) => {
        el.addEventListener('click', (e) => {
          if (isMobile || el.tagName === 'A') return;
          const rect = el.getBoundingClientRect();
          const circle = document.createElement('span');
          const d = Math.max(rect.width, rect.height);
          circle.style.width = circle.style.height = `${d}px`;
          circle.style.left = `${e.clientX - rect.left - d / 2}px`;
          circle.style.top = `${e.clientY - rect.top - d / 2}px`;
          circle.className = 'ripple-circle';
          el.appendChild(circle);
          setTimeout(() => circle.remove(), 520);
        });
      });
    };

    const initCursor = () => {
      const cursor = document.getElementById('cursor');
      if (!cursor) return;

      if (isMobile || prefersReducedMotion || !isFinePointer) {
        cursor.style.display = 'none';
        return;
      }

      let x = window.innerWidth / 2;
      let y = window.innerHeight / 2;
      let targetX = x;
      let targetY = y;
      let rafId = 0;

      const render = () => {
        x += (targetX - x) * 0.22;
        y += (targetY - y) * 0.22;
        cursor.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`;
        rafId = requestAnimationFrame(render);
      };

      const onMove = (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
        if (!rafId) {
          rafId = requestAnimationFrame(render);
        }
      };

      window.addEventListener('mousemove', onMove, { passive: true });

      document
        .querySelectorAll('a, button, .btn, input, textarea, .service-card, .project-card')
        .forEach((el) => {
          el.addEventListener('mouseenter', () => cursor.classList.add('cursor-active'));
          el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-active'));
        });
    };

    const initForm = () => {
      const form = document.getElementById('contact-form');
      const submitBtn = document.getElementById('contact-submit');
      const successBox = document.getElementById('form-success');
      const errorBox = document.getElementById('form-error');
      if (!form) return;

      const safeJson = async (response) => {
        try {
          return await response.json();
        } catch (_) {
          return null;
        }
      };

      const isConfiguredValue = (value, options = {}) => {
        const raw = String(value || '').trim();
        if (!raw) return false;
        const normalized = raw.toLowerCase();
        const placeholderTokens = ['your_', 'your-', 'your ', 'example', 'changeme', 'replace', '<', '>', '{', '}'];
        if (placeholderTokens.some((token) => normalized.includes(token))) return false;
        if (options.isFormspreeEndpoint) {
          return /^https:\/\/.+/i.test(raw);
        }
        return true;
      };

      const showMessage = (type, message) => {
        if (successBox) successBox.classList.add('d-none');
        if (errorBox) errorBox.classList.add('d-none');

        const node = type === 'success' ? successBox : errorBox;
        if (!node) return;

        node.textContent = message;
        node.classList.remove('d-none');
        if (window.gsap) {
          gsap.fromTo(node, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.28, ease: 'power2.out' });
        }
      };

      const isNativeFormSubmitMode =
        /formsubmit\.co/i.test(form.getAttribute('action') || '') &&
        (form.getAttribute('method') || 'get').toLowerCase() === 'post';

      if (isNativeFormSubmitMode) {
        // Native FormSubmit mode keeps delivery backend-free and avoids fetch/CORS/provider-chain issues.
        // We remove `novalidate` so browser validation runs before the form is sent.
        form.removeAttribute('novalidate');

        form.addEventListener('submit', (e) => {
          const nameInput = document.getElementById('name');
          const emailInput = document.getElementById('email');
          const messageInput = document.getElementById('message');

          if (nameInput) nameInput.value = nameInput.value.trim();
          if (emailInput) emailInput.value = emailInput.value.trim();
          if (messageInput) messageInput.value = messageInput.value.trim();

          if (!form.checkValidity()) {
            e.preventDefault();
            form.classList.add('was-validated');
            showMessage('error', 'Please complete all required fields correctly.');
            return;
          }

          if (successBox) successBox.classList.add('d-none');
          if (errorBox) errorBox.classList.add('d-none');
          if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.setAttribute('aria-busy', 'true');
          }
        });

        return;
      }

      const serviceId = form.dataset.emailjsService || '';
      const templateId = form.dataset.emailjsTemplate || '';
      const publicKey = form.dataset.emailjsPublicKey || '';
      const formspreeEndpoint = form.dataset.formspreeEndpoint || '';
      const backendEndpoint = form.dataset.backendEndpoint || '';
      const formsubmitEmail = form.dataset.formsubmitEmail || '';
      const emailjsConfigured =
        isConfiguredValue(serviceId) &&
        isConfiguredValue(templateId) &&
        isConfiguredValue(publicKey);
      const formspreeConfigured = isConfiguredValue(formspreeEndpoint, { isFormspreeEndpoint: true });
      const backendConfigured = isConfiguredValue(backendEndpoint) && (backendEndpoint.startsWith('/') || /^https?:\/\//i.test(backendEndpoint));
      const formsubmitConfigured = isConfiguredValue(formsubmitEmail) && formsubmitEmail.includes('@');

      if (emailjsConfigured && window.emailjs && typeof window.emailjs.init === 'function') {
        window.emailjs.init({ publicKey });
      }

      form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const messageInput = document.getElementById('message');

        if (nameInput) nameInput.value = nameInput.value.trim();
        if (emailInput) emailInput.value = emailInput.value.trim();
        if (messageInput) messageInput.value = messageInput.value.trim();

        if (!form.checkValidity()) {
          form.classList.add('was-validated');
          showMessage('error', 'Please complete all required fields correctly.');
          return;
        }

        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.setAttribute('aria-busy', 'true');
        }

        const params = {
          from_name: (nameInput?.value || '').trim(),
          reply_to: (emailInput?.value || '').trim(),
          message: (messageInput?.value || '').trim(),
          sent_at: new Date().toLocaleString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
        };

        try {
          // Provider chain keeps delivery resilient across static hosting environments.
          const providers = [];

          if (backendConfigured) {
            providers.push({
              name: 'Backend',
              send: async () => {
                const response = await fetch(backendEndpoint, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                  },
                  body: JSON.stringify({
                    name: params.from_name,
                    email: params.reply_to,
                    message: params.message,
                    sent_at: params.sent_at,
                  }),
                });
                const data = await safeJson(response);
                const successFlag = data?.success ?? data?.ok;
                if (!response.ok || successFlag === false || successFlag === 'false') {
                  throw new Error('Backend submission failed');
                }
              },
            });
          }

          if (emailjsConfigured && window.emailjs && typeof window.emailjs.send === 'function') {
            providers.push({
              name: 'EmailJS',
              send: async () => {
                await window.emailjs.send(serviceId, templateId, params);
              },
            });
          }

          if (formspreeConfigured) {
            providers.push({
              name: 'Formspree',
              send: async () => {
                const response = await fetch(formspreeEndpoint, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                  },
                  body: JSON.stringify({
                    name: params.from_name,
                    email: params.reply_to,
                    message: params.message,
                    sent_at: params.sent_at,
                  }),
                });
                const data = await safeJson(response);
                const successFlag = data?.ok ?? data?.success;
                const explicitlyFailed =
                  successFlag === false ||
                  successFlag === 'false' ||
                  (Array.isArray(data?.errors) && data.errors.length > 0);
                if (!response.ok || explicitlyFailed) {
                  throw new Error('Formspree submission failed');
                }
              },
            });
          }

          if (formsubmitConfigured) {
            providers.push({
              name: 'FormSubmit',
              send: async () => {
                const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(formsubmitEmail)}`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                  },
                  body: JSON.stringify({
                    name: params.from_name,
                    email: params.reply_to,
                    message: params.message,
                    _subject: 'Portfolio Contact Message',
                    _captcha: 'false',
                    sent_at: params.sent_at,
                  }),
                });
                const data = await safeJson(response);
                const successFlag = data?.success;
                const explicitlyFailed = successFlag === false || successFlag === 'false';
                if (!response.ok || explicitlyFailed) {
                  throw new Error('FormSubmit delivery failed');
                }
              },
            });
          }

          if (!providers.length) {
            throw new Error('No form provider configured');
          }

          let sent = false;
          const providerErrors = [];
          for (const provider of providers) {
            try {
              await provider.send();
              sent = true;
              break;
            } catch (providerError) {
              providerErrors.push(`${provider.name}: ${providerError?.message || 'failed'}`);
            }
          }

          if (!sent) {
            throw new Error(providerErrors.join(' | ') || 'All providers failed');
          }

          form.reset();
          form.classList.remove('was-validated');
          showMessage('success', 'Thank you! Your message has been sent successfully.');
        } catch (error) {
          const details = error?.message ? ` (${error.message})` : '';
          showMessage('error', `Message could not be sent right now. Please verify your form provider setup.${details}`);
          console.error('Email send error:', error);
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.removeAttribute('aria-busy');
          }
        }
      });
    };

    const initGsap = () => {
      if (!window.gsap) return;
      const gsap = window.gsap;
      const ScrollTrigger = window.ScrollTrigger;
      if (ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

      const ease = 'power2.out';
      const heroMaster = gsap.timeline({ defaults: { ease, duration: isMobile ? 0.35 : 0.55 } });

      const introEl = document.querySelector('.intro');
      const nameEl = document.querySelector('.name');
      const titleEl = document.querySelector('.title');
      const introText = introEl ? introEl.textContent.trim() : '';
      const nameText = nameEl ? nameEl.textContent.trim() : '';
      const titleText = titleEl ? titleEl.textContent.trim() : '';

      if (!prefersReducedMotion) {
        heroMaster
          .from('.intro', { y: 14, opacity: 0 }, 0)
          .from('.name', { y: 14, opacity: 0 }, 0.06)
          .from('.title', { y: 14, opacity: 0 }, 0.12)
          .from('.skills-line', { y: 12, opacity: 0 }, 0.2)
          .from('.hero-buttons a', { y: 10, opacity: 0, stagger: 0.14 }, 0.24)
          .from('.image-box', { y: 14, opacity: 0 }, 0.14)
          .from('.scroll-indicator', { autoAlpha: 0, y: 8, duration: 0.35 }, 0.55);

        typeText(introEl, introText, 0.08, isMobile ? 24 : 18);
        typeText(nameEl, nameText, 0.36, isMobile ? 18 : 14);
        typeText(titleEl, titleText, 0.9, isMobile ? 20 : 15);
      }

      if (!isMobile && !prefersReducedMotion) {
        gsap.to('.image-box', {
          y: -6,
          repeat: -1,
          yoyo: true,
          duration: 3.2,
          ease: 'sine.inOut',
        });
      }

      const aboutLines = splitParagraphLines('.about-copy');
      const objectiveWords = splitWords('#objective .objective-card p', 'objective-word');

      // Use fromTo to avoid elements getting stuck at opacity:0 on refresh/re-init.
      const makeReveal = (targets, vars = {}, triggerStart = 'top 90%') => {
        if (!ScrollTrigger || prefersReducedMotion) return;
        const list = gsap.utils.toArray(targets);
        if (!list.length) return;
        const { stagger: customStagger, ...restVars } = vars;

        ScrollTrigger.batch(list, {
          start: triggerStart,
          once: true,
          onEnter: (batch) => {
            gsap.fromTo(
              batch,
              { y: 16, autoAlpha: 0 },
              {
                y: 0,
                autoAlpha: 1,
                clearProps: 'transform,opacity,visibility',
              duration: isMobile ? 0.35 : 0.52,
                stagger: Math.min(0.18, customStagger || 0.12),
              ease,
                overwrite: 'auto',
                ...restVars,
              }
            );
          },
        });
      };

      makeReveal('.section-title');
      makeReveal('#about .glass-card, #skills .skill-group, #services .service-card, #projects .project-card, #contact .glass-card, #why .why-card, #stats .counter-card, #objective .objective-card');
      makeReveal('#tech .tech-item', { stagger: 0.06 }, 'top 95%');

      if (ScrollTrigger && aboutLines.length && !isMobile && !prefersReducedMotion) {
        gsap.from(aboutLines, {
          y: 10,
          opacity: 0,
          duration: 0.4,
          stagger: 0.1,
          ease,
          scrollTrigger: {
            trigger: '#about',
            start: 'top 78%',
            once: true,
          },
        });
      }

      if (ScrollTrigger && objectiveWords.length && !isMobile && !prefersReducedMotion) {
        gsap.from(objectiveWords, {
          y: 9,
          opacity: 0,
          duration: 0.38,
          stagger: 0.02,
          ease,
          scrollTrigger: {
            trigger: '#objective .objective-card',
            start: 'top 85%',
            once: true,
          },
        });
      }

      const counters = gsap.utils.toArray('.counter[data-counter-target]');
      counters.forEach((counter) => {
        const target = Number(counter.getAttribute('data-counter-target') || 0);
        if (!ScrollTrigger || prefersReducedMotion || isMobile) {
          counter.textContent = String(target);
          return;
        }

        const state = { value: 0 };
        gsap.to(state, {
          value: target,
          duration: 0.85,
          ease: 'power1.out',
          onUpdate: () => {
            counter.textContent = String(Math.round(state.value));
          },
          scrollTrigger: {
            trigger: counter,
            start: 'top 90%',
            once: true,
          },
        });
      });

      const skillBars = gsap.utils.toArray('#skills .skill-progress-fill[data-level]');
      skillBars.forEach((bar) => {
        const level = Math.max(0, Math.min(100, Number(bar.getAttribute('data-level') || 0)));
        bar.dataset.level = String(level);
        // Keep the final width in DOM so bars remain visible even if animation is skipped.
        bar.style.width = `${level}%`;
      });

      if (skillBars.length && ScrollTrigger && !prefersReducedMotion) {
        ScrollTrigger.create({
          trigger: '#skills',
          start: 'top 84%',
          once: true,
          onEnter: () => {
            gsap.fromTo(skillBars, { width: 0 }, {
              width: (i, el) => `${el.dataset.level}%`,
              duration: isMobile ? 0.45 : 0.68,
              stagger: 0.05,
              ease: 'power2.out',
              overwrite: 'auto',
            });
          },
        });
      }

      if (ScrollTrigger) {
        ScrollTrigger.create({
          trigger: '#education .timeline',
          start: 'top 86%',
          once: true,
          onEnter: () => {
            const timeline = document.querySelector('.timeline');
            if (timeline) timeline.classList.add('animate');
            gsap.from('#education .timeline-item', {
              y: 14,
              opacity: 0,
              stagger: 0.12,
              duration: 0.46,
              ease,
            });
          },
        });

        ScrollTrigger.create({
          trigger: '#contact form',
          start: 'top 88%',
          once: true,
          onEnter: () => {
            gsap.from('#contact .form-floating, #contact #contact-submit', {
              y: 10,
              opacity: 0,
              stagger: 0.1,
              duration: 0.42,
              ease,
            });
          },
        });

        ScrollTrigger.refresh();
      }
    };

    const enforceVisibilityFallback = () => {
      document
        .querySelectorAll(
          '#about .counter-card, #stats .counter-card, #services .service-card, #services .col-12, #contact #contact-submit, #contact form, #about .row > div, #skills .row > div, #skills .skill-group, #skills .skill-progress-fill'
        )
        .forEach((el) => {
          el.style.opacity = '1';
          el.style.visibility = 'visible';
        });
    };

    initCursor();
    initMagnetic();
    initHeroParallax();
    initRipple();
    initForm();
    initGsap();
    enforceVisibilityFallback();
  } catch (error) {
    console.error('Error in main DOMContentLoaded handler:', error);
  }
});
