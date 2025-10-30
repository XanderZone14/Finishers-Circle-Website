// ---------------- VIDEO SCROLL FADE ----------------
const video = document.querySelector('.background-video');
const overlay = document.querySelector('.overlay');
const secondHero = document.querySelector('.second-hero');

window.addEventListener('scroll', () => {
  const scroll = window.scrollY;

  // Smooth video opacity fade
  if (video) {
    const videoOpacity = Math.pow(Math.max(1 - scroll / 600, 0), 1.5);
    video.style.opacity = videoOpacity;
  }

  // Smooth overlay darkening
  if (overlay) {
    const overlayAlpha = 0.45 + Math.min(scroll / 1200, 0.55);
    overlay.style.background = `rgba(0,0,0,${overlayAlpha})`;
  }

  // Fade in second hero
  if (secondHero) {
    const triggerPoint = secondHero.offsetTop - window.innerHeight / 2;
    if (scroll > triggerPoint) {
      secondHero.classList.add('visible');
    }
  }

  // Handle fade-up animations
  handleScrollAnimations();
});

// ---------------- DROPDOWN CLICK ----------------
const dropdowns = document.querySelectorAll('.dropdown');
dropdowns.forEach(drop => {
  const trigger = drop.querySelector('a');
  trigger.addEventListener('click', e => {
    e.preventDefault();
    dropdowns.forEach(d => { if (d !== drop) d.classList.remove('active'); });
    drop.classList.toggle('active');
  });
});

// ---------------- CLOSE DROPDOWN ON OUTSIDE CLICK ----------------
document.addEventListener('click', e => {
  dropdowns.forEach(drop => {
    if (!drop.contains(e.target)) drop.classList.remove('active');
  });
});

// ---------------- FADE-UP SCROLL ANIMATIONS ----------------
const fadeElements = document.querySelectorAll('.about-container, .second-hero');

function handleScrollAnimations() {
  const triggerBottom = window.innerHeight * 0.85;

  fadeElements.forEach(el => {
    const boxTop = el.getBoundingClientRect().top;

    if (boxTop < triggerBottom) {
      el.classList.add('visible');
    } else {
      el.classList.remove('visible');
    }
  });
}

// Initialize animations on load
window.addEventListener('load', handleScrollAnimations);

const galleryItems = document.querySelectorAll('.gallery-item img');
const lightbox = document.querySelector('.lightbox');
const lightboxImg = document.querySelector('.lightbox-img');
const closeBtn = document.querySelector('.lightbox .close');

galleryItems.forEach(img => {
  img.addEventListener('click', () => {
    lightbox.style.display = 'flex';
    lightboxImg.src = img.src;
  });
});

closeBtn.addEventListener('click', () => {
  lightbox.style.display = 'none';
});

lightbox.addEventListener('click', e => {
  if (e.target !== lightboxImg) {
    lightbox.style.display = 'none';
  }
});

// ---------------- SMOOTH SCROLL TO CONTACT ----------------
document.querySelectorAll('a[href^="#contact"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      window.scrollTo({
        top: target.offsetTop - 60,
        behavior: 'smooth'
      });
    }
  });
});
