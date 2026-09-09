//header shrink + scroll-spy
const header = document.getElementById("siteHeader");
const sections = document.querySelectorAll("section[id], div#top");
const navLinks = document.querySelectorAll(".nav-link");

function onScroll() {
  header.classList.toggle("scrolled", window.scrollY > 40);

  let current = "";
  sections.forEach((sec) => {
    const top = sec.getBoundingClientRect().top;
    if (top < window.innerHeight * 0.4) current = sec.id;
  });
  navLinks.forEach((link) => {
    link.classList.toggle(
      "active",
      link.getAttribute("href") === "#" + current
    );
  });
}
document.addEventListener("scroll", onScroll, { passive: true });
onScroll();

//mobile nav toggle
const navToggle = document.getElementById("navToggle");
const primaryNav = document.getElementById("primaryNav");

function setNav(isOpen) {
  primaryNav.classList.toggle("open", isOpen);
  navToggle.classList.toggle("open", isOpen);
  document.body.classList.toggle("nav-open", isOpen);
  navToggle.setAttribute("aria-expanded", isOpen);
  navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
}

navToggle.addEventListener("click", () => {
  setNav(!primaryNav.classList.contains("open"));
});

navLinks.forEach((link) => link.addEventListener("click", () => setNav(false)));

//close the drawer with Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && primaryNav.classList.contains("open")) {
    setNav(false);
    navToggle.focus();
  }
});

//reveal on scroll
const revealEls = document.querySelectorAll(".reveal");
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
revealEls.forEach((el) => io.observe(el));

//count-up stats on scroll into view
const counters = document.querySelectorAll(".counter");
const statIo = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      counters.forEach((el) => {
        const target = parseFloat(el.dataset.target);
        const decimals = parseInt(el.dataset.decimals || "0", 10);
        const prefix = el.dataset.prefix || "";
        const suffix = el.dataset.suffix || "";
        const duration = 1400;
        const start = performance.now();
        function tick(now) {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const value = (target * eased).toFixed(decimals);
          el.textContent = prefix + value + suffix;
          if (progress < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
      });
      statIo.unobserve(entry.target);
    });
  },
  { threshold: 0.5 }
);
const statStrip = document.getElementById("statStrip");
if (statStrip) statIo.observe(statStrip);

//gallery carousel
const track = document.getElementById("carouselTrack");
const slides = track ? Array.from(track.children) : [];
const dotsWrap = document.getElementById("carouselDots");
const prevBtn = document.getElementById("carouselPrev");
const nextBtn = document.getElementById("carouselNext");
const carouselEl = document.getElementById("galleryCarousel");
let current = 0;
let autoplayId = null;

if (track && slides.length) {
  let dots = [];
  let maxIndex = 0;

  function perView() {
    if (window.innerWidth <= 600) return 1;
    if (window.innerWidth <= 900) return 2;
    return 3;
  }

  function buildDots() {
    dotsWrap.innerHTML = "";
    dots = [];
    for (let i = 0; i <= maxIndex; i++) {
      const dot = document.createElement("button");
      dot.setAttribute("aria-label", "Go to slide " + (i + 1));
      dot.addEventListener("click", () => goTo(i, true));
      dotsWrap.appendChild(dot);
      dots.push(dot);
    }
  }

  function render() {
    const card = slides[0];
    const gap = parseFloat(getComputedStyle(track).gap) || 0;
    const step = card.getBoundingClientRect().width + gap;
    track.style.transform = "translateX(-" + current * step + "px)";
    dots.forEach((d, i) => d.classList.toggle("active", i === current));
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current === maxIndex;
  }

  function layout() {
    maxIndex = Math.max(0, slides.length - perView());
    if (current > maxIndex) current = maxIndex;
    buildDots();
    render();
  }

  function goTo(index, userTriggered) {
    current = Math.min(Math.max(index, 0), maxIndex);
    render();
    if (userTriggered) restartAutoplay();
  }
  function next() {
    goTo(current >= maxIndex ? 0 : current + 1);
  }
  function prev() {
    goTo(current <= 0 ? maxIndex : current - 1);
  }

  function startAutoplay() {
    autoplayId = setInterval(next, 5000);
  }
  function stopAutoplay() {
    clearInterval(autoplayId);
  }
  function restartAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  prevBtn.addEventListener("click", () => {
    prev();
    restartAutoplay();
  });
  nextBtn.addEventListener("click", () => {
    next();
    restartAutoplay();
  });

  carouselEl.addEventListener("mouseenter", stopAutoplay);
  carouselEl.addEventListener("mouseleave", startAutoplay);
  carouselEl.addEventListener("focusin", stopAutoplay);
  carouselEl.addEventListener("focusout", startAutoplay);

  carouselEl.setAttribute("tabindex", "0");
  carouselEl.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") {
      next();
      restartAutoplay();
    }
    if (e.key === "ArrowLeft") {
      prev();
      restartAutoplay();
    }
  });

  let touchStartX = 0;
  carouselEl.addEventListener(
    "touchstart",
    (e) => {
      touchStartX = e.touches[0].clientX;
    },
    { passive: true }
  );
  carouselEl.addEventListener(
    "touchend",
    (e) => {
      const delta = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) > 40) {
        delta < 0 ? next() : prev();
        restartAutoplay();
      }
    },
    { passive: true }
  );

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(layout, 150);
  });

  layout();
  window.addEventListener("load", render);
  startAutoplay();
}

//search form (decorative — no backend)
document.getElementById("searchForm").addEventListener("submit", (e) => {
  e.preventDefault();
  document.getElementById("contact").scrollIntoView({ behavior: "smooth" });
});

//contact form (decorative — no backend)
const contactForm = document.getElementById("contactForm");
contactForm.addEventListener("submit", (e) => {
  e.preventDefault();
  document.getElementById("formSuccess").classList.add("show");
  contactForm.reset();
});
