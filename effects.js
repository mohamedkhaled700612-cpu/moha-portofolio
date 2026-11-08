
/* =========================================
   MK — PREMIUM INTERACTIONS
   Lightweight & Responsive
========================================= */

document.addEventListener("DOMContentLoaded", () => {
  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* REVEAL ON SCROLL */

  const revealElements = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && !reducedMotion) {
    const observer = new IntersectionObserver(
      (entries, observerInstance) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observerInstance.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -35px 0px"
      }
    );

    revealElements.forEach((element) => {
      observer.observe(element);
    });
  } else {
    revealElements.forEach((element) => {
      element.classList.add("visible");
    });
  }

  /* HEADER SCROLL */

  const header = document.querySelector(".site-header");

  if (header) {
    const updateHeader = () => {
      header.classList.toggle("scrolled", window.scrollY > 30);
    };

    updateHeader();

    window.addEventListener("scroll", updateHeader, {
      passive: true
    });
  }

  /* PREMIUM 3D EMBLEM */

  const emblem = document.querySelector(".mk-emblem");

  const canUse3D =
    !reducedMotion &&
    window.matchMedia("(pointer: fine)").matches;

  if (emblem && canUse3D) {
    let isHovering = false;

    emblem.addEventListener("mousemove", (event) => {
      const rect = emblem.getBoundingClientRect();

      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      const rotateY = (x - 0.5) * 7;
      const rotateX = (0.5 - y) * 7;

      isHovering = true;

      emblem.style.transform =
        `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    emblem.addEventListener("mouseleave", () => {
      if (!isHovering) return;

      isHovering = false;

      emblem.style.transform =
        "perspective(1000px) rotateX(0deg) rotateY(0deg)";
    });
  }

  /* MOBILE MENU */

  const mobileMenu = document.querySelector("#navMobile");
  const menuToggle = document.querySelector("#navToggle");

  if (mobileMenu && menuToggle) {
    menuToggle.addEventListener("click", () => {
      const isOpen = mobileMenu.classList.contains("open");

      menuToggle.setAttribute(
        "aria-expanded",
        String(!isOpen)
      );
    });

    mobileMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        mobileMenu.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* CLOSE MENU WITH ESCAPE */

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mobileMenu && menuToggle) {
      mobileMenu.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    }
  });

  /* SMOOTH ANCHOR NAVIGATION */

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");

      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);

      if (!target) return;

      event.preventDefault();

      target.scrollIntoView({
        behavior: reducedMotion ? "auto" : "smooth",
        block: "start"
      });
    });
  });
});
