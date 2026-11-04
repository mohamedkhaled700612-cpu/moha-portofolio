
/* =========================================
   MOHA — Premium Effects
   Lightweight interactions
========================================= */

document.addEventListener("DOMContentLoaded", () => {
    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
  
    // Reveal elements on scroll
    const revealElements = document.querySelectorAll(".reveal");
  
    if ("IntersectionObserver" in window && !reducedMotion) {
      const observer = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
              observer.unobserve(entry.target);
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
  
    // Header scroll effect
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
  
    // Subtle emblem movement on desktop
    const emblem = document.querySelector(".mk-emblem");
  
    if (emblem && !reducedMotion &&
        window.matchMedia("(pointer: fine)").matches) {
  
      emblem.addEventListener("mousemove", (event) => {
        const rect = emblem.getBoundingClientRect();
  
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
  
        const rotateY = (x - 0.5) * 5;
        const rotateX = (0.5 - y) * 5;
  
        emblem.style.transform =
          `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
      });
  
      emblem.addEventListener("mouseleave", () => {
        emblem.style.transform =
          "perspective(900px) rotateX(0) rotateY(0)";
      });
    }
  
    // Close mobile menu after clicking a link
    const mobileMenu = document.querySelector("#navMobile");
    const menuToggle = document.querySelector("#navToggle");
  
    if (mobileMenu && menuToggle) {
      mobileMenu.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
          mobileMenu.classList.remove("open");
          menuToggle.setAttribute("aria-expanded", "false");
        });
      });
    }
  });
  