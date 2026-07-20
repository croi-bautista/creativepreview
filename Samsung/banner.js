const slider = document.querySelector('.image-slider');
const cta = document.querySelector('.cta');
const banner = document.getElementById('banner');
const logo = document.querySelector('.logo');
const headline = document.querySelector('.headline');
const product1 = document.querySelector('.productImage1');
const product2 = document.querySelector('.productImage2');

const bannerClickTag = 'https://www.samsung.com/uk/smartphones/galaxy-s26/';
const ctaClickTag = 'https://www.samsung.com/uk/smartphones/galaxy-s26/buy/';


banner.addEventListener('click', () => {
  window.open(bannerClickTag, '_blank');
});

cta.addEventListener('click', (event) => {
  event.stopPropagation();
  window.open(ctaClickTag, '_blank');
});


// image preloader utility
function preloadImages(urls = []) {
  return Promise.all(urls.map(src => new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = img.onabort = () => reject(new Error('Failed to load: ' + src));
    img.src = src;
  })));
}

// initialize banner animations (called after preloading)
function initBanner() {

  if (window.gsap) {
    // hide carousel initially, reveal it later after product animations
    if (slider) {
      gsap.set(slider, { autoAlpha: 0 });
      slider.style.pointerEvents = 'none';
    }

    const introTimeline = gsap.timeline({ defaults: { duration: 0.6, ease: 'power2.out' } });

    introTimeline
      .from(logo, { autoAlpha: 0, scale: 0.5 })
      .from(headline, { autoAlpha: 0, y: 15 }, '+=0.1')
      .from(product1, { autoAlpha: 0, y: 20, x: 20 }, '+=0.1')
      .from(product2, { autoAlpha: 0, y: 20 }, '+=0.1')
      .from(cta, { autoAlpha: 0, scale: 0.95, ease: 'back.out(1.2)' }, '+=0.1')

      // one soft float for products (controlled in timeline so we can sequence the fade)
      .to(product1, { y: '-=10', duration: 1.8, ease: 'sine.inOut', repeat: 1, yoyo: true }, '+=0')
      .to(product2, { y: '-=8', duration: 1.8, ease: 'sine.inOut', repeat: 1, yoyo: true }, '-=1.6')

      // wait 2s, then fade out products, initialize the carousel, and fade in the slider
      .to([product1, product2], { autoAlpha: 0, duration: 0.5 }, '+=2')
      .call(initCarousel)
      .to(slider, { autoAlpha: 1, duration: 0.5 }, '+=0')
      .call(() => {
        if (slider) slider.style.pointerEvents = 'auto';
      });
  }
  
}

// list of images to preload (add paths as needed)
const imagesToPreload = [
  'assets/samsung-logo.png',
  'assets/product-image1.png',
  'assets/product-image2.png',
  'assets/img1.png',
  'assets/img2.png',
  'assets/img3.png',
  'assets/img4.png',
  'assets/img5.png'
];

// start preloading, then initialize banner (fall back to init even on error)
preloadImages(imagesToPreload)
  .then(() => initBanner())
  .catch((err) => {
    console.warn('Image preloader failed:', err);
    initBanner();
  });

if (window.gsap && cta) {

  cta.addEventListener('mouseenter', () => {
    gsap.to(cta, {
      y: -2,
      backgroundColor: '#333',
      duration: 0.25,
      ease: 'power2.out'
    });
  });

  cta.addEventListener('mouseleave', () => {
    gsap.to(cta, {
      y: 0,
      backgroundColor: '#000',
      duration: 0.25,
      ease: 'power2.out'
    });
  });
}

// carousel initialization helper
function initCarousel() {
  if (!window.gsap || !slider) {
    return;
  }

  const slides = Array.from(slider.querySelectorAll('.slider-slide'));
  const dots = Array.from(slider.querySelectorAll('.slider-dot'));
  const prevBtn = slider.querySelector('.slider-btn-prev');
  const nextBtn = slider.querySelector('.slider-btn-next');
  const autoSlideDelay = 3000;
  const swipeThreshold = 35;
  let activeIndex = 0;
  let autoSlideTimer;
  let isAnimating = false;
  let swipeStartX = 0;
  let swipeStartY = 0;
  let swipePointerId = null;
  let isSwiping = false;

  gsap.set(slides, { autoAlpha: 0, x: 12 });
  gsap.set(slides[activeIndex], { autoAlpha: 1, x: 0 });
  gsap.set(prevBtn, { xPercent: -24 });
  gsap.set(nextBtn, { xPercent: 24 });
  gsap.set(dots[activeIndex], { scale: 1.25, backgroundColor: '#000' });

  function showSlide(index) {
    const nextIndex = (index + slides.length) % slides.length;

    if (isAnimating || nextIndex === activeIndex) {
      return;
    }

    const currentSlide = slides[activeIndex];
    const nextSlide = slides[nextIndex];
    const direction = nextIndex > activeIndex || (activeIndex === slides.length - 1 && nextIndex === 0) ? 1 : -1;

    isAnimating = true;
    nextSlide.classList.add('is-active');
    gsap.set(nextSlide, { autoAlpha: 0, x: direction * 18 });

    gsap.timeline({
      defaults: {
        duration: 0.32,
        ease: 'power2.out'
      },
      onComplete: () => {
        currentSlide.classList.remove('is-active');
        activeIndex = nextIndex;
        isAnimating = false;
      }
    })
      .to(currentSlide, { autoAlpha: 0, x: direction * -18 }, 0)
      .to(nextSlide, { autoAlpha: 1, x: 0 }, 0);

    dots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === nextIndex;

      dot.classList.toggle('is-active', isActive);
      gsap.to(dot, {
        scale: isActive ? 1.25 : 1,
        backgroundColor: isActive ? '#000' : '#b8b8b8',
        duration: 0.2,
        ease: 'power2.out'
      });
    });
  }

  function startAutoSlide() {
    window.clearInterval(autoSlideTimer);
    autoSlideTimer = window.setInterval(() => {
      showSlide(activeIndex + 1);
    }, autoSlideDelay);
  }

  function resetAutoSlide() {
    window.clearInterval(autoSlideTimer);
    startAutoSlide();
  }

  prevBtn.addEventListener('click', () => {
    showSlide(activeIndex - 1);
    resetAutoSlide();
  });

  nextBtn.addEventListener('click', () => {
    showSlide(activeIndex + 1);
    resetAutoSlide();
  });

  dots.forEach((dot, dotIndex) => {
    dot.addEventListener('click', () => {
      showSlide(dotIndex);
      resetAutoSlide();
    });
  });

  slider.addEventListener('pointerdown', (event) => {
    // prevent slider interactions from bubbling to the banner click
    event.stopPropagation();
    event.preventDefault();
    if (event.target.closest('button')) {
      return;
    }

    swipePointerId = event.pointerId;
    swipeStartX = event.clientX;
    swipeStartY = event.clientY;
    isSwiping = true;
    window.clearInterval(autoSlideTimer);
    slider.setPointerCapture(swipePointerId);
  });

  slider.addEventListener('pointermove', (event) => {
    if (!isSwiping || event.pointerId !== swipePointerId) {
      return;
    }
    event.preventDefault();
  });

  // prevent simple clicks on the slider from triggering the banner clicktag
  slider.addEventListener('click', (e) => e.stopPropagation());

  slider.addEventListener('pointerup', (event) => {
    // ensure the pointerup doesn't bubble to banner
    event.stopPropagation();
    if (!isSwiping || event.pointerId !== swipePointerId) {
      return;
    }

    const swipeDistanceX = event.clientX - swipeStartX;
    const swipeDistanceY = event.clientY - swipeStartY;
    const isHorizontalSwipe = Math.abs(swipeDistanceX) > Math.abs(swipeDistanceY);

    if (isHorizontalSwipe && Math.abs(swipeDistanceX) >= swipeThreshold) {
      showSlide(activeIndex + (swipeDistanceX < 0 ? 1 : -1));
    }

    isSwiping = false;
    swipePointerId = null;
    resetAutoSlide();
  });

  slider.addEventListener('pointercancel', () => {
    isSwiping = false;
    swipePointerId = null;
    resetAutoSlide();
  });

  slider.addEventListener('mouseenter', () => {
    window.clearInterval(autoSlideTimer);
  });

  slider.addEventListener('mouseleave', startAutoSlide);

  [prevBtn, nextBtn].forEach((button) => {
    button.addEventListener('mouseenter', () => {
      gsap.to(button, {
        scale: 1.06,
        backgroundColor: '#333',
        duration: 0.2,
        ease: 'power2.out'
      });
    });

    button.addEventListener('mouseleave', () => {
      gsap.to(button, {
        scale: 1,
        backgroundColor: '#000',
        duration: 0.2,
        ease: 'power2.out'
      });
    });
  });

  startAutoSlide();
}
