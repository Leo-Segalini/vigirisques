const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];

const menuToggle = $(".menu-toggle");
const mainNav = $(".main-nav");
const MQ_NAV = 900;

function setNavOpen(open) {
  mainNav?.classList.toggle("open", open);
  menuToggle?.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("nav-open", open);
  if (!open) {
    $$(".nav-dropdown.open").forEach((d) => {
      d.classList.remove("open");
      d.querySelector(".dropdown-trigger")?.setAttribute("aria-expanded", "false");
    });
  }
}

menuToggle?.addEventListener("click", () => {
  setNavOpen(!mainNav.classList.contains("open"));
});

$$(".dropdown-trigger").forEach((btn) => {
  btn.addEventListener("click", () => {
    const parent = btn.closest(".nav-dropdown");
    const willOpen = !parent.classList.contains("open");
    $$(".nav-dropdown.open").forEach((d) => {
      if (d !== parent) {
        d.classList.remove("open");
        d.querySelector(".dropdown-trigger")?.setAttribute("aria-expanded", "false");
      }
    });
    parent.classList.toggle("open", willOpen);
    btn.setAttribute("aria-expanded", String(willOpen));
  });
});

$$(".main-nav a").forEach((a) => {
  a.addEventListener("click", () => setNavOpen(false));
});

document.addEventListener("click", (e) => {
  if (!e.target.closest(".site-header")) setNavOpen(false);
});

addEventListener("resize", () => {
  if (innerWidth > MQ_NAV) setNavOpen(false);
});

const tabLabels = {
  photo: "ÉTAPE 1 · VOTRE EXTÉRIEUR",
  detection: "ÉTAPE 2 · LES ÉLÉMENTS REPÉRÉS",
  plan: "ÉTAPE 3 · VOS PRIORITÉS",
  rapport: "ÉTAPE 4 · VOTRE RAPPORT",
};

function showPanel(name) {
  $$(".demo-tab").forEach((t) => {
    const active = t.dataset.tab === name;
    t.classList.toggle("active", active);
    t.setAttribute("aria-selected", String(active));
  });
  $$(".demo-panel").forEach((p) => p.classList.toggle("active", p.dataset.panel === name));
  const kicker = $("#demo-kicker");
  if (kicker) kicker.textContent = tabLabels[name];

  const activeTab = $(`.demo-tab[data-tab="${name}"]`);
  activeTab?.scrollIntoView({ inline: "nearest", block: "nearest", behavior: "smooth" });
}

$$(".demo-tab").forEach((t) => t.addEventListener("click", () => showPanel(t.dataset.tab)));
$$("[data-next]").forEach((b) => b.addEventListener("click", () => showPanel(b.dataset.next)));

let testimonialIndex = 0;

function visibleTestimonials() {
  if (innerWidth <= 640) return 1;
  if (innerWidth <= 900) return 2;
  return 3;
}

function moveTestimonials(dir = 0) {
  const track = $(".testimonial-track");
  const cards = $$(".testimonial-card");
  if (!track || !cards.length) return;

  const visible = visibleTestimonials();
  const max = Math.max(0, cards.length - visible);
  testimonialIndex = Math.max(0, Math.min(max, testimonialIndex + dir));
  const gap = 16;
  const cardWidth = cards[0].getBoundingClientRect().width;
  track.style.transform = `translateX(-${testimonialIndex * (cardWidth + gap)}px)`;
  $$(".carousel-dots span").forEach((d, i) => d.classList.toggle("active", i === testimonialIndex));
}

$("[data-test-prev]")?.addEventListener("click", () => moveTestimonials(-1));
$("[data-test-next]")?.addEventListener("click", () => moveTestimonials(1));
addEventListener("resize", () => moveTestimonials(0));

const modal = $("#demo-modal");
const firstField = $('input[name="name"]');
let lastFocus = null;

function openModal() {
  lastFocus = document.activeElement;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  setNavOpen(false);
  setTimeout(() => firstField?.focus(), 50);
}

function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  lastFocus?.focus();
}

$$("[data-demo]").forEach((b) => b.addEventListener("click", openModal));
$(".modal-close")?.addEventListener("click", closeModal);
$$("[data-close]").forEach((b) => b.addEventListener("click", closeModal));
modal?.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (modal?.classList.contains("open")) closeModal();
    else setNavOpen(false);
  }
  if (e.key === "Tab" && modal?.classList.contains("open")) {
    const items = $$("button, input, select, a[href]", modal).filter(
      (x) => !x.disabled && x.offsetParent !== null
    );
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
});

$("#demo-form")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const form = e.currentTarget;
  if (!form.reportValidity()) return;

  const data = new FormData(form);
  const lines = [
    `Nom: ${data.get("name") || ""}`,
    `Organisation: ${data.get("organization") || ""}`,
    `Email: ${data.get("email") || ""}`,
    `Profil: ${data.get("profile") || ""}`,
    "",
    "Demande de démonstration VigiRisques envoyée depuis le site.",
  ];
  const subject = encodeURIComponent("Demande de démonstration VigiRisques");
  const body = encodeURIComponent(lines.join("\n"));
  const mailto = `mailto:contact@vigirisques.fr?subject=${subject}&body=${body}`;

  form.hidden = true;
  const success = $(".form-success");
  if (success) success.hidden = false;

  // Ouvre le client mail sans bloquer l'UI en cas de blocage navigateur
  window.setTimeout(() => {
    window.location.href = mailto;
  }, 150);
});

const cookieBanner = $(".cookie-banner");
if (localStorage.getItem("vigirisques-cookie-choice")) cookieBanner.hidden = true;
$$("[data-cookie]").forEach((b) => {
  b.addEventListener("click", () => {
    localStorage.setItem("vigirisques-cookie-choice", b.dataset.cookie);
    cookieBanner.hidden = true;
  });
});

const year = $("#year");
if (year) year.textContent = String(new Date().getFullYear());
