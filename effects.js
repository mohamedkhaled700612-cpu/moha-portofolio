
/* =========================================
   MK PORTFOLIO — PREMIUM EFFECTS
   Lightweight & Responsive

   RESPONSIBILITIES:
   1. MK 3D Logo Motion
   2. Smooth Scroll
   3. Reduced Motion Support

   MAIN.JS HANDLES:
   - Reveal On Scroll
   - Header Scroll
   - Mobile Menu
========================================= */

(() => {
  "use strict";

  document.addEventListener("DOMContentLoaded", () => {

    /* =====================================
       REDUCED MOTION
    ===================================== */

    const motionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );

    const prefersReducedMotion = () => motionQuery.matches;

    const canUse3D =
      !prefersReducedMotion() &&
      window.matchMedia("(pointer: fine)").matches;


    /* =====================================
       1. PREMIUM MK 3D LOGO
    ===================================== */

    const emblem = document.querySelector(".mk-emblem");

    if (emblem && canUse3D) {

      const handlePointerMove = (event) => {
        if (prefersReducedMotion()) return;

        const rect = emblem.getBoundingClientRect();

        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;

        const rotateY = (x - 0.5) * 12;
        const rotateX = (0.5 - y) * 12;

        emblem.style.transform = `
          perspective(1000px)
          rotateX(${rotateX}deg)
          rotateY(${rotateY}deg)
        `;
      };

      const resetEmblem = () => {
        emblem.style.transition = "transform 0.45s ease";
        emblem.style.transform =
          "perspective(1000px) rotateX(0deg) rotateY(0deg)";

        setTimeout(() => {
          emblem.style.transition = "";
        }, 450);
      };

      emblem.addEventListener("pointermove", handlePointerMove);
      emblem.addEventListener("pointerleave", resetEmblem);

      motionQuery.addEventListener("change", () => {
        if (prefersReducedMotion()) {
          emblem.style.transform = "";
          emblem.style.transition = "";
        }
      });
    }


    /* =====================================
       2. SMOOTH SCROLL
    ===================================== */

    document.addEventListener("click", (event) => {

      const link = event.target.closest('a[href^="#"]');

      if (!link) return;

      const href = link.getAttribute("href");

      if (!href || href === "#") return;

      let target;

      try {
        target = document.querySelector(
          `#${CSS.escape(decodeURIComponent(href.slice(1)))}`
        );
      } catch {
        return;
      }

      if (!target) return;

      event.preventDefault();

      const header = document.querySelector(".site-header");

      const headerHeight = header
        ? header.offsetHeight
        : 0;

      const targetPosition =
        target.getBoundingClientRect().top +
        window.scrollY -
        headerHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: prefersReducedMotion() ? "auto" : "smooth"
      });

      if (history.pushState) {
        history.pushState(null, "", href);
      }
    });


    /* =====================================
       3. DYNAMIC MOTION PREFERENCE
    ===================================== */

    const handleMotionChange = () => {

      if (prefersReducedMotion()) {

        document.documentElement.style.scrollBehavior = "auto";

        if (emblem) {
          emblem.style.transform = "";
          emblem.style.transition = "";
        }

      } else {

        document.documentElement.style.scrollBehavior = "";

      }
    };

    handleMotionChange();

    motionQuery.addEventListener("change", handleMotionChange);

  });

})();
