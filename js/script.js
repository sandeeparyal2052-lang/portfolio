/* ==========================================================================
   SANDEEP ARYAL — PORTFOLIO SCRIPT
   Vanilla JS, no build step, no dependencies. Handles: dark/light mode,
   mobile nav toggle, gallery filtering, scroll-reveal animations, and the
   contact form (which opens a pre-filled email — see initContactForm).
   ========================================================================== */

(function () {
  "use strict";

  /* ---------- Theme (dark/light mode) ---------- */
  function initTheme() {
    var toggleBtn = document.getElementById("theme-toggle");
    var root = document.documentElement;

    function applyIcon(isDark) {
      toggleBtn.innerHTML = isDark
        ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="4.5"/><path d="M12 2.5v2.5M12 19v2.5M4.2 4.2l1.8 1.8M18 18l1.8 1.8M2.5 12H5M19 12h2.5M4.2 19.8L6 18M18 6l1.8-1.8"/></svg>'
        : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z"/></svg>';
    }

    applyIcon(root.classList.contains("dark"));

    toggleBtn.addEventListener("click", function () {
      var isDark = root.classList.toggle("dark");
      applyIcon(isDark);
      try {
        localStorage.setItem("theme", isDark ? "dark" : "light");
      } catch (e) {
        /* localStorage unavailable — theme just won't persist */
      }
    });
  }

  /* ---------- Mobile nav ---------- */
  function initMobileNav() {
    var toggleBtn = document.getElementById("mobile-nav-toggle");
    var menu = document.getElementById("mobile-nav");

    toggleBtn.addEventListener("click", function () {
      var isOpen = menu.classList.toggle("open");
      toggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    menu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        menu.classList.remove("open");
        toggleBtn.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* ---------- Hero background slideshow ---------- */
  // Cross-fades through the construction-site / line-diagram scenes behind
  // the hero content. Add or remove slides by editing the .hero-bg-slide
  // divs in index.html — this just cycles whichever ones are present.
  function initHeroBackground() {
    var slides = document.querySelectorAll(".hero-bg-slide");
    if (slides.length < 2) return;

    var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return; // leave the first slide static

    var current = 0;
    setInterval(function () {
      slides[current].classList.remove("is-active");
      current = (current + 1) % slides.length;
      slides[current].classList.add("is-active");
    }, 4000);
  }

  /* ---------- Dynamic Slider Helper ---------- */
  function createSlider(viewportId, trackId, prevBtnId, nextBtnId, counterId) {
    var viewport = document.getElementById(viewportId);
    var track = document.getElementById(trackId);
    var prevBtn = document.getElementById(prevBtnId);
    var nextBtn = document.getElementById(nextBtnId);
    var counterEl = document.getElementById(counterId);

    if (!viewport || !track) return null;

    var currentIndex = 0;

    function getVisibleSlides() {
      return Array.from(track.children).filter(function (child) {
        return !child.classList.contains("hidden") && getComputedStyle(child).display !== "none";
      });
    }

    function getItemsPerView() {
      var w = window.innerWidth;
      if (w >= 1024) return 3;
      if (w >= 640) return 2;
      return 1;
    }

    function update() {
      var visibleSlides = getVisibleSlides();
      var total = visibleSlides.length;
      var perView = getItemsPerView();
      var maxIndex = Math.max(0, total - perView);

      if (currentIndex > maxIndex) {
        currentIndex = maxIndex;
      }
      if (currentIndex < 0) {
        currentIndex = 0;
      }

      if (total === 0) {
        track.style.transform = "translateX(0px)";
        if (counterEl) counterEl.textContent = "00 / 00";
        if (prevBtn) prevBtn.disabled = true;
        if (nextBtn) nextBtn.disabled = true;
        return;
      }

      var firstSlide = visibleSlides[0];
      var gap = 24;
      var slideWidth = firstSlide ? firstSlide.getBoundingClientRect().width : 0;
      var movePx = currentIndex * (slideWidth + gap);

      track.style.transform = "translateX(-" + movePx + "px)";

      if (counterEl) {
        var currentNum = String(currentIndex + 1).padStart(2, "0");
        var totalNum = String(total).padStart(2, "0");
        counterEl.textContent = currentNum + " / " + totalNum;
      }

      if (prevBtn) prevBtn.disabled = currentIndex <= 0;
      if (nextBtn) nextBtn.disabled = currentIndex >= maxIndex;
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        if (currentIndex > 0) {
          currentIndex--;
          update();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        var visibleSlides = getVisibleSlides();
        var perView = getItemsPerView();
        var maxIndex = Math.max(0, visibleSlides.length - perView);
        if (currentIndex < maxIndex) {
          currentIndex++;
          update();
        }
      });
    }

    var startX = 0;
    var startY = 0;
    viewport.addEventListener("touchstart", function (e) {
      if (e.touches.length === 1) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }
    }, { passive: true });

    viewport.addEventListener("touchend", function (e) {
      if (e.changedTouches.length === 1) {
        var diffX = e.changedTouches[0].clientX - startX;
        var diffY = e.changedTouches[0].clientY - startY;
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
          var visibleSlides = getVisibleSlides();
          var perView = getItemsPerView();
          var maxIndex = Math.max(0, visibleSlides.length - perView);
          if (diffX < 0 && currentIndex < maxIndex) {
            currentIndex++;
            update();
          } else if (diffX > 0 && currentIndex > 0) {
            currentIndex--;
            update();
          }
        }
      }
    }, { passive: true });

    window.addEventListener("resize", update);
    setTimeout(update, 100);

    return {
      reset: function () {
        currentIndex = 0;
        update();
      },
      update: update
    };
  }

  /* ---------- Gallery filter ---------- */
  function initGalleryFilter(gallerySlider) {
    var buttons = document.querySelectorAll(".filter-btn");
    var items = document.querySelectorAll(".gallery-item");
    if (!buttons.length) return;

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        buttons.forEach(function (b) {
          b.classList.remove("active");
        });
        btn.classList.add("active");

        var category = btn.getAttribute("data-category");
        items.forEach(function (item) {
          var match = category === "All" || item.getAttribute("data-category") === category;
          item.classList.toggle("hidden", !match);
        });

        if (gallerySlider) {
          gallerySlider.reset();
        }
      });
    });
  }

  /* ---------- Scroll reveal ---------- */
  function initScrollReveal() {
    var elements = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || !elements.length) {
      elements.forEach(function (el) {
        el.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    elements.forEach(function (el, i) {
      el.style.animationDelay = (i % 4) * 60 + "ms";
      observer.observe(el);
    });
  }

  /* ---------- Contact form ---------- */
  // No backend is wired up. Submitting opens the visitor's email client with
  // the message pre-filled. To collect submissions directly, swap this for a
  // real form handler (e.g. Formspree, Netlify Forms, or a small server).
  function initContactForm() {
    var form = document.getElementById("contact-form");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.elements["name"].value;
      var email = form.elements["email"].value;
      var message = form.elements["message"].value;

      var subject = encodeURIComponent("Portfolio inquiry from " + (name || "website visitor"));
      var body = encodeURIComponent(message + "\n\n\u2014 " + name + " (" + email + ")");
      window.location.href = "mailto:er.sandeeparyal@gmail.com?subject=" + subject + "&body=" + body;
    });
  }

  /* ---------- Back to top ---------- */
  function initBackToTop() {
    var btn = document.getElementById("back-to-top");
    if (!btn) return;
    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ---------- Footer year ---------- */
  function initFooterYear() {
    var el = document.getElementById("footer-year");
    if (el) el.textContent = new Date().getFullYear();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initTheme();
    initMobileNav();
    initHeroBackground();

    var projectsSlider = createSlider(
      "projects-slider-viewport",
      "projects-slider-track",
      "projects-prev-btn",
      "projects-next-btn",
      "projects-slide-counter"
    );

    var gallerySlider = createSlider(
      "gallery-slider-viewport",
      "gallery-slider-track",
      "gallery-prev-btn",
      "gallery-next-btn",
      "gallery-slide-counter"
    );

    initGalleryFilter(gallerySlider);
    initScrollReveal();
    initContactForm();
    initBackToTop();
    initFooterYear();
  });
})();
