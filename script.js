/* ============= UTILITIES ============= */
const $  = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============= THEME TOGGLE ============= */
const themeToggleBtn = $('#themeToggle');

function getPreferredTheme() {
  const saved = localStorage.getItem('theme');
  if (saved) return saved;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'dark';
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

// Synchronize theme on load
setTheme(getPreferredTheme());

themeToggleBtn?.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  setTheme(next);
});

/* ============= MOBILE NAV ============= */
const toggle = $('.nav-toggle');
const menu = $('#menu');

toggle?.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
  document.body.style.overflow = open ? 'hidden' : '';
});

$$('#menu a').forEach(a => a.addEventListener('click', () => {
  menu.classList.remove('open');
  toggle?.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}));

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && menu?.classList.contains('open')) {
    menu.classList.remove('open');
    toggle?.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
});

/* ============= SMOOTH ANCHOR SCROLL ============= */
$$('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (!id || id === '#') return;
    const target = $(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    history.pushState(null, '', id);
  });
});

/* ============= ACTIVE NAV LINK ON SCROLL ============= */
const navLinks = $$('#menu a[href^="#"]');
const sections = navLinks
  .map(a => $(a.getAttribute('href')))
  .filter(Boolean);

if (sections.length) {
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const link = navLinks.find(a => a.getAttribute('href') === `#${entry.target.id}`);
      if (!link) return;
      if (entry.isIntersecting) {
        navLinks.forEach(a => a.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }, { rootMargin: '-40% 0px -50% 0px', threshold: 0 });

  sections.forEach(sec => navObserver.observe(sec));
}

/* ============= SCROLL REVEAL ============= */
const revealTargets = $$('.reveal');

if (revealTargets.length && !prefersReducedMotion) {
  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  revealTargets.forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i % 6, 5) * 60}ms`;
    revealObserver.observe(el);
  });
} else {
  revealTargets.forEach(el => el.classList.add('is-visible'));
}

/* ============= FOOTER YEAR ============= */
const yearEl = $('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ============= CONTACT FORM (AJAX) ============= */
const contactForm = $('#contactForm');
const formStatus = $('#formStatus');

contactForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = new FormData(e.currentTarget);
  const name = (data.get('name') || '').toString().trim();
  const email = (data.get('email') || '').toString().trim();
  const message = (data.get('message') || '').toString().trim();

  if (!name || !email || !message) {
    if (formStatus) {
      formStatus.textContent = 'Please fill in every field before sending.';
      formStatus.style.color = '#ef4444';
    }
    return;
  }

  data.set('_replyto', email);
  data.set('_subject', `New Portfolio Message from ${name}`);

  const btn = contactForm.querySelector('button[type="submit"]');
  if (btn) btn.textContent = 'Sending...';
  if (formStatus) formStatus.textContent = '';

  try {
    const res = await fetch('https://formsubmit.co/ajax/287cad95125269dc3404757b75294959', {
      method: 'POST',
      body: data
    });
    
    if (res.ok) {
      if (formStatus) {
        formStatus.textContent = 'Message sent successfully! I will get back to you soon.';
        formStatus.style.color = '#10b981';
      }
      contactForm.reset();
    } else {
      if (formStatus) {
        formStatus.textContent = 'Oops! There was a problem submitting your message.';
        formStatus.style.color = '#ef4444';
      }
    }
  } catch (err) {
    if (formStatus) {
      formStatus.textContent = 'Oops! Network error while submitting the form.';
      formStatus.style.color = '#ef4444';
    }
  } finally {
    if (btn) btn.textContent = 'Send Message';
  }
});