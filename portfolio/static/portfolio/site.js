const root = document.documentElement;
const themeButton = document.querySelector('.theme-toggle');
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-nav');

const savedTheme = localStorage.getItem('portfolio-theme');
if (savedTheme === 'light' || savedTheme === 'dark') {
  root.dataset.theme = savedTheme;
}

const updateThemeLabel = () => {
  const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  themeButton.setAttribute('aria-label', `Switch to ${nextTheme} theme`);
};

updateThemeLabel();

themeButton.addEventListener('click', () => {
  const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = nextTheme;
  localStorage.setItem('portfolio-theme', nextTheme);
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

const interestText = document.querySelector('.rotating-interest');
const interests = ['Cloud Computing', 'Web Development', 'UI/UX Design', 'Open Source', 'Problem Solving'];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let interestIndex = 0;
let characterIndex = 0;
let deleting = false;

function animateInterest() {
  const currentInterest = interests[interestIndex];
  interestText.textContent = currentInterest.slice(0, characterIndex);
  let delay = deleting ? 45 : 82;

  if (!deleting && characterIndex < currentInterest.length) {
    characterIndex += 1;
  } else if (!deleting) {
    deleting = true;
    delay = 1150;
  } else if (characterIndex > 0) {
    characterIndex -= 1;
  } else {
    deleting = false;
    interestIndex = (interestIndex + 1) % interests.length;
    delay = 250;
  }

  window.setTimeout(animateInterest, delay);
}

if (reduceMotion) {
  interestText.textContent = interests[0];
} else {
  animateInterest();
}

const hero = document.querySelector('.intro-hero');
const particleCanvas = hero.querySelector('.particle-canvas');
const particleContext = particleCanvas.getContext('2d');
const particleColors = ['40, 182, 125', '239, 179, 39', '233, 54, 105', '40, 186, 218'];
const particles = [];
let canvasWidth = 0;
let canvasHeight = 0;
let pixelRatio = 1;

function resizeCanvas() {
  const heroBounds = hero.getBoundingClientRect();
  canvasWidth = heroBounds.width;
  canvasHeight = heroBounds.height;
  pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  particleCanvas.width = Math.round(canvasWidth * pixelRatio);
  particleCanvas.height = Math.round(canvasHeight * pixelRatio);
  particleContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  particles.length = 0;

  const particleCount = Math.min(90, Math.max(24, Math.round(canvasWidth * canvasHeight / 12500)));
  for (let index = 0; index < particleCount; index += 1) {
    particles.push({
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight,
      velocityX: (Math.random() - 0.5) * 0.34,
      velocityY: (Math.random() - 0.5) * 0.34,
      radius: Math.random() * 3.2 + 2,
      color: particleColors[index % particleColors.length],
    });
  }
}

function renderParticles() {
  particleContext.clearRect(0, 0, canvasWidth, canvasHeight);

  particles.forEach((particle, index) => {
    if (!reduceMotion) {
      particle.x += particle.velocityX;
      particle.y += particle.velocityY;
      if (particle.x < 0 || particle.x > canvasWidth) particle.velocityX *= -1;
      if (particle.y < 0 || particle.y > canvasHeight) particle.velocityY *= -1;
    }

    for (let nextIndex = index + 1; nextIndex < particles.length; nextIndex += 1) {
      const otherParticle = particles[nextIndex];
      const horizontalDistance = particle.x - otherParticle.x;
      const verticalDistance = particle.y - otherParticle.y;
      const distance = Math.hypot(horizontalDistance, verticalDistance);
      if (distance < 135) {
        particleContext.beginPath();
        particleContext.moveTo(particle.x, particle.y);
        particleContext.lineTo(otherParticle.x, otherParticle.y);
        particleContext.strokeStyle = `rgba(116, 128, 143, ${(1 - distance / 135) * 0.24})`;
        particleContext.lineWidth = 1;
        particleContext.stroke();
      }
    }

    particleContext.beginPath();
    particleContext.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
    particleContext.fillStyle = `rgba(${particle.color}, 0.92)`;
    particleContext.fill();
  });

  if (!reduceMotion) window.requestAnimationFrame(renderParticles);
}

resizeCanvas();
renderParticles();
window.addEventListener('resize', resizeCanvas, { passive: true });
