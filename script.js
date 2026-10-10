/* =========================================================
   lrmartinez.dev · animaciones y scroll
   ========================================================= */

(() => {
  "use strict";

  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const touch = matchMedia("(hover: none)").matches;
  const body = document.body;
  const root = document.documentElement;

  let vw = innerWidth;
  let vh = innerHeight;

  console.log("%c¡Hola, curioso! 👀", "font:800 22px sans-serif;color:#ff5a36");
  console.log("Sí, estoy aprendiendo. Si ves un bug, es feature.");

  /* ---------- 1. Partir el título en letras ---------- */
  let charIndex = 0;
  $$(".split").forEach((el) => {
    const text = el.textContent;
    el.textContent = "";
    [...text].forEach((chr) => {
      const s = document.createElement("span");
      s.className = "ch";
      s.setAttribute("aria-hidden", "true");
      s.style.setProperty("--i", charIndex++);
      s.textContent = chr === " " ? " " : chr;
      el.appendChild(s);
    });
  });

  /* ---------- 2. Texto "sobre mí" palabra por palabra ---------- */
  const wordsEl = $("#words");
  const wordSpans = [];
  if (wordsEl) {
    const raw = wordsEl.dataset.text || wordsEl.textContent;
    wordsEl.textContent = "";
    raw.trim().split(/\s+/).forEach((w) => {
      const hl = w.startsWith("*");
      const clean = hl ? w.replace(/\*/g, "") : w;
      const s = document.createElement("span");
      s.className = "w" + (hl ? " hl" : "");
      s.textContent = clean + " ";
      wordsEl.appendChild(s);
      wordSpans.push(s);
    });
    if (reduce) wordSpans.forEach((s) => s.classList.add("lit"));
  }

  /* ---------- 3. Revelar elementos al entrar en pantalla ---------- */
  let revealStarted = false;
  function initReveal() {
    if (revealStarted) return;
    revealStarted = true;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -6% 0px" }
    );
    $$(".reveal").forEach((el) => io.observe(el));

    // contadores
    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            countUp(e.target);
            cio.unobserve(e.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    $$("[data-count]").forEach((el) => cio.observe(el));
  }

  function countUp(el) {
    const to = +el.dataset.count;
    if (reduce) { el.textContent = to.toLocaleString("es-GT"); return; }
    const t0 = performance.now();
    const dur = 1900;
    (function step(now) {
      const t = clamp((now - t0) / dur);
      const e = 1 - Math.pow(1 - t, 4);
      el.textContent = Math.round(to * e).toLocaleString("es-GT");
      if (t < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* ---------- 4. Color de fondo por sección ---------- */
  const bgIO = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          body.style.setProperty("--bg", e.target.dataset.bg);
          body.style.setProperty("--fg", e.target.dataset.ink || "#14110f");
        }
      });
    },
    { rootMargin: "-50% 0px -50% 0px" }
  );
  $$("[data-bg]").forEach((s) => bgIO.observe(s));

  /* ---------- 5. Pantalla de carga ---------- */
  const loader = $("#loader");
  const loadNum = $("#loadNum");
  const loadMsg = $("#loadMsg");
  const msgs = [
    "instalando café…",
    "buscando el punto y coma…",
    "borrando console.logs…",
    "negociando con el CSS…",
  ];

  function finishLoad() {
    loader.classList.add("out");
    body.classList.remove("loading");
    body.classList.add("loaded");
    setTimeout(initReveal, 500);
    setTimeout(() => {
      const t = $(".title");
      if (t) t.classList.add("settled");
      loader.remove();
    }, 2600);
  }

  if (reduce) {
    loader.remove();
    body.classList.remove("loading");
    body.classList.add("loaded");
    $(".title").classList.add("settled");
    initReveal();
  } else {
    const t0 = performance.now();
    const dur = 1900;
    let lastMsg = -1;
    (function step(now) {
      const t = clamp((now - t0) / dur);
      const e = 1 - Math.pow(1 - t, 3);
      loadNum.textContent = Math.round(e * 100);
      const mi = Math.min(msgs.length - 1, Math.floor(t * msgs.length));
      if (mi !== lastMsg) { loadMsg.textContent = msgs[mi]; lastMsg = mi; }
      if (t < 1) requestAnimationFrame(step);
      else setTimeout(finishLoad, 250);
    })(t0);
  }

  /* ---------- 6. Marquees (reaccionan a la velocidad del scroll) ---------- */
  const marquees = $$(".mq").map((el) => {
    const track = $(".mq-track", el);
    const group = $(".mq-group", track);
    return { el, track, group, dir: +el.dataset.dir || -1, x: 0, gw: 1 };
  });

  function measureMarquees() {
    marquees.forEach((m) => {
      // dejar solo 1 grupo, medir y clonar las veces necesarias
      $$(".mq-group", m.track).slice(1).forEach((g) => g.remove());
      m.gw = m.group.offsetWidth || 1;
      const copies = Math.ceil((vw * 1.2) / m.gw) + 2;
      for (let i = 0; i < copies; i++) m.track.appendChild(m.group.cloneNode(true));
    });
  }

  /* ---------- 7. Medidas del scroll horizontal ---------- */
  const hs = $("#proyectos");
  const hsTrack = $("#hsTrack");
  const hsBar = $("#hsBar");
  let hsMax = 0;

  function measure() {
    vw = innerWidth;
    vh = innerHeight;
    if (hs && hsTrack) {
      hsMax = Math.max(0, hsTrack.scrollWidth - vw);
      hs.style.height = hsMax + vh + "px";
    }
    measureMarquees();
  }

  addEventListener("resize", measure);
  addEventListener("load", measure);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  measure();

  /* ---------- 8. Cursor personalizado ---------- */
  const cursor = $("#cursor");
  const clabel = $("#clabel");
  let tx = -100, ty = -100, cx = -100, cy = -100;
  let mxT = 0, myT = 0, mx = 0, my = 0;

  addEventListener("pointermove", (e) => {
    tx = e.clientX;
    ty = e.clientY;
    mxT = e.clientX / vw - 0.5;
    myT = e.clientY / vh - 0.5;
  });

  if (!touch) {
    document.addEventListener("pointerover", (e) => {
      const withLabel = e.target.closest("[data-cursor]");
      const link = e.target.closest("a, button");
      cursor.classList.toggle("big", !!withLabel);
      cursor.classList.toggle("link", !!link && !withLabel);
      clabel.textContent = withLabel ? withLabel.dataset.cursor : "";
    });
  }

  /* ---------- 9. Tilt 3D en las tarjetas ---------- */
  if (!touch && !reduce) {
    $$(".card:not(.ghost)").forEach((c) => {
      c.addEventListener("pointermove", (e) => {
        const r = c.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        c.classList.add("moving");
        c.style.setProperty("--ry", px * 14 + "deg");
        c.style.setProperty("--rx", -py * 14 + "deg");
        c.style.setProperty("--lift", "-8px");
      });
      c.addEventListener("pointerleave", () => {
        c.classList.remove("moving");
        c.style.setProperty("--rx", "0deg");
        c.style.setProperty("--ry", "0deg");
        c.style.setProperty("--lift", "0px");
      });
    });
  }

  /* ---------- 10. Loop principal ligado al scroll ---------- */
  const progTop = $("#progTop");
  const pctEl = $("#pct");
  const meter = $("#meter");
  const about = $("#sobre");
  const note = $("#note");
  const roadList = $("#roadList");
  const roadFill = $("#roadFill");
  const chipsBox = $("#chips");
  const chips = $$(".chip");
  const stickers = $$(".sticker, .hand");

  let lastY = scrollY;
  let vel = 0;
  let hsCur = 0;
  let lastLit = -1;
  let lastPct = -1;

  function frame() {
    const y = scrollY;
    vel = lerp(vel, y - lastY, 0.12);
    lastY = y;

    mx = lerp(mx, mxT, 0.06);
    my = lerp(my, myT, 0.06);

    const max = Math.max(1, root.scrollHeight - vh);
    const p = clamp(y / max);

    // barra superior + medidor
    progTop.style.transform = "scaleX(" + p + ")";
    const pct = Math.round(p * 100);
    if (pct !== lastPct) {
      pctEl.textContent = pct;
      meter.classList.toggle("done", p > 0.985);
      lastPct = pct;
    }

    // cursor
    if (!touch) {
      cx = lerp(cx, tx, 0.2);
      cy = lerp(cy, ty, 0.2);
      cursor.style.transform = "translate3d(" + cx + "px," + cy + "px,0)";
    }

    if (!reduce) {
      // stickers del hero (parallax scroll + mouse)
      if (y < vh * 1.6) {
        stickers.forEach((s) => {
          const sp = parseFloat(s.dataset.speed || 0);
          const d = parseFloat(s.dataset.depth || 1);
          s.style.translate = mx * d * 50 + "px " + (-y * sp + my * d * 40) + "px";
        });
      }

      // marquees
      marquees.forEach((m) => {
        m.x += m.dir * (0.9 + vel * 0.45);
        m.x = m.x % m.gw;
        if (m.x > 0) m.x -= m.gw;
        m.track.style.transform = "translate3d(" + m.x + "px,0,0)";
      });

      // chips (parallax vertical sin retroalimentación)
      if (chipsBox) {
        const r = chipsBox.getBoundingClientRect();
        if (r.bottom > -200 && r.top < vh + 200) {
          const base = r.top + r.height / 2 - vh / 2;
          chips.forEach((c) => {
            c.style.translate = "0 " + base * parseFloat(c.dataset.sp || 0) + "px";
          });
        }
      }

      // scroll horizontal con inercia + inclinación según velocidad
      if (hs) {
        const r = hs.getBoundingClientRect();
        const total = Math.max(1, hs.offsetHeight - vh);
        const hp = clamp(-r.top / total);
        hsCur = lerp(hsCur, hp, 0.1);
        const skew = clamp(vel * -0.12, -6, 6);
        hsTrack.style.transform =
          "translate3d(" + -hsCur * hsMax + "px,0,0) skewX(" + skew + "deg)";
        hsBar.style.transform = "scaleX(" + hsCur + ")";
      }
    } else if (hs) {
      const r = hs.getBoundingClientRect();
      const hp = clamp(-r.top / Math.max(1, hs.offsetHeight - vh));
      hsTrack.style.transform = "translate3d(" + -hp * hsMax + "px,0,0)";
      hsBar.style.transform = "scaleX(" + hp + ")";
    }

    // texto que se ilumina
    if (about && wordSpans.length && !reduce) {
      const r = about.getBoundingClientRect();
      const t = clamp(-r.top / Math.max(1, r.height - vh));
      const n = Math.ceil(clamp(t / 0.82) * wordSpans.length);
      if (n !== lastLit) {
        wordSpans.forEach((s, i) => s.classList.toggle("lit", i < n));
        lastLit = n;
      }
      if (note) note.classList.toggle("show", t > 0.9);
    } else if (note) {
      note.classList.add("show");
    }

    // línea del camino
    if (roadList) {
      const r = roadList.getBoundingClientRect();
      const f = clamp((vh * 0.7 - r.top) / r.height);
      roadFill.style.transform = "scaleY(" + f + ")";
    }

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ---------- 11. Confeti ---------- */
  const cv = $("#confetti");
  const ctx = cv.getContext("2d");
  const COLORS = ["#ff5a36", "#ffd23f", "#7be0b0", "#f3ecdf", "#14110f"];
  let parts = [];
  let running = false;
  let dpr = 1;

  function sizeCanvas() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    cv.width = innerWidth * dpr;
    cv.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  addEventListener("resize", sizeCanvas);
  sizeCanvas();

  function burst(x, y, n = 90) {
    if (reduce) return;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 5 + Math.random() * 10;
      parts.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 7,
        w: 6 + Math.random() * 8,
        h: 4 + Math.random() * 6,
        r: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.4,
        c: COLORS[(Math.random() * COLORS.length) | 0],
        life: 0,
      });
    }
    if (!running) { running = true; requestAnimationFrame(confettiLoop); }
  }

  function confettiLoop() {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    parts = parts.filter((p) => p.y < innerHeight + 40 && p.life < 260);
    parts.forEach((p) => {
      p.life++;
      p.vy += 0.35;
      p.vx *= 0.99;
      p.x += p.vx;
      p.y += p.vy;
      p.r += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.r);
      ctx.fillStyle = p.c;
      ctx.strokeStyle = "#14110f";
      ctx.lineWidth = 1.5;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.strokeRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    if (parts.length) requestAnimationFrame(confettiLoop);
    else running = false;
  }

  // botón "NO presiones"
  const dont = $("#dont");
  const dontTexts = [
    "te dije que NO 😤",
    "ya paraaa",
    "ok ok… el último",
    "¿en serio sigues?",
    "ya, gracias por tu visita 💛",
  ];
  let dontCount = 0;
  dont.addEventListener("click", (e) => {
    const r = dont.getBoundingClientRect();
    burst(r.left + r.width / 2, r.top + r.height / 2, 110);
    dont.textContent = dontTexts[Math.min(dontCount, dontTexts.length - 1)];
    dontCount++;
  });

  // easter egg: 5 clicks al logo
  let brandClicks = 0;
  $("#brand").addEventListener("click", (e) => {
    brandClicks++;
    if (brandClicks % 5 === 0) burst(e.clientX, e.clientY, 140);
  });

  /* ---------- 12. Reloj (hora de Guatemala) + año ---------- */
  const clock = $("#clock");
  $("#year").textContent = new Date().getFullYear();
  function tick() {
    clock.textContent = new Date().toLocaleTimeString("es-GT", {
      timeZone: "America/Guatemala",
      hour12: false,
    });
  }
  tick();
  setInterval(tick, 1000);
})();
