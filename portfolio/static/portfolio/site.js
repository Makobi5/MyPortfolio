const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------------ *
 * Preloader
 * ------------------------------------------------------------------ */
const preloader = document.getElementById('preloader');
const pageStart = performance.now();

function finishLoading() {
  const wait = reduceMotion ? 0 : Math.max(0, 1100 - (performance.now() - pageStart));
  window.setTimeout(() => {
    root.classList.add('is-loaded');
    if (preloader) {
      preloader.classList.add('is-hidden');
      window.setTimeout(() => preloader.remove(), 800);
    }
  }, wait);
}

if (document.readyState === 'complete') finishLoading();
else window.addEventListener('load', finishLoading);

/* ------------------------------------------------------------------ *
 * Theme + mobile menu
 * ------------------------------------------------------------------ */
const themeButton = document.querySelector('.theme-toggle');
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-nav');

try {
  const savedTheme = localStorage.getItem('portfolio-theme');
  if (savedTheme === 'light' || savedTheme === 'dark') root.dataset.theme = savedTheme;
} catch (error) { /* storage unavailable */ }

const updateThemeLabel = () => {
  const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  themeButton.setAttribute('aria-label', `Switch to ${nextTheme} theme`);
};
updateThemeLabel();

themeButton.addEventListener('click', () => {
  const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = nextTheme;
  try { localStorage.setItem('portfolio-theme', nextTheme); } catch (error) { /* ignore */ }
  updateThemeLabel();
});

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
  navigation.classList.toggle('is-open', !isOpen);
});

navigation.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navigation.classList.remove('is-open');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
  });
});

/* ------------------------------------------------------------------ *
 * Typing line  (timings taken from the reference: 70ms type, 600ms hold, 40ms erase)
 * ------------------------------------------------------------------ */
const interestText = document.querySelector('.rotating-interest');
const interests = ['Cloud Computing', 'Web Development', 'UI/UX Design', 'Open Source', 'Mentoring'];
const TYPE_DELAY = 70;
const HOLD_DELAY = 600;
const ERASE_DELAY = 40;
let interestIndex = 0;
let characterIndex = 0;
let erasing = false;

function animateInterest() {
  const word = interests[interestIndex];
  interestText.textContent = word.slice(0, characterIndex);
  let delay = erasing ? ERASE_DELAY : TYPE_DELAY;

  if (!erasing && characterIndex < word.length) {
    characterIndex += 1;
  } else if (!erasing) {
    erasing = true;
    delay = HOLD_DELAY;
  } else if (characterIndex > 0) {
    characterIndex -= 1;
  } else {
    erasing = false;
    interestIndex = (interestIndex + 1) % interests.length;
    delay = 0;
  }
  window.setTimeout(animateInterest, delay);
}

if (reduceMotion) interestText.textContent = interests[0];
else animateInterest();

/* ------------------------------------------------------------------ *
 * Particle network — a faithful port of the reference's particles.js config:
 *   140 particles (density 800), Slack colours, random radius up to 8,
 *   speed 5, out-mode "out", links 150px / 0.4 opacity / #808080,
 *   hover = repulse (70px), click = push 4 particles.
 * ------------------------------------------------------------------ */
const hero = document.querySelector('.intro-hero');
const canvas = hero.querySelector('.particle-canvas');
const ctx = canvas.getContext('2d');

const PJS = {
  number: 140,
  densityArea: 800,
  colors: ['#2EB67D', '#ECB22E', '#E01E5B', '#36C5F0'],
  size: 8,
  speed: 5,
  linkDistance: 150,
  linkOpacity: 0.4,
  linkColor: '128, 128, 128',
  repulseDistance: 70,
  pushCount: 4,
  maxParticles: 450,
};

const particles = [];
const mouse = { x: 0, y: 0, active: false };
let canvasWidth = 0;
let canvasHeight = 0;
let pixelRatio = 1;
let isRetina = false;

function createParticle(x, y) {
  return {
    x: x === undefined ? Math.random() * canvasWidth : x,
    y: y === undefined ? Math.random() * canvasHeight : y,
    vx: Math.random() - 0.5,
    vy: Math.random() - 0.5,
    radius: Math.random() * PJS.size,
    color: PJS.colors[Math.floor(Math.random() * PJS.colors.length)],
  };
}

// Same density formula particles.js uses (it differs slightly on high-DPI screens).
function targetParticleCount() {
  let area = (canvasWidth * canvasHeight) / 1000;
  if (isRetina) area *= pixelRatio / 2;
  return Math.min(PJS.maxParticles, Math.round((area * PJS.number) / PJS.densityArea));
}

function resizeCanvas() {
  const bounds = hero.getBoundingClientRect();
  canvasWidth = bounds.width;
  canvasHeight = bounds.height;
  const dpr = window.devicePixelRatio || 1;
  isRetina = dpr > 1;
  pixelRatio = isRetina ? Math.min(dpr, 3) : 1;
  canvas.width = Math.round(canvasWidth * pixelRatio);
  canvas.height = Math.round(canvasHeight * pixelRatio);
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  const wanted = targetParticleCount();
  while (particles.length < wanted) particles.push(createParticle());
  if (particles.length > wanted) particles.splice(0, particles.length - wanted);
  if (reduceMotion) drawFrame(0);
}

function pushParticles(count, x, y) {
  for (let index = 0; index < count; index += 1) particles.push(createParticle(x, y));
  if (particles.length > PJS.maxParticles + 60) particles.splice(0, particles.length - PJS.maxParticles - 60);
}

function drawFrame(frameScale) {
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  const step = (PJS.speed / 2) * frameScale;

  for (let index = 0; index < particles.length; index += 1) {
    const particle = particles[index];

    particle.x += particle.vx * step;
    particle.y += particle.vy * step;

    // out-mode "out": leave one side, re-enter from the opposite one
    if (particle.x - particle.radius > canvasWidth) { particle.x = -particle.radius; particle.y = Math.random() * canvasHeight; }
    else if (particle.x + particle.radius < 0) { particle.x = canvasWidth + particle.radius; particle.y = Math.random() * canvasHeight; }
    if (particle.y - particle.radius > canvasHeight) { particle.y = -particle.radius; particle.x = Math.random() * canvasWidth; }
    else if (particle.y + particle.radius < 0) { particle.y = canvasHeight + particle.radius; particle.x = Math.random() * canvasWidth; }

    // hover: repulse
    if (mouse.active && frameScale > 0) {
      const dx = particle.x - mouse.x;
      const dy = particle.y - mouse.y;
      const distance = Math.hypot(dx, dy);
      if (distance <= PJS.repulseDistance && distance > 0) {
        const factor = Math.min(50, Math.max(0, (1 / PJS.repulseDistance) * (1 - (distance / PJS.repulseDistance) ** 2) * PJS.repulseDistance * 100));
        particle.x += (dx / distance) * factor;
        particle.y += (dy / distance) * factor;
      }
    }

    // links
    for (let next = index + 1; next < particles.length; next += 1) {
      const other = particles[next];
      const distance = Math.hypot(particle.x - other.x, particle.y - other.y);
      if (distance <= PJS.linkDistance) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(${PJS.linkColor}, ${PJS.linkOpacity - distance / (1 / PJS.linkOpacity) / PJS.linkDistance})`;
        ctx.lineWidth = 1;
        ctx.moveTo(particle.x, particle.y);
        ctx.lineTo(other.x, other.y);
        ctx.stroke();
      }
    }
  }

  particles.forEach((particle) => {
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    ctx.fillStyle = particle.color;
    ctx.fill();
  });
}

let animationFrame = 0;
let lastTime = 0;
let heroVisible = true;

function loop(time) {
  const elapsed = lastTime ? Math.min(time - lastTime, 50) : 16.67;
  lastTime = time;
  drawFrame(elapsed / 16.67); // keeps the speed identical on 60Hz and 144Hz screens
  animationFrame = window.requestAnimationFrame(loop);
}

function syncAnimation() {
  const shouldRun = !reduceMotion && heroVisible && !document.hidden;
  if (shouldRun && !animationFrame) {
    lastTime = 0;
    animationFrame = window.requestAnimationFrame(loop);
  }
  if (!shouldRun && animationFrame) {
    window.cancelAnimationFrame(animationFrame);
    animationFrame = 0;
  }
}

window.addEventListener('pointermove', (event) => {
  if (event.pointerType !== 'mouse') return;
  const bounds = hero.getBoundingClientRect();
  mouse.x = event.clientX - bounds.left;
  mouse.y = event.clientY - bounds.top;
  mouse.active = mouse.x >= 0 && mouse.y >= 0 && mouse.x <= bounds.width && mouse.y <= bounds.height;
}, { passive: true });
document.addEventListener('mouseleave', () => { mouse.active = false; });

window.addEventListener('click', (event) => {
  if (reduceMotion || !mouse.active || event.target.closest('a, button, input, textarea')) return;
  pushParticles(PJS.pushCount, mouse.x, mouse.y);
});

resizeCanvas();
window.addEventListener('resize', resizeCanvas, { passive: true });
document.addEventListener('visibilitychange', syncAnimation);
new IntersectionObserver(([entry]) => {
  heroVisible = entry.isIntersecting;
  syncAnimation();
}).observe(hero);
syncAnimation();

/* ------------------------------------------------------------------ *
 * Nav: highlight the section in view
 * ------------------------------------------------------------------ */
const navLinks = [...navigation.querySelectorAll('a[href^="#"]')];
const watchedSections = navLinks.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
const scrollTopButton = document.getElementById('scroll-top');
let scrollQueued = false;

function onScroll() {
  scrollQueued = false;
  const marker = window.innerHeight * 0.35;
  const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
  let current = watchedSections[0];
  watchedSections.forEach((section) => {
    if (section.getBoundingClientRect().top <= marker) current = section;
  });
  if (atBottom) current = watchedSections[watchedSections.length - 1];
  navLinks.forEach((link) => link.classList.toggle('is-active', link.getAttribute('href') === `#${current.id}`));

  // scroll-to-top appears once you are past the first screen
  scrollTopButton.classList.toggle('is-visible', window.scrollY > window.innerHeight);
}

window.addEventListener('scroll', () => {
  if (!scrollQueued) {
    scrollQueued = true;
    window.requestAnimationFrame(onScroll);
  }
}, { passive: true });
onScroll();

scrollTopButton.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
});

/* ------------------------------------------------------------------ *
 * Custom cursor (dot + lagging outline), fine pointers only
 * ------------------------------------------------------------------ */
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const dot = document.querySelector('.cursor-dot');
  const outline = document.querySelector('.cursor-dot-outline');
  const cursorDelay = 8;
  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let outlineX = targetX;
  let outlineY = targetY;
  let enlarged = false;
  let lastCursorTime = 0;

  root.classList.add('has-custom-cursor');

  const setSize = () => {
    dot.style.transform = `translate(-50%, -50%) scale(${enlarged ? 0.75 : 1})`;
    outline.style.transform = `translate(-50%, -50%) scale(${enlarged ? 1.5 : 1})`;
  };

  document.addEventListener('mousemove', (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
    dot.style.left = `${targetX}px`;
    dot.style.top = `${targetY}px`;
    dot.style.opacity = 1;
    outline.style.opacity = 1;
  });
  document.addEventListener('mouseleave', () => { dot.style.opacity = 0; outline.style.opacity = 0; });
  document.addEventListener('mouseenter', () => { dot.style.opacity = 1; outline.style.opacity = 1; });
  document.addEventListener('mousedown', () => { enlarged = true; setSize(); });
  document.addEventListener('mouseup', () => { enlarged = false; setSize(); });
  document.addEventListener('mouseover', (event) => {
    if (event.target.closest('a, button')) { enlarged = true; setSize(); }
  });
  document.addEventListener('mouseout', (event) => {
    if (event.target.closest('a, button')) { enlarged = false; setSize(); }
  });

  const followCursor = (time) => {
    const elapsed = lastCursorTime ? Math.min(time - lastCursorTime, 50) : 16.67;
    lastCursorTime = time;
    const ease = 1 - (1 - 1 / cursorDelay) ** (elapsed / 16.67);
    outlineX += (targetX - outlineX) * ease;
    outlineY += (targetY - outlineY) * ease;
    outline.style.left = `${outlineX}px`;
    outline.style.top = `${outlineY}px`;
    window.requestAnimationFrame(followCursor);
  };
  window.requestAnimationFrame(followCursor);
}

/* ------------------------------------------------------------------ *
 * "Come back" tab title + favicon when the tab is hidden
 * ------------------------------------------------------------------ */
const favicon = document.getElementById('favicon');
const pageTitle = document.title;
const faviconHome = favicon ? favicon.href : '';
const faviconAway = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><text x="32" y="50" font-size="48" text-anchor="middle">👀</text></svg>')}`;

document.addEventListener('visibilitychange', () => {
  document.title = document.hidden ? 'Come back' : pageTitle;
  if (favicon) favicon.href = document.hidden ? faviconAway : faviconHome;
});