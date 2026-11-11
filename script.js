const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Theme (remembers choice) */
const themeBtn = $('#themeToggle');
const setIcon = () => $('.icon', themeBtn).textContent = document.documentElement.dataset.theme === 'light' ? '☀️' : '🌙';
setIcon();
themeBtn.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('theme', next); } catch (e) {}
  setIcon();
});

/* Mobile menu */
const menuBtn = $('#menuBtn'), navLinks = $('#navLinks');
const toggleMenu = open => {
  navLinks.classList.toggle('open', open);
  menuBtn.setAttribute('aria-expanded', open);
};
menuBtn.addEventListener('click', () => toggleMenu(!navLinks.classList.contains('open')));
$$('a', navLinks).forEach(a => a.addEventListener('click', () => toggleMenu(false)));
addEventListener('keydown', e => e.key === 'Escape' && toggleMenu(false));
addEventListener('click', e => { if (!e.target.closest('.nav-container')) toggleMenu(false); });

/* Scroll: progress bar, navbar style, back-to-top */
const progress = $('#progress'), navbar = $('#navbar'), toTop = $('#toTop');
let ticking = false;
addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = (max > 0 ? y / max * 100 : 0) + '%';
    navbar.classList.toggle('scrolled', y > 20);
    toTop.classList.toggle('show', y > 600);
    ticking = false;
  });
}, { passive: true });
toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

/* Active nav link */
const links = $$('.nav-links a');
const spy = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
$$('section[id]').forEach(s => spy.observe(s));

/* Reveal on scroll (staggered inside grids) */
$$('.skills-grid, .timeline, .fact-list').forEach(g => [...g.children].forEach((el, i) => { el.classList.add('reveal'); el.style.setProperty('--d', i * 0.1 + 's'); }));
const revealer = new IntersectionObserver(entries => entries.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('in'); revealer.unobserve(e.target); }
}), { threshold: 0.15 });
$$('.reveal').forEach(el => revealer.observe(el));

/* Typing effect */
const words = ['BSCS student', 'aspiring software engineer', 'web developer', 'guitar lover'];
const typed = $('#typed');
if (reduceMotion) typed.textContent = words[1];
else {
  let w = 0, c = 0, del = false;
  (function tick() {
    const word = words[w];
    typed.textContent = word.slice(0, c);
    if (!del && c === word.length) { del = true; return setTimeout(tick, 1600); }
    if (del && c === 0) { del = false; w = (w + 1) % words.length; return setTimeout(tick, 350); }
    c += del ? -1 : 1;
    setTimeout(tick, del ? 35 : 80);
  })();
}

/* Interactive: hero parallax, card tilt, magnetic buttons (mouse devices only) */
if (!reduceMotion && matchMedia('(hover: hover)').matches) {
  const hero = $('#heroImage');
  addEventListener('mousemove', e => {
    const x = (e.clientX / innerWidth - 0.5) * 2, y = (e.clientY / innerHeight - 0.5) * 2;
    hero.style.transform = `translate(${x * 10}px, ${y * 10}px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg)`;
  });
  $$('.tilt').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => card.style.transform = '');
  });
  $$('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.2}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`;
    });
    btn.addEventListener('mouseleave', () => btn.style.transform = '');
  });
}

/* Python backend demo: tries live app.py first, falls back to sample data */
const API = 'http://localhost:8000';
const sample = {
  profile: {
    name: 'Jerald J. Padellon', alias: 'Padie', course: 'BSCS', year_level: '3-2',
    institution: 'Cavite State University - Bacoor Campus',
    hobbies: ['Playing Guitar', 'Listening to Music', 'Programming']
  },
  projects: [{
    title: 'Barangay CINCO Portal', subject: 'ITEC50', roles: ['Frontend', 'Backend', 'Programmer'],
    url: 'https://padiepads.github.io/Barangay-CINCO/',
    team: ['Christian Mark B. Quimpano', 'Princess Angel T. Javinez', 'Mae B. Alao', 'Eddieson H. Fortuna']
  }],
  status: { server_time: new Date().toISOString(), python_version: '3.11.4', framework: 'http.server' }
};
const out = $('#jsonOutput');
async function fetchPythonData(endpoint) {
  out.textContent = `GET /api/${endpoint} ...`;
  let data, source = 'sample data';
  try {
    const ctrl = new AbortController();
    setTimeout(() => ctrl.abort(), 1200);
    const res = await fetch(API, { signal: ctrl.signal });
    const all = await res.json();
    data = endpoint === 'profile' ? all : endpoint === 'projects' ? all.projects : { ...sample.status, skills: all.skills };
    source = 'live from app.py';
  } catch (e) {
    await new Promise(r => setTimeout(r, 300));
    data = sample[endpoint];
  }
  out.textContent = `// ${source}\n` + JSON.stringify(data, null, 2);
  out.classList.remove('flash'); void out.offsetWidth; out.classList.add('flash');
}
$$('.btn-term').forEach(b => b.addEventListener('click', () => {
  $$('.btn-term').forEach(x => x.classList.toggle('active', x === b));
  fetchPythonData(b.dataset.endpoint);
}));

/* Contact form: opens the visitor's email app with the message prefilled */
$('#contactForm').addEventListener('submit', e => {
  e.preventDefault();
  const name = $('#cName').value.trim(), msg = $('#cMsg').value.trim();
  const subject = encodeURIComponent('Portfolio message from ' + name);
  const body = encodeURIComponent(msg + '\n\n- ' + name);
  location.href = 'mailto:jeraldpadellonpadie@gmail.com?subject=' + subject + '&body=' + body;
});