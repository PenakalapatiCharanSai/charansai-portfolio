/* ============= UTILITIES ============= */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/* ============= MOBILE NAV ============= */
const toggle = $('.nav-toggle');
const menu = $('#menu');
toggle?.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
});

/* Close mobile menu on link click */
$$('#menu a').forEach(a => a.addEventListener('click', () => {
  menu.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
}));

/* ============= THEME (Light/Dark) ============= */
const themeToggle = $('#themeToggle');
const applyTheme = (mode) => {
  if(mode === 'light'){ document.documentElement.classList.add('light'); themeToggle.textContent = '🌙'; }
  else { document.documentElement.classList.remove('light'); themeToggle.textContent = '🌞'; }
  localStorage.setItem('theme', mode);
};
applyTheme(localStorage.getItem('theme') || 'dark');
themeToggle?.addEventListener('click', () => {
  const isLight = document.documentElement.classList.contains('light');
  applyTheme(isLight ? 'dark' : 'light');
});

/* ============= FOOTER YEAR ============= */
$('#year').textContent = new Date().getFullYear();

/* ============= CONTACT FORM (mailto) ============= */
$('#contactForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(e.currentTarget);
  const name = data.get('name') || '';
  const email = data.get('email') || '';
  const message = data.get('message') || '';
  const subject = encodeURIComponent(`Portfolio Contact from ${name}`);
  const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
  window.location.href = `mailto:youremail@example.com?subject=${subject}&body=${body}`;
});

/* ============= GSAP ENTRANCE ANIMATIONS ============= */
window.addEventListener('load', () => {
  // ensure gsap loaded
  if (window.gsap) {
    // Hero intro
    gsap.from('.hero .eyebrow', { y: -12, opacity: 0, duration: .6, ease: 'power2.out' });
    gsap.from('.hero__title', { y: 12, opacity: 0, duration: .7, delay: .1, ease: 'power2.out' });
    gsap.from('.lead', { y: 12, opacity: 0, duration: .7, delay: .2, ease: 'power2.out' });
    gsap.from('.cta-row, .social', { y: 12, opacity: 0, duration: .7, delay: .35, stagger: .1, ease: 'power2.out' });
    gsap.from('.avatar', { scale: .9, opacity: 0, duration: .8, delay: .25, ease: 'power2.out' });

    // Smooth anchor links (GSAP ScrollTo)
    $$('#menu a[href^="#"], .cta-row a[href^="#"], .footer a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const id = a.getAttribute('href');
        if (id && id.startsWith('#')) {
          gsap.to(window, { duration: .7, scrollTo: id, ease: 'power2.out' });
        }
      });
    });
  }
});

/* ============= ScrollMagic + GSAP for sections ============= */
const controller = new ScrollMagic.Controller();

// Reveal sections with stagger
$$('.section').forEach((sec) => {
  const cardChildren = sec.querySelectorAll('h2, p, .grid, .two-col, .timeline, form, .card, .project');
  if (cardChildren.length === 0) return;
  gsap.set(cardChildren, { y: 20, opacity: 0 });

  const tween = gsap.to(cardChildren, {
    y: 0, opacity: 1, stagger: .08, duration: .6, ease: 'power2.out'
  });

  new ScrollMagic.Scene({
    triggerElement: sec,
    triggerHook: 0.85, // when section is near viewport
    reverse: false
  })
  .setTween(tween)
  // .addIndicators({ name: sec.id || 'section' }) // debug only
  .addTo(controller);
});

// Pin the header lightly on scroll (subtle effect)
new ScrollMagic.Scene({ triggerElement: '.hero', triggerHook: 0, duration: '50%' })
  .setPin('.site-header', { pushFollowers: false })
  .addTo(controller);
