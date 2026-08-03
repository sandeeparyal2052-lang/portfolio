/* ==========================================================================
   SANDEEP ARYAL — PORTFOLIO SCRIPT
   Dynamic client-side functionality. Connects to backend API endpoints:
   - GET /api/projects (search & category filtering)
   - GET /api/projects/:id (project modal specs)
   - POST /api/contact (contact form submission & backend storage)
   - POST /api/calculator/deck-joist (dynamic structural engineering calculator)
   ========================================================================== */

(function () {
  "use strict";

  /* ---------- Theme (dark/light mode) ---------- */
  function initTheme() {
    var toggleBtn = document.getElementById("theme-toggle");
    var root = document.documentElement;
    if (!toggleBtn) return;

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
        /* localStorage unavailable */
      }
    });
  }

  /* ---------- Mobile nav ---------- */
  function initMobileNav() {
    var toggleBtn = document.getElementById("mobile-nav-toggle");
    var menu = document.getElementById("mobile-nav");
    if (!toggleBtn || !menu) return;

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
  function initHeroBackground() {
    var slides = document.querySelectorAll(".hero-bg-slide");
    if (slides.length < 2) return;

    var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    var current = 0;
    setInterval(function () {
      slides[current].classList.remove("is-active");
      current = (current + 1) % slides.length;
      slides[current].classList.add("is-active");
    }, 4000);
  }

  /* ---------- Dynamic Projects & Search/Filter ---------- */
  var currentCategory = "All";
  var currentSearch = "";

  function fetchAndRenderProjects() {
    var grid = document.getElementById("dynamic-project-grid");
    if (!grid) return;

    grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:40px; color:var(--text-muted); font-family:var(--font-mono);">Loading dynamic projects...</div>';

    var url = "/api/projects?category=" + encodeURIComponent(currentCategory) + "&search=" + encodeURIComponent(currentSearch);

    fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error("Failed to load projects");
        return res.json();
      })
      .then(function (resData) {
        if (!resData.success || !resData.data.length) {
          grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:40px; color:var(--text-muted); font-family:var(--font-mono);">No matching projects found. Try adjusting your filter or search query.</div>';
          return;
        }

        var html = "";
        resData.data.forEach(function (proj) {
          var tagsHtml = (proj.tags || []).map(function (t) {
            return '<span class="tag">' + t + '</span>';
          }).join('');

          html += `
            <article class="project-card reveal is-visible" data-id="${proj.id}">
              <div class="project-thumb">
                <img src="${proj.thumb || proj.image}" alt="${proj.title}" loading="lazy" />
              </div>
              <div class="project-body">
                <h3>${proj.title}</h3>
                <p class="project-loc">${proj.location}</p>
                <p class="project-scope">${proj.scope}</p>
                <div class="tag-row">${tagsHtml}</div>
                <dl class="project-meta">
                  <div><dt>Client</dt><dd>${proj.client}</dd></div>
                  <div><dt>Year</dt><dd>${proj.year}</dd></div>
                  <div class="span-2"><dt>Role</dt><dd>${proj.role}</dd></div>
                </dl>
              </div>
            </article>
          `;
        });

        grid.innerHTML = html;

        // Attach click listeners to open modal
        grid.querySelectorAll(".project-card").forEach(function (card) {
          card.addEventListener("click", function () {
            var projId = card.getAttribute("data-id");
            openProjectModal(projId);
          });
        });
      })
      .catch(function (err) {
        console.error(err);
        grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:40px; color:var(--signal); font-family:var(--font-mono);">Error loading projects from backend API.</div>';
      });
  }

  function initDynamicProjects() {
    var filterContainer = document.getElementById("project-filter-row");
    var searchInput = document.getElementById("project-search-input");

    if (filterContainer) {
      filterContainer.querySelectorAll(".filter-btn").forEach(function (btn) {
        btn.addEventListener("click", function () {
          filterContainer.querySelectorAll(".filter-btn").forEach(function (b) {
            b.classList.remove("active");
          });
          btn.classList.add("active");
          currentCategory = btn.getAttribute("data-category") || "All";
          fetchAndRenderProjects();
        });
      });
    }

    if (searchInput) {
      var debounceTimer;
      searchInput.addEventListener("input", function (e) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function () {
          currentSearch = e.target.value;
          fetchAndRenderProjects();
        }, 250);
      });
    }

    fetchAndRenderProjects();
  }

  /* ---------- Project Modal ---------- */
  function openProjectModal(id) {
    var modal = document.getElementById("project-modal");
    var modalContent = document.getElementById("modal-content");
    if (!modal || !modalContent) return;

    modalContent.innerHTML = '<div style="text-align:center; padding:40px; font-family:var(--font-mono);">Loading details...</div>';
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    fetch("/api/projects/" + id)
      .then(function (res) { return res.json(); })
      .then(function (res) {
        if (!res.success || !res.data) {
          modalContent.innerHTML = '<p>Project details unavailable.</p>';
          return;
        }

        var p = res.data;
        var codesHtml = (p.codes || []).map(function (c) { return '<span class="chip">' + c + '</span>'; }).join(' ');
        var softwareHtml = (p.software || []).map(function (s) { return '<span class="chip">' + s + '</span>'; }).join(' ');

        modalContent.innerHTML = `
          <div class="modal-img-wrapper">
            <img src="${p.image || p.thumb}" alt="${p.title}" />
          </div>
          <h2 class="modal-title" id="modal-project-title">${p.title}</h2>
          <p style="font-size:14px; color:var(--text-muted); margin:0;">${p.location} · ${p.year}</p>

          <div class="modal-specs">
            <div><strong>Client:</strong><br/>${p.client}</div>
            <div><strong>Role:</strong><br/>${p.role}</div>
            <div><strong>Category:</strong><br/>${p.category}</div>
          </div>

          <div>
            <h4 style="font-family:var(--font-display); margin:16px 0 8px;">Engineering Overview</h4>
            <p style="font-size:15px; line-height:1.6; color:var(--text); margin:0;">${p.description}</p>
          </div>

          ${codesHtml ? `<div><h4 style="font-family:var(--font-display); margin:16px 0 8px;">Codes & Standards</h4><div class="chip-row">${codesHtml}</div></div>` : ''}
          ${softwareHtml ? `<div><h4 style="font-family:var(--font-display); margin:16px 0 8px;">Software Used</h4><div class="chip-row">${softwareHtml}</div></div>` : ''}
        `;
      })
      .catch(function (err) {
        modalContent.innerHTML = '<p style="color:var(--signal);">Failed to load project details.</p>';
      });
  }

  function initProjectModal() {
    var modal = document.getElementById("project-modal");
    var closeBtn = document.getElementById("modal-close");
    if (!modal) return;

    function closeModal() {
      modal.classList.remove("is-open");
      modal.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", closeModal);
    }

    modal.addEventListener("click", function (e) {
      if (e.target === modal) {
        closeModal();
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && modal.classList.contains("is-open")) {
        closeModal();
      }
    });
  }

  /* ---------- Dynamic Contact Form Handler ---------- */
  function initContactForm() {
    var form = document.getElementById("contact-form");
    var statusBox = document.getElementById("contact-status");
    var submitBtn = document.getElementById("contact-submit-btn");
    if (!form) return;

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var nameVal = form.elements["name"].value;
      var emailVal = form.elements["email"].value;
      var subjectVal = form.elements["subject"] ? form.elements["subject"].value : "";
      var messageVal = form.elements["message"].value;

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Sending Message...";
      }

      if (statusBox) {
        statusBox.className = "contact-status";
        statusBox.style.display = "none";
      }

      var payload = {
        name: nameVal,
        email: emailVal,
        subject: subjectVal,
        message: messageVal
      };

      fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Send Message";
          }

          if (statusBox) {
            if (data.success) {
              statusBox.className = "contact-status success";
              statusBox.textContent = "✓ Message sent successfully! Reference ID: " + (data.data ? data.data.id : "msg-ok");
              form.reset();
            } else {
              statusBox.className = "contact-status error";
              statusBox.textContent = "✕ Error: " + (data.message || "Could not send message.");
            }
          }
        })
        .catch(function (err) {
          console.error("Contact API error:", err);
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = "Send Message";
          }
          if (statusBox) {
            statusBox.className = "contact-status error";
            statusBox.textContent = "✕ Connection error. Please try again later.";
          }
        });
    });
  }

  /* ---------- Gallery filter ---------- */
  function initGalleryFilter() {
    var buttons = document.querySelectorAll(".filter-btn");
    var items = document.querySelectorAll(".gallery-item");
    if (!buttons.length || !items.length) return;

    buttons.forEach(function (btn) {
      if (btn.closest("#project-filter-row")) return; // skip project filter row

      btn.addEventListener("click", function () {
        buttons.forEach(function (b) {
          if (!b.closest("#project-filter-row")) b.classList.remove("active");
        });
        btn.classList.add("active");

        var category = btn.getAttribute("data-category");
        items.forEach(function (item) {
          var match = category === "All" || item.getAttribute("data-category") === category;
          item.classList.toggle("hidden", !match);
        });
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
      el.style.transitionDelay = (i % 4) * 70 + "ms";
      observer.observe(el);
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
    initDynamicProjects();
    initProjectModal();
    initGalleryFilter();
    initScrollReveal();
    initContactForm();
    initBackToTop();
    initFooterYear();
  });
})();
