const slider = document.getElementById('slider');
const sliderDots = Array.from(document.querySelectorAll('.slider-dot'));
const heroSection = document.getElementById('hero');
const areaSection = document.getElementById('area');
const homeLink = document.getElementById('home-link');

if (slider && sliderDots.length) {
  let currentSlide = 0;
  let autoSlideTimer;
  let isAnimatingScroll = false;
  let isAnimatingSlide = false;

  const SLIDE_DURATION = 2600;
  const SECTION_SCROLL_DURATION = 2600;

  const getSlideWidth = () => slider.clientWidth;

  const easeInOutCubic = (progress) =>
    progress < 0.5
      ? 4 * progress * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;

  const animateValue = (from, to, duration, onUpdate, onComplete) => {
    const startTime = performance.now();

    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeInOutCubic(progress);
      const value = from + (to - from) * easedProgress;

      onUpdate(value);

      if (progress < 1) {
        window.requestAnimationFrame(step);
        return;
      }

      if (onComplete) onComplete();
    };

    window.requestAnimationFrame(step);
  };

  const animatePageScroll = (targetY) => {
    if (isAnimatingScroll) return;

    isAnimatingScroll = true;
    const startY = window.scrollY;

    animateValue(
      startY,
      targetY,
      SECTION_SCROLL_DURATION,
      (value) => {
        window.scrollTo(0, value);
      },
      () => {
        window.scrollTo(0, targetY);
        isAnimatingScroll = false;
      },
    );
  };

  const setActiveDot = (index) => {
    sliderDots.forEach((dot, dotIndex) => {
      dot.classList.toggle('active', dotIndex === index);
      dot.setAttribute('aria-current', dotIndex === index ? 'true' : 'false');
    });
  };

  const goToSlide = (index, behavior = 'smooth') => {
    const totalSlides = sliderDots.length;
    const nextSlide = (index + totalSlides) % totalSlides;
    const nextTargetLeft = getSlideWidth() * nextSlide;

    if (behavior === 'auto') {
      currentSlide = nextSlide;
      slider.scrollLeft = nextTargetLeft;
      setActiveDot(currentSlide);
      return;
    }

    if (isAnimatingSlide) return;

    isAnimatingSlide = true;
    currentSlide = nextSlide;
    setActiveDot(currentSlide);
    const startLeft = slider.scrollLeft;

    animateValue(
      startLeft,
      nextTargetLeft,
      SLIDE_DURATION,
      (value) => {
        slider.scrollLeft = value;
      },
      () => {
        slider.scrollLeft = nextTargetLeft;
        isAnimatingSlide = false;
      },
    );
  };

  const startAutoSlide = () => {
    window.clearInterval(autoSlideTimer);
    autoSlideTimer = window.setInterval(() => {
      goToSlide(currentSlide + 1);
    }, 5000);
  };

  sliderDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      goToSlide(Number(dot.dataset.slide));
      startAutoSlide();
    });
  });

  slider.addEventListener('scroll', () => {
    if (isAnimatingSlide || !getSlideWidth()) return;
    const nextSlide = Math.round(slider.scrollLeft / getSlideWidth());
    if (nextSlide !== currentSlide) {
      currentSlide = nextSlide;
      setActiveDot(currentSlide);
    }
  });

  window.addEventListener('resize', () => {
    goToSlide(currentSlide, 'auto');
  });

  const handleHeroWheel = (event) => {
    if (window.innerWidth <= 900) return;
    if (isAnimatingScroll) return;

    const heroRect = heroSection.getBoundingClientRect();
    const areaRect = areaSection.getBoundingClientRect();
    const heroMostlyVisible = heroRect.top <= 120 && heroRect.bottom > window.innerHeight / 2;

    if (event.deltaY > 0 && heroMostlyVisible) {
      event.preventDefault();
      const targetY = window.scrollY + areaRect.top;
      animatePageScroll(targetY);
    }
  };

  window.addEventListener('wheel', handleHeroWheel, { passive: false });

  if (homeLink) {
    homeLink.addEventListener('click', (event) => {
      event.preventDefault();
      const targetY = window.scrollY + heroSection.getBoundingClientRect().top;
      animatePageScroll(targetY);
    });
  }

  goToSlide(0, 'auto');
  startAutoSlide();
}
