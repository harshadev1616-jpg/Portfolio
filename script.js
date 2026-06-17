
/* ══════════════════════════════════════
   LOADER — split-panel reveal
══════════════════════════════════════ */
const loaderBar = document.getElementById('loader-bar');
const loaderNum = document.getElementById('loader-num');
const loader    = document.getElementById('loader');
let pct = 0;
const loadTick = setInterval(() => {
  pct += Math.random() * 16 + 5;
  if (pct >= 100) {
    pct = 100;
    clearInterval(loadTick);
    loaderBar.style.width = '100%';
    loaderNum.textContent = '100';
    // Split panels open — dramatic reveal
    setTimeout(() => {
      loader.classList.add('split');
      document.getElementById('hero').classList.add('in');
      initWordSplit();
      initTilt();
      setTimeout(() => loader.classList.add('gone'), 800);
    }, 350);
  } else {
    loaderBar.style.width = pct + '%';
    loaderNum.textContent = Math.floor(pct);
  }
}, 55);

/* ══════════════════════════════════════
   CURSOR
══════════════════════════════════════ */
const cdot  = document.getElementById('cursor-dot');
const cring = document.getElementById('cursor-ring');
let mx = 0, my = 0, rx = 0, ry = 0;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
(function loop() {
  rx += (mx - rx) * 0.11; ry += (my - ry) * 0.11;
  cdot.style.cssText  = `left:${mx}px;top:${my}px`;
  cring.style.cssText = `left:${rx}px;top:${ry}px`;
  requestAnimationFrame(loop);
})();
document.querySelectorAll('a,button,.mag,.faq-q,.proj-card,.svc,.process-step,.stat').forEach(el => {
  el.addEventListener('mouseenter', () => document.body.classList.add('c-hover'));
  el.addEventListener('mouseleave', () => document.body.classList.remove('c-hover'));
});

/* ══════════════════════════════════════
   MAGNETIC
══════════════════════════════════════ */
document.querySelectorAll('.mag').forEach(el => {
  el.addEventListener('mousemove', e => {
    const r = el.getBoundingClientRect();
    el.style.transform = `translate(${(e.clientX-(r.left+r.width/2))*.28}px,${(e.clientY-(r.top+r.height/2))*.28}px)`;
  });
  el.addEventListener('mouseleave', () => el.style.transform = '');
});

/* ══════════════════════════════════════
   SCROLL PROGRESS
══════════════════════════════════════ */
const prog = document.getElementById('scroll-progress');
window.addEventListener('scroll', () => {
  prog.style.width = (window.scrollY / (document.documentElement.scrollHeight - innerHeight) * 100) + '%';
}, { passive: true });

/* ══════════════════════════════════════
   NAV SCROLL  +  BACK TO TOP
══════════════════════════════════════ */
const nav = document.getElementById('nav');
const toTop = document.getElementById('to-top');
const heroEl = document.getElementById('hero');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 30);
  toTop.classList.toggle('show', window.scrollY > window.innerHeight);
  heroEl.classList.toggle('cue-hide', window.scrollY > 80);
}, { passive: true });
toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ══════════════════════════════════════
   CLOCK
══════════════════════════════════════ */
function tick() {
  const t = new Date().toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', hour12:true, timeZone:'Asia/Kolkata' }) + ' IST';
  document.getElementById('nav-clock').textContent = t;
  document.getElementById('foot-clock').textContent = t;
}
tick(); setInterval(tick, 1000);

/* ══════════════════════════════════════
   ROTATING GREETINGS
══════════════════════════════════════ */
const greets = [
  ['Hello','👋'],['Namaste','🙏'],['Bonjour','👋'],
  ['こんにちは','👋'],['Hola','👋'],['Ciao','👋'],
  ['Hallo','👋'],['Olá','👋'],
];
let gi = 0;
const gel = document.getElementById('greeting');
const fEl = document.getElementById('greeting-flag');
setInterval(() => {
  gi = (gi + 1) % greets.length;
  gel.style.opacity = 0;
  setTimeout(() => {
    gel.textContent = greets[gi][0];
    fEl.textContent = greets[gi][1];
    gel.style.opacity = 1;
  }, 280);
}, 2400);

/* ══════════════════════════════════════
   FULLSCREEN MENU
══════════════════════════════════════ */
const burger = document.getElementById('burger');
const menu   = document.getElementById('menu');
burger.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  burger.classList.toggle('open', open);
  menu.setAttribute('aria-hidden', String(!open));
  document.body.style.overflow = open ? 'hidden' : '';
});
menu.querySelectorAll('.mlink').forEach(a => a.addEventListener('click', () => {
  menu.classList.remove('open');
  burger.classList.remove('open');
  menu.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}));

/* ══════════════════════════════════════
   NATIVE SCROLL + REVEAL OBSERVER
   The old JS lerp engine was removed — it translated the whole page every
   animation frame and ran getBoundingClientRect on every reveal each frame,
   which caused the jank/lag (and the fixed-position bugs). Native scroll is
   GPU-accelerated and smooth; reveals now use an IntersectionObserver.
══════════════════════════════════════ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    el.style.transitionDelay = (el.dataset.d || 0) + 'ms';
    el.classList.add('in');
    if (el.dataset.scramble !== undefined) scrambleEl(el, 800);
    const nameEl = el.querySelector('.proj-name');
    if (nameEl) setTimeout(() => glitchEl(nameEl), 200);
    revealObserver.unobserve(el);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

/* ══════════════════════════════════════
   EFFECT 1 — TEXT SCRAMBLE / GLITCH
══════════════════════════════════════ */
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';

function scrambleEl(el, duration = 700) {
  const original = el.textContent;
  const len = original.length;
  const start = performance.now();
  const frame = (now) => {
    const p = Math.min((now - start) / duration, 1);
    const resolved = Math.floor(p * len);
    el.textContent = original.split('').map((c, i) => {
      if (c === ' ' || c === '\n') return c;
      return i < resolved ? c : CHARS[Math.random() * CHARS.length | 0];
    }).join('');
    if (p < 1) requestAnimationFrame(frame);
    else el.textContent = original;
  };
  requestAnimationFrame(frame);
}

// Glitch flash effect (CSS-driven, data-text needed)
function glitchEl(el) {
  el.classList.add('glitch-wrap');
  el.dataset.text = el.textContent;
  el.classList.add('glitching');
  setTimeout(() => el.classList.remove('glitching'), 450);
}

/* ══════════════════════════════════════
   EFFECT 2 — 3D CARD TILT
══════════════════════════════════════ */
function initTilt() {
  document.querySelectorAll('.proj-card, .process-step, .faq-item').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      const rotX = (-y * 14).toFixed(2);
      const rotY = ( x * 14).toFixed(2);
      card.classList.add('tilting');
      // inline !important so it overrides `.rev.in { transform: none !important }`
      card.style.setProperty('transform',
        `perspective(700px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.025) translateZ(10px)`,
        'important');
    });
    card.addEventListener('mouseleave', () => {
      card.classList.remove('tilting');
      card.style.removeProperty('transform');
    });
  });
}

/* ══════════════════════════════════════
   WORD SPLIT — slide up per word on scroll
══════════════════════════════════════ */
const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';

function scramble(el, final, ms = 650) {
  const start = performance.now();
  (function frame(now) {
    const p = Math.min((now - start) / ms, 1);
    const done = Math.floor(p * final.length);
    el.textContent = final.split('').map((c, i) =>
      c === ' ' ? ' ' : i < done ? c : SCRAMBLE_CHARS[Math.random() * SCRAMBLE_CHARS.length | 0]
    ).join('');
    if (p < 1) requestAnimationFrame(frame);
    else el.textContent = final;
  })(start);
}

// Recursively wrap words in spans WHILE preserving <br> line breaks and
// inline elements like <em>/<strong> (so heading breaks + accent colors survive).
function splitNodeInto(container, node) {
  if (node.nodeType === Node.TEXT_NODE) {
    node.textContent.split(/(\s+)/).forEach(part => {
      if (part === '') return;
      if (/^\s+$/.test(part)) { container.appendChild(document.createTextNode(' ')); return; }
      const outer = document.createElement('span'); outer.className = 'word';
      const inner = document.createElement('span'); inner.className = 'wi';
      inner.textContent = part;
      outer.appendChild(inner);
      container.appendChild(outer);
    });
  } else if (node.nodeName === 'BR') {
    container.appendChild(document.createElement('br'));
  } else {
    // element (em, strong, …) — keep the tag, split its contents inside it
    const clone = node.cloneNode(false);
    [...node.childNodes].forEach(child => splitNodeInto(clone, child));
    container.appendChild(clone);
  }
}

function splitEl(el) {
  const nodes = [...el.childNodes];
  el.innerHTML = '';
  nodes.forEach(node => splitNodeInto(el, node));
}

const SPLIT_SELS  = ['.about-title','.contact-title','.svcs-manifesto p','.svc-body h3','.about-r p','.proj-sub','.process-step p','.process-step h3'];
const SCRAMBLE_SELS = ['.about-title','.contact-title'];

function initWordSplit() {
  SPLIT_SELS.forEach(sel => document.querySelectorAll(sel).forEach(el => {
    if (!el.dataset.split) { el.dataset.split = '1'; splitEl(el); }
  }));

  // Observer-driven word reveal
  const wordObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.querySelectorAll('.wi').forEach((w, j) => {
        w.style.transitionDelay = j * 50 + 'ms';
        w.classList.add('in');
      });
      if (SCRAMBLE_SELS.some(s => el.matches(s))) {
        el.querySelectorAll('.wi').forEach((w, j) => {
          const real = w.textContent;
          setTimeout(() => scramble(w, real, 580), j * 50 + 160);
        });
      }
      wordObserver.unobserve(el);
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -6% 0px' });

  SPLIT_SELS.forEach(sel => document.querySelectorAll(sel).forEach(el => wordObserver.observe(el)));
}

/* ══════════════════════════════════════
   SCROLL REVEAL — staggered, observer-driven
══════════════════════════════════════ */
// Stagger siblings by grouping them under their parent
(function assignStaggerDelays() {
  const parentMap = new Map();
  document.querySelectorAll('.rev').forEach(el => {
    const p = el.parentElement;
    if (!parentMap.has(p)) parentMap.set(p, []);
    parentMap.get(p).push(el);
  });
  parentMap.forEach(siblings => {
    siblings.forEach((el, i) => { el.dataset.d = i * 100; });
  });
})();

// Observe every reveal element
document.querySelectorAll('.rev').forEach(el => revealObserver.observe(el));

/* ══════════════════════════════════════
   STAT COUNTER
══════════════════════════════════════ */
const so = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const numEl = el.querySelector('.sn');
    const target = parseInt(numEl.dataset.target);
    if (!target || numEl.dataset.done) return;
    numEl.dataset.done = '1';
    const t0 = performance.now();
    const dur = 1100;
    (function step(now) {
      const p = Math.min((now - t0) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      numEl.textContent = Math.floor(ease * target);
      if (p < 1) requestAnimationFrame(step);
      else numEl.textContent = target;
    })(t0);
    so.unobserve(el);
  });
}, { threshold: 0.6 });
document.querySelectorAll('.stat').forEach(s => so.observe(s));

/* ══════════════════════════════════════
   PAGE TITLE PER SECTION
══════════════════════════════════════ */
const titleMap = {
  hero:    'Harsha Vardhan Gowda — Web Developer',
  work:    'Work — HVG',
  services:'Services — HVG',
  about:   'About — HVG',
  process: 'Process — HVG',
  faq:     'FAQ — HVG',
  contact: 'Contact — HVG',
};
const to = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting && titleMap[e.target.id]) document.title = titleMap[e.target.id]; });
}, { threshold: 0.4 });
Object.keys(titleMap).forEach(id => { const el = document.getElementById(id); if (el) to.observe(el); });

/* ══════════════════════════════════════
   FAQ ACCORDION
══════════════════════════════════════ */
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const open = btn.getAttribute('aria-expanded') === 'true';
    document.querySelectorAll('.faq-q').forEach(b => {
      b.setAttribute('aria-expanded', 'false');
      b.nextElementSibling.style.maxHeight = null;
    });
    if (!open) {
      btn.setAttribute('aria-expanded', 'true');
      btn.nextElementSibling.style.maxHeight = btn.nextElementSibling.scrollHeight + 'px';
    }
  });
});

/* ══════════════════════════════════════
   SERVICE ROWS — click to reveal extra info
══════════════════════════════════════ */
document.querySelectorAll('.svc').forEach(row => {
  row.setAttribute('role', 'button');
  row.setAttribute('tabindex', '0');
  const toggle = () => {
    const open = row.getAttribute('aria-expanded') === 'true';
    row.setAttribute('aria-expanded', String(!open));
  };
  row.addEventListener('click', toggle);
  row.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
  });
});

/* ══════════════════════════════════════
   CONTACT FORM
══════════════════════════════════════ */
function sendMail(e) {
  e.preventDefault();
  const n = document.getElementById('fn').value;
  const em = document.getElementById('fe').value;
  const ph = document.getElementById('fp').value;
  const m = document.getElementById('fm').value;
  const phoneLine = ph ? `Phone: ${ph}\n` : '';
  window.location.href = `mailto:hvgtech16@gmail.com?subject=${encodeURIComponent('Project inquiry from ' + n)}&body=${encodeURIComponent(`Hi Harsha,\n\nName: ${n}\nEmail: ${em}\n${phoneLine}\n${m}`)}`;
  document.getElementById('fsent').hidden = false;
  e.target.reset();
}

/* ══════════════════════════════════════
   ANCHOR SCROLL — native, with nav offset
══════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    const m = document.getElementById('menu');
    if (m.classList.contains('open')) {
      m.classList.remove('open');
      document.getElementById('burger').classList.remove('open');
      m.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
    const offsetTop = target.getBoundingClientRect().top + window.scrollY - 64;
    window.scrollTo({ top: offsetTop, behavior: 'smooth' });
  });
});
