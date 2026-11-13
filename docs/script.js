/* HuellApp landing v2 — JS sin dependencias */

/* ── Enlaces de descarga ─────────────────────────────────────────────
   Completá cada enlace con la URL real cuando esté disponible.
   Si queda vacío (""), el botón se muestra como "Próximamente".
     android: "https://play.google.com/store/apps/details?id=TU.PACKAGE"
     ios:     "https://apps.apple.com/app/..."  (o link de TestFlight)
     apk:     "https://github.com/AlexMeridaPozo/Vetlink/releases/latest"
──────────────────────────────────────────────────────────────────── */
const DOWNLOAD_LINKS = {
  android: "",
  ios: "",
  apk: "https://github.com/AlexMeridaPozo/Vetlink/releases/download/v1.0.0/HuellApp.apk"
};

const BUTTONS = [
  { key: "android", small: "Disponible en", label: "Google Play", icon: "i-phone", cls: "" },
  { key: "ios", small: "Disponible en", label: "App Store", icon: "i-phone", cls: "" },
  { key: "apk", small: "Instalación directa", label: "Descargar APK", icon: "i-down", cls: "store--apk" }
];

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.documentElement.classList.add("js");

/* Toast */
let toastTimer;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg;
  t.classList.add("on");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("on"), 2600);
}

/* Botones de descarga */
function renderStores() {
  $$("[data-stores]").forEach(box => {
    BUTTONS.forEach(b => {
      const url = DOWNLOAD_LINKS[b.key];
      const a = document.createElement("a");
      a.className = "store " + b.cls;
      a.innerHTML =
        '<svg aria-hidden="true"><use href="#' + b.icon + '"/></svg>' +
        "<span><small>" + (url ? b.small : "Próximamente") + "</small><b>" + b.label + "</b></span>";
      if (url) {
        a.href = url; a.target = "_blank"; a.rel = "noopener";
      } else {
        a.classList.add("is-soon");
        a.setAttribute("role", "link");
        a.setAttribute("aria-disabled", "true");
        a.addEventListener("click", e => { e.preventDefault(); toast("Esta descarga estará disponible pronto."); });
      }
      box.appendChild(a);
    });
  });
  const note = $("#soonNote");
  if (note && Object.values(DOWNLOAD_LINKS).every(v => !v)) note.hidden = false;
}

/* Tema claro / oscuro */
function initTheme() {
  const root = document.documentElement;
  const btn = $("#themeBtn");
  const sync = () => btn.setAttribute("aria-label",
    root.getAttribute("data-theme") === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
  sync();
  btn.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    try { localStorage.setItem("huella-theme", next); } catch (e) {}
    sync();
  });
}

/* Nav + barra de progreso */
function initNav() {
  const nav = $("#nav"), toggle = $("#navToggle"), links = $("#navLinks"), bar = $("#progress");
  const onScroll = () => {
    nav.classList.toggle("is-stuck", window.scrollY > 10);
    const h = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + "%";
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });
  $$("a", links).forEach(a => a.addEventListener("click", () => {
    links.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }));
}

/* Reveal al hacer scroll */
function initReveal() {
  const items = $$(".reveal");
  if (!("IntersectionObserver" in window)) { items.forEach(i => i.classList.add("in")); $("#steps")?.classList.add("in"); return; }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } });
  }, { threshold: 0.12 });
  items.forEach((el, i) => { el.style.transitionDelay = (i % 4) * 70 + "ms"; io.observe(el); });
  const steps = $("#steps");
  if (steps) {
    const so = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { steps.classList.add("in"); so.disconnect(); } }), { threshold: 0.3 });
    so.observe(steps);
  }
}

/* Parallax del hero con el mouse */
function initParallax() {
  const box = $("#tilt");
  if (!box || reduceMotion) return;
  $$("[data-depth]", box).forEach(el => el.style.setProperty("--d", el.dataset.depth));
  const hero = $("#hero");
  hero.addEventListener("mousemove", e => {
    const r = box.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const y = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    box.style.setProperty("--mx", Math.max(-1.4, Math.min(1.4, x)).toFixed(3));
    box.style.setProperty("--my", Math.max(-1.4, Math.min(1.4, y)).toFixed(3));
  });
  hero.addEventListener("mouseleave", () => { box.style.setProperty("--mx", 0); box.style.setProperty("--my", 0); });
}

/* Tabs de la app (autoplay + click) */
function initTabs() {
  const tabs = $$(".tab"), shots = $$(".shot"), screen = $(".phone--stage .phone__screen"), stage = $("#stage");
  if (!tabs.length) return;
  let cur = 0, visible = false, hovered = false;
  const apply = () => stage.classList.toggle("is-paused", !visible || hovered);
  function select(i) {
    cur = (i + tabs.length) % tabs.length;
    tabs.forEach((t, k) => {
      const on = k === cur;
      t.classList.remove("is-on");
      t.setAttribute("aria-selected", String(on));
    });
    void stage.offsetWidth; /* reinicia la animación de la barra */
    tabs[cur].classList.add("is-on");
    shots.forEach((s, k) => s.classList.toggle("is-on", k === cur));
    screen.dataset.i = cur;
  }
  tabs.forEach((t, i) => t.addEventListener("click", () => select(i)));
  $$(".tab__bar i").forEach(bar => bar.addEventListener("animationend", () => select(cur + 1)));
  [stage, $("#tabs")].forEach(el => {
    el.addEventListener("mouseenter", () => { hovered = true; apply(); });
    el.addEventListener("mouseleave", () => { hovered = false; apply(); });
  });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(es => { visible = es[0].isIntersecting; apply(); }, { threshold: 0.35 }).observe(stage);
  } else { visible = true; }
  apply();
  select(0);
}

/* Spotlight en las tarjetas bento */
function initSpotlight() {
  $$("[data-spot]").forEach(c => c.addEventListener("mousemove", e => {
    const r = c.getBoundingClientRect();
    c.style.setProperty("--sx", (e.clientX - r.left) + "px");
    c.style.setProperty("--sy", (e.clientY - r.top) + "px");
  }));
}

/* Contadores */
function initCounters() {
  const els = $$("[data-count]");
  const run = el => {
    const end = +el.dataset.count, suf = el.dataset.suffix || "";
    if (reduceMotion) { el.textContent = end + suf; return; }
    const t0 = performance.now(), dur = 1400;
    const tick = t => {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(end * e) + suf;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if (!("IntersectionObserver" in window)) { els.forEach(run); return; }
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } }), { threshold: 0.6 });
  els.forEach(el => io.observe(el));
}

/* Demo de rescate */
function initDemo() {
  const demo = $("#demo"), btn = $("#scanBtn"), txt = $("#scanTxt"), hint = $("#scanHint"), reset = $("#resetBtn");
  if (!demo) return;
  demo.dataset.mode = "qr";
  let timer;
  const labels = {
    qr: { btn: "Escanear chapita", hint: "Tocá el botón para simular el escaneo" },
    nfc: { btn: "Acercar celular", hint: "Tocá el botón para simular la lectura NFC" }
  };
  const idle = () => {
    clearTimeout(timer);
    demo.classList.remove("is-scanning", "is-found");
    const m = demo.dataset.mode;
    txt.textContent = labels[m].btn; hint.textContent = labels[m].hint; btn.disabled = false;
  };
  btn.addEventListener("click", () => {
    if (demo.classList.contains("is-scanning")) return;
    demo.classList.add("is-scanning");
    btn.disabled = true;
    txt.textContent = demo.dataset.mode === "nfc" ? "Leyendo chip…" : "Escaneando…";
    timer = setTimeout(() => {
      demo.classList.remove("is-scanning");
      demo.classList.add("is-found");
      btn.disabled = false;
    }, reduceMotion ? 300 : 1900);
  });
  reset.addEventListener("click", idle);
  $$("#seg button").forEach(b => b.addEventListener("click", () => {
    $$("#seg button").forEach(x => { x.classList.toggle("is-on", x === b); x.setAttribute("aria-selected", String(x === b)); });
    demo.dataset.mode = b.dataset.mode;
    idle();
  }));
  $$("[data-demo]", demo).forEach(b => b.addEventListener("click", () => toast(b.dataset.demo + " (demo)")));
}

document.addEventListener("DOMContentLoaded", () => {
  renderStores();
  initTheme();
  initNav();
  initReveal();
  initParallax();
  initTabs();
  initSpotlight();
  initCounters();
  initDemo();
  $("#year").textContent = new Date().getFullYear();
});
