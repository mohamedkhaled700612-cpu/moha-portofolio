
import { db } from "./firebase.js";
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/12.5.0/firebase-firestore.js";

/* MK Portfolio — bilingual site logic. Keep firebase.js and OneSignal worker in place. */

const SKILLS = [
  { key:"html", name:{en:"HTML",ar:"HTML"}, descKey:"skill.html.desc", icon:"&lt;/&gt;", color:"orange" },
  { key:"css", name:{en:"CSS",ar:"CSS"}, descKey:"skill.css.desc", icon:"✳", color:"blue" },
  { key:"js", name:{en:"JavaScript",ar:"JavaScript"}, descKey:"skill.js.desc", icon:"JS", color:"yellow" },
  { key:"python", name:{en:"Python",ar:"Python"}, descKey:"skill.python.desc", icon:"Py", color:"green" }
];

const ACHIEVEMENTS = [
  {
    title: {
      en: "School Management & Digital Platform",
      ar: "منصة مدرسية رقمية متكاملة"
    },
    issuer: {
      en: "LIVE PROJECT",
      ar: "مشروع تم إطلاقه"
    },
    desc: {
      en: "Designed, developed, and deployed a digital school platform that brings essential school services into one unified experience. Featuring Firebase integration, role-based access for administrators, teachers, and students, dynamic content management, academic resources, and dedicated user interfaces.",
      ar: "تصميم وتطوير وإطلاق منصة رقمية مدرسية تجمع الخدمات الأساسية في تجربة موحدة. تتضمن الربط مع Firebase، ونظام صلاحيات للإدارة والمعلمين والطلاب، وإدارة المحتوى الديناميكي، والملفات التعليمية، وواجهات مخصصة لكل فئة."
    }
  },
  {
    title: {
      en: "MOHA — E-Commerce Experience",
      ar: "MOHA — تجربة تجارة إلكترونية"
    },
    issuer: {
      en: "INDEPENDENT PROJECT",
      ar: "مشروع تطوير مستقل"
    },
    desc: {
      en: "Engineered a feature-rich e-commerce experience with interactive product displays, dynamic search and filtering, shopping cart, wishlist, discount codes, dark mode, and a demonstration admin dashboard. Built with a focus on functionality, responsive design, and user experience.",
      ar: "تطوير تجربة تجارة إلكترونية غنية بالمميزات، تشمل عرض المنتجات التفاعلي، والبحث والتصفية الديناميكية، وسلة التسوق، والمفضلة، وأكواد الخصم، والوضع الداكن، ولوحة إدارة تجريبية. مع التركيز على الأداء والتصميم المتجاوب وتجربة المستخدم."
    }
  },
  {
    title: {
      en: "Interactive Frontend Engineering",
      ar: "هندسة وتطوير واجهات تفاعلية"
    },
    issuer: {
      en: "WEB DEVELOPMENT",
      ar: "تطوير الويب"
    },
    desc: {
      en: "Built interactive web experiences using structured JavaScript logic, dynamic rendering, form validation, responsive layouts, and reusable interface patterns to deliver consistent experiences across devices.",
      ar: "بناء تجارب ويب تفاعلية باستخدام منطق JavaScript منظم، والعرض الديناميكي للمحتوى، والتحقق من النماذج، والتصميم المتجاوب، وأنماط واجهات قابلة لإعادة الاستخدام لتقديم تجربة متناسقة على مختلف الأجهزة."
    }
  },
  {
    title: {
      en: "Firebase Integration & Data Workflows",
      ar: "تكامل Firebase وإدارة تدفق البيانات"
    },
    issuer: {
      en: "TECHNICAL IMPLEMENTATION",
      ar: "تنفيذ تقني"
    },
    desc: {
      en: "Integrated web applications with Firebase and Cloud Firestore, implementing data submission workflows and connecting frontend interfaces with cloud-based services to support practical application requirements.",
      ar: "ربط تطبيقات الويب بخدمات Firebase وCloud Firestore، وتنفيذ آليات إرسال البيانات وربط واجهات المستخدم بالخدمات السحابية لتلبية احتياجات التطبيقات العملية."
    }
  }
];

const PROJECTS = [{
  sample: true,
  name: {
    en: "MOHA — Premium E-Commerce Experience",
    ar: "MOHA — تجربة تجارة إلكترونية متكاملة"
  },
  desc: {
    en: "A carefully crafted e-commerce experience built with attention to detail, modern design, and user experience. Featuring responsive layouts, interactive product pages, smart search and filtering, shopping cart, wishlist, discount codes, dark mode, and a demo admin dashboard. Every detail was designed to create a smooth and engaging shopping experience. Have a project in mind? Want to grow your business with a professional website? Let's build something great together. Get in touch today!",
    ar: "تجربة تجارة إلكترونية متكاملة تم تطويرها بعناية واهتمام بأدق التفاصيل، تجمع بين التصميم العصري وسهولة الاستخدام. تتضمن صفحات منتجات تفاعلية، والبحث والتصفية، وسلة التسوق، والمفضلة، وأكواد الخصم، والوضع الداكن، ولوحة إدارة تجريبية. تم الاهتمام بكل تفصيلة لتقديم تجربة تسوق سلسة ومميزة. عندك مشروع وعاوز تكبّر نشاطك التجاري؟ خلينا نحول فكرتك لموقع احترافي. ابعتلي دلوقتي ونبدأ!"
  },
  tech: ["HTML", "CSS", "JavaScript"],
  image: "./assests/images/moha-preview.png",
  liveDemo: "https://mohamedkhaled700612-cpu.github.io/moha-store/"
}];

const SERVICES = [
  {icon:"▤", title:"services.1.title", desc:"services.1.desc"},
  {icon:"↗", title:"services.2.title", desc:"services.2.desc"},
  {icon:"✳", title:"services.3.title", desc:"services.3.desc"},
  {icon:"⌘", title:"services.4.title", desc:"services.4.desc"}
];

const CONTACTS = [
  {
    type: "facebook",
    label: { en: "Facebook", ar: "فيسبوك" },
    href: "https://www.facebook.com/share/19cmJhaaA9/",
    value: "Visit my Facebook",
    icon: "f"
  },
  {
    type: "whatsapp",
    label: { en: "WhatsApp", ar: "واتساب" },
    href: "https://wa.me/201557382052",
    value: "+20 155 738 2052",
    icon: "WA"
  },
  {
    type: "phone",
    label: { en: "Phone", ar: "رقم الهاتف" },
    href: "tel:+201557382052",
    value: "+20 155 738 2052",
    icon: "☎"
  }
];

let currentLang = localStorage.getItem("mk-lang") || "en";
if (!["en","ar"].includes(currentLang)) currentLang = "en";

const $ = (selector, root=document) => root.querySelector(selector);

function t(key) {
  return window.I18N?.[currentLang]?.[key] || key;
}

function applyLanguage() {
  const isAr = currentLang === "ar";

  document.documentElement.lang = currentLang;
  document.documentElement.dir = isAr ? "rtl" : "ltr";

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    const value = t(key);

    const richTextKeys = new Set([
      "hero.sticker", "about.title", "skills.title", "projects.title",
      "achievements.title", "services.title", "principles.title",
      "request.title", "contact.title"
    ]);

    if (richTextKeys.has(key)) {
      el.innerHTML = value;
    } else if (el.children.length && el.querySelector("span, b, i")) {
      const textNode = Array.from(el.childNodes).find(
        n => n.nodeType === Node.TEXT_NODE && n.textContent.trim()
      );

      if (textNode) textNode.textContent = value + " ";
      else el.insertBefore(document.createTextNode(value + " "), el.firstChild);
    } else {
      el.textContent = value;
    }
  });

  $("#langLabel").textContent = t("lang.label");
  $("#aboutBio").textContent = t("about.bio");

  renderSkills();
  renderAchievements();
  renderProjects();
  renderServices();
  renderContacts();
  updateMailLink();
}

function renderSkills() {
  const grid = $("#skillsGrid");

  grid.innerHTML = SKILLS.map((s,i)=>`
    <article class="skill-card reveal" style="--card-index:${i}">
      <div class="skill-card-top">
        <span class="skill-symbol ${s.color}">${s.icon}</span>
        <span class="card-index">0${i+1}</span>
      </div>
      <h3>${s.name[currentLang]}</h3>
      <p>${t(s.descKey)}</p>
      <span class="skill-card-line"></span>
    </article>
  `).join("");

  observeReveals();
}

function renderAchievements() {
  const box = $("#achievementsContainer");

  if (!ACHIEVEMENTS.length) {
    box.innerHTML = `
      <div class="achievement-empty reveal">
        <span>✳</span>
        <div>
          <h3>${t("achievements.empty.title")}</h3>
          <p>${t("achievements.empty.desc")}</p>
        </div>
      </div>
    `;
  } else {
    box.innerHTML = ACHIEVEMENTS.map(a=>`
      <article class="achievement-card reveal">
        <span class="achievement-star">✳</span>
        <h3>${a.title[currentLang]}</h3>
        <p>${a.issuer[currentLang]}</p>
        <small>${a.desc[currentLang]}</small>
      </article>
    `).join("");
  }

  observeReveals();
}

function renderContacts() {
  $("#contactLinks").innerHTML = CONTACTS
    .filter(c => c.href && c.value)
    .map(c => `
      <a class="contact-link reveal"
         href="${c.href}"
         ${c.href.startsWith("http") ? 'target="_blank" rel="noopener"' : ""}>
        <span class="contact-icon">${c.icon}</span>
        <span class="contact-label">${c.label[currentLang]}</span>
        <span class="contact-value">${c.value}</span>
        <span class="contact-arrow">↗</span>
      </a>
    `)
    .join("");

  observeReveals();
}

function renderProjects() {
  const grid = $("#projectsGrid");

  if (!grid) {
    console.error("projectsGrid element not found");
    return;
  }

  grid.innerHTML = PROJECTS.map((p, i) => {
    const tech = p.tech.map(x => `<span>${x}</span>`).join("");

    return `
      <article class="project-card reveal" style="--card-index:${i}">
        <a class="project-image-link"
           href="${p.liveDemo}"
           target="_blank"
           rel="noopener"
           aria-label="${p.name[currentLang]}">
          <div class="project-thumb">
            ${p.sample ? `<span class="project-badge">${t("projects.sample")}</span>` : ""}
            ${p.image
              ? `<img class="project-preview" src="${p.image}" alt="${p.name[currentLang]}" loading="lazy">`
              : `<span class="project-placeholder">MK</span>`
            }
            <span class="project-image-arrow">↗</span>
          </div>
        </a>

        <div class="project-body">
          <div class="project-meta">
            <span>FEATURED PROJECT</span>
            <span>0${i + 1} / 01</span>
          </div>

          <h3>${p.name[currentLang]}</h3>
          <p>${p.desc[currentLang]}</p>

          <div class="project-tech">${tech}</div>

          <div class="project-links">
            <a class="project-demo"
               href="${p.liveDemo}"
               target="_blank"
               rel="noopener">
              ${t("projects.demo")} <span>↗</span>
            </a>
          </div>
        </div>
      </article>
    `;
  }).join("");

  observeReveals();
}

function renderServices() {
  $("#servicesGrid").innerHTML = SERVICES.map((s,i)=>`
    <article class="service-card reveal" style="--card-index:${i}">
      <div class="service-top">
        <span class="service-icon">${s.icon}</span>
        <span class="service-num">0${i+1}</span>
      </div>
      <h3>${t(s.title)}</h3>
      <p>${t(s.desc)}</p>
      <span class="service-arrow">↗</span>
    </article>
  `).join("");

  observeReveals();
}

function updateMailLink() {
  const email = CONTACTS.find(c=>c.type==="email" && c.value)?.value;
  const link = $("#contactMail");

  if (email) link.href = `mailto:${email}`;
  else link.href = "#request";
}

function toggleLanguage() {
  currentLang = currentLang === "en" ? "ar" : "en";
  localStorage.setItem("mk-lang", currentLang);
  applyLanguage();
}

function setupMobileNav() {
  const toggle = $("#navToggle");
  const nav = $("#navMobile");

  toggle.addEventListener("click",()=>{
    const open = nav.classList.toggle("open");

    toggle.classList.toggle("open",open);
    toggle.setAttribute("aria-expanded",String(open));
    document.body.classList.toggle("menu-open",open);
  });

  nav.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{
    nav.classList.remove("open");
    toggle.classList.remove("open");
    toggle.setAttribute("aria-expanded","false");
    document.body.classList.remove("menu-open");
  }));
}

function setupHeaderScroll() {
  const header = $("#siteHeader");
  const update = () => header.classList.toggle("scrolled",window.scrollY > 24);

  update();
  window.addEventListener("scroll",update,{passive:true});
}

let revealObserver = null;

function observeReveals() {
  if (!("IntersectionObserver" in window)) {
    document.querySelectorAll(".reveal").forEach(el=>el.classList.add("visible"));
    return;
  }

  if (!revealObserver) {
    revealObserver = new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },{threshold:.12,rootMargin:"0px 0px -35px 0px"});
  }

  document.querySelectorAll(".reveal:not(.visible)").forEach(
    el=>revealObserver.observe(el)
  );
}

function setupNavHighlight() {
  const links = document.querySelectorAll(".nav-desktop a,.nav-mobile a");
  const sections = [...links]
    .map(a=>document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  if (!("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if (entry.isIntersecting) {
        links.forEach(a=>a.classList.toggle(
          "active",
          a.getAttribute("href")==="#" + entry.target.id
        ));
      }
    });
  },{rootMargin:"-35% 0px -55% 0px"});

  sections.forEach(s=>observer.observe(s));
}

function setError(field,message) {
  const wrap = field.closest(".field");
  const err = wrap?.querySelector(".error");

  wrap?.classList.toggle("invalid",!!message);

  if (err) err.textContent = message || "";
}

function emailValid(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function phoneValid(value) {
  const digits = value.replace(/\D/g, "");
  return digits.length >= 8 && digits.length <= 15;
}

function validateForm(form) {
  let ok = true;

  const name = form.elements.clientName;
  const email = form.elements.email;
  const phone = form.elements.phone;
  const type = form.elements.projectType;
  const budget = form.elements.budget;
  const deadline = form.elements.deadline;
  const desc = form.elements.description;

  const check = (field,valid,key) => {
    setError(field,valid ? "" : t(key));
    if (!valid) ok = false;
  };

  check(name,!!name.value.trim(),"request.err.name");
  check(email,emailValid(email.value.trim()),"request.err.email");
  check(phone,phoneValid(phone.value.trim()),"request.err.phone");
  check(type,!!type.value,"request.err.type");

  if (budget.value && Number(budget.value) < 0) {
    check(budget,false,"request.err.budget");
  } else {
    setError(budget,"");
  }

  if (deadline.value) {
    const d = new Date(`${deadline.value}T00:00:00`);
    const today = new Date();
    today.setHours(0,0,0,0);
    check(deadline,d >= today,"request.err.deadline");
  } else {
    setError(deadline,"");
  }

  check(desc,desc.value.trim().length >= 10,"request.err.description");

  return ok;
}

async function sendRequest(payload) {
  try {
    const docRef = await addDoc(collection(db,"projectRequests"),{
      clientName: payload.clientName,
      email: payload.email,
      phone: payload.phone,
      projectType: payload.projectType,
      budget: payload.budget,
      deadline: payload.deadline,
      description: payload.description,
      submittedAt: new Date().toISOString()
    });

    // Notification failure must not cancel a successfully stored request.
    try {
      const response = await fetch(
        "https://mk-portfolio-notify.mohamedkhaled700612.workers.dev",
        {
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({clientName:payload.clientName})
        }
      );

      if (!response.ok) {
        console.error("Notification request failed:",await response.text());
      }
    } catch(error) {
      console.error("Notification error:",error);
    }

    return {ok:true,id:docRef.id};

  } catch(error) {
    console.error("Firebase error:",error);
    return {ok:false,reason:"firestore"};
  }
}

function setupForm() {
  const form = $("#requestForm");
  const status = $("#formStatus");

  if (!form || !status) {
    console.error("Request form elements not found");
    return;
  }

  form.addEventListener("submit",async e=>{
    e.preventDefault();

    status.className = "form-status";
    status.textContent = "";

    if (!validateForm(form)) {
      status.classList.add("error");
      status.textContent = t("request.err.fix");
      return;
    }

    const payload = {
      clientName: form.elements.clientName.value.trim(),
      email: form.elements.email.value.trim(),
      phone: form.elements.phone.value.trim(),
      projectType: form.elements.projectType.value,
      budget: form.elements.budget.value
        ? Number(form.elements.budget.value)
        : null,
      deadline: form.elements.deadline.value || null,
      description: form.elements.description.value.trim()
    };

    const button = form.querySelector('button[type="submit"]');

    button.disabled = true;
    status.classList.add("pending");
    status.textContent = t("request.status.sending");

    const result = await sendRequest(payload);

    button.disabled = false;
    status.classList.remove("pending");

    if (result.ok) {
      status.classList.add("success");
      status.textContent = t("request.status.success");
      form.reset();
    } else {
      status.classList.add("error");
      status.textContent = t("request.status.failure");
    }
  });
}

function setupParallax() {
  const visual = $(".hero-visual");

  if (!visual || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return;
  }

  window.addEventListener("pointermove",e=>{
    if (window.innerWidth < 900) return;

    const x = (e.clientX / window.innerWidth - .5) * 8;
    const y = (e.clientY / window.innerHeight - .5) * 8;

    visual.style.transform = `translate3d(${x}px,${y}px,0)`;
  },{passive:true});
}

document.addEventListener("DOMContentLoaded",()=>{
  applyLanguage();
  setupMobileNav();
  setupHeaderScroll();
  setupForm();
  setupNavHighlight();
  setupParallax();
  observeReveals();

  $("#langToggle").addEventListener("click",toggleLanguage);
});
