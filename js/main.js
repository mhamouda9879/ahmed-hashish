(function () {
  window.applyI18n();

  var RTL = document.documentElement.dir === "rtl";
  var AR = window.AH_LANG === "ar";
  var DIR = RTL ? -1 : 1;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  gsap.registerPlugin(ScrollTrigger, SplitText);
  document.body.classList.add("is-loading");
  document.querySelector(".year").textContent = new Date().getFullYear();
  document.querySelector(".lang").addEventListener("click", window.toggleLang);

  var lenis = null;
  if (!reduced) {
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95 });
    lenis.stop();
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var id = a.getAttribute("href");
      var el = id === "#top" ? document.body : document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      if (lenis) lenis.start();
      if (lenis) lenis.scrollTo(id === "#top" ? 0 : el, { offset: -40, duration: 1.8, easing: function (t) { return 1 - Math.pow(1 - t, 4); } });
      else el.scrollIntoView({ behavior: "smooth" });
    });
  });

  function initCursor() {
    if (!fine) return;
    var cur = document.querySelector(".cursor");
    var dot = cur.querySelector(".cursor__dot");
    var ring = cur.querySelector(".cursor__ring");
    var txt = cur.querySelector(".cursor__text");
    var dx = gsap.quickTo(dot, "x", { duration: 0.08 }), dy = gsap.quickTo(dot, "y", { duration: 0.08 });
    var rx = gsap.quickTo(ring, "x", { duration: 0.45, ease: "power3" }), ry = gsap.quickTo(ring, "y", { duration: 0.45, ease: "power3" });
    window.addEventListener("pointermove", function (e) { cur.classList.add("is-on"); dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); });
    document.querySelectorAll("a, button, [data-magnetic]").forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        var t = el.getAttribute("data-cursor");
        if (t) { txt.textContent = AR ? "ناقش" : t; cur.classList.add("is-text"); } else cur.classList.add("is-hover");
      });
      el.addEventListener("mouseleave", function () { cur.classList.remove("is-hover", "is-text"); });
    });
  }

  function initMagnetic() {
    if (!fine) return;
    document.querySelectorAll("[data-magnetic]").forEach(function (el) {
      var xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
      var yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
      el.addEventListener("mousemove", function (e) {
        var r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * 0.35);
        yTo((e.clientY - r.top - r.height / 2) * 0.35);
      });
      el.addEventListener("mouseleave", function () { xTo(0); yTo(0); });
    });
  }

  function initMenu() {
    var btn = document.querySelector(".burger"), menu = document.querySelector(".mmenu");
    var open = false;
    var at = RTL ? "42px 38px" : "calc(100% - 42px) 38px";
    var tl = gsap.timeline({ paused: true })
      .set(menu, { visibility: "visible" })
      .fromTo(menu, { clipPath: "circle(0% at " + at + ")" }, { clipPath: "circle(150% at " + at + ")", duration: 0.9, ease: "expo.inOut" })
      .from(".mmenu__links a", { opacity: 0, y: 40, duration: 0.8, stagger: 0.06, ease: "expo.out" }, 0.35)
      .from(".mmenu__foot", { opacity: 0, duration: 0.6 }, 0.6);
    function set(v) {
      open = v;
      document.documentElement.classList.toggle("menu-open", v);
      btn.setAttribute("aria-expanded", v);
      menu.setAttribute("aria-hidden", !v);
      if (v) { tl.timeScale(1).play(); if (lenis) lenis.stop(); }
      else { tl.timeScale(1.6).reverse(); if (lenis) lenis.start(); }
    }
    btn.addEventListener("click", function () { set(!open); });
    menu.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", function () { set(false); }); });
  }

  function initNav() {
    var nav = document.querySelector(".nav");
    var bar = document.querySelector(".progress span");
    var last = 0;
    ScrollTrigger.create({
      start: 0, end: "max",
      onUpdate: function (self) {
        var y = self.scroll();
        nav.classList.toggle("is-scrolled", y > 40);
        nav.classList.toggle("is-hidden", y > 400 && y > last);
        last = y;
        bar.style.transform = "scaleX(" + self.progress + ")";
      }
    });
  }

  function initHeroCanvas() {
    var canvas = document.querySelector(".hero__canvas");
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W, H, parts = [], running = true, t = 0;
    var mouse = { x: -9999, y: -9999 };

    function resize() {
      W = canvas.clientWidth; H = canvas.clientHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#07090d"; ctx.fillRect(0, 0, W, H);
      var n = Math.min(1100, Math.floor((W * H) / 1500));
      parts = [];
      for (var i = 0; i < n; i++) parts.push(spawn(true));
    }
    function spawn(any) {
      return {
        x: any ? Math.random() * W : (RTL ? W + 10 : -10) + (Math.random() - 0.5) * 40,
        y: any ? Math.random() * H : Math.random() * H,
        life: 0, max: 120 + Math.random() * 260,
        s: 0.6 + Math.random() * 1.4,
        g: Math.random()
      };
    }
    function angle(x, y) {
      var a = Math.sin(x * 0.0019 + t * 0.00035) * 1.25 + Math.cos(y * 0.0026 - t * 0.00025) * 1.1 + Math.sin((x + y) * 0.0008) * 0.6 - 0.45;
      return a;
    }
    function frame() {
      if (!running) return;
      t += 16;
      ctx.fillStyle = "rgba(7, 9, 13, 0.075)";
      ctx.fillRect(0, 0, W, H);
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i];
        var a = angle(p.x, p.y);
        var vx = Math.cos(a) * p.s * DIR, vy = Math.sin(a) * p.s * 0.75 - 0.15;
        var mx = p.x - mouse.x, my = p.y - mouse.y, d2 = mx * mx + my * my;
        if (d2 < 32000) {
          var f = (1 - d2 / 32000) * 3.2, d = Math.sqrt(d2) || 1;
          vx += (-my / d) * f + (mx / d) * f * 0.5;
          vy += (mx / d) * f + (my / d) * f * 0.5;
        }
        var ox = p.x, oy = p.y;
        p.x += vx; p.y += vy; p.life++;
        var fade = Math.sin((p.life / p.max) * Math.PI);
        var near = d2 < 32000 ? 0.35 : 0;
        ctx.strokeStyle = p.g > 0.85
          ? "rgba(241, 215, 154," + (0.65 * fade + near) + ")"
          : "rgba(201, 164, 92," + (0.32 * fade + near) + ")";
        ctx.lineWidth = p.g > 0.85 ? 1.1 : 0.7;
        ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(p.x, p.y); ctx.stroke();
        if (p.life > p.max || p.x < -20 || p.x > W + 20 || p.y < -20 || p.y > H + 20) parts[i] = spawn(Math.random() < 0.7);
      }
      requestAnimationFrame(frame);
    }
    resize();
    var rT;
    window.addEventListener("resize", function () { clearTimeout(rT); rT = setTimeout(resize, 150); });
    canvas.parentElement.addEventListener("pointermove", function (e) {
      var r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    canvas.parentElement.addEventListener("pointerleave", function () { mouse.x = mouse.y = -9999; });
    ScrollTrigger.create({
      trigger: ".hero", start: "top top", end: "bottom top",
      onToggle: function (self) { running = self.isActive; if (running) requestAnimationFrame(frame); }
    });
    if (!reduced) requestAnimationFrame(frame);
  }

  function counters(scope) {
    (scope || document).querySelectorAll(".counter").forEach(function (el) {
      var o = { v: 0 };
      gsap.to(o, { v: +el.dataset.to, duration: 2.2, ease: "power3.out", onUpdate: function () { el.textContent = Math.round(o.v); } });
    });
  }

  function heroIntro() {
    var tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    var words = document.querySelectorAll(".hero__word");
    var splits = [];
    words.forEach(function (w) {
      splits.push(SplitText.create(w, { type: AR ? "words" : "chars", charsClass: "char", wordsClass: "word" }));
    });
    var units = [];
    splits.forEach(function (s) { units = units.concat(AR ? s.words : s.chars); });

    gsap.set(".hero__content, .hero__meta, .hero__scroll", { autoAlpha: 1 });
    var path = document.querySelector(".hero__curve-path");
    var len = path.getTotalLength();
    gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
    gsap.set(".hero__curve-dot", { scale: 0, transformOrigin: "50% 50%" });

    tl.from(".hero__canvas", { opacity: 0, duration: 2.4, ease: "power2.out" }, 0)
      .from(".hero__grid", { opacity: 0, scale: 1.15, duration: 2.4 }, 0)
      .from(units, { yPercent: 120, rotate: 8 * DIR, opacity: 0, duration: 1.6, stagger: 0.045 }, 0.1)
      .to(path, { strokeDashoffset: 0, duration: 2.6, ease: "power2.inOut" }, 0.2)
      .to(".hero__curve-dot", { scale: 1, duration: 0.8, ease: "back.out(3)" }, 2.5)
      .from(".hero__eyebrow", { opacity: 0, x: -30 * DIR, duration: 1.2 }, 0.6)
      .from(".hero__eyebrow .line", { scaleX: 0, transformOrigin: RTL ? "right" : "left", duration: 1.2 }, 0.6)
      .from(".hero__tags > *", { opacity: 0, y: 24, duration: 1, stagger: 0.08 }, 0.9)
      .from(".hero__lede", { opacity: 0, y: 30, filter: "blur(8px)", duration: 1.4 }, 1.05)
      .from(".hero__cta > *", { opacity: 0, y: 30, duration: 1.2, stagger: 0.1 }, 1.2)
      .fromTo(".portrait__arch", { clipPath: "inset(100% 0 0 0 round 999px 999px 0 0)" }, { clipPath: "inset(0% 0 0 0 round 999px 999px 0 0)", duration: 1.8, ease: "expo.inOut" }, 0.15)
      .from(".portrait__img", { yPercent: 18, opacity: 0, scale: 1.08, filter: "blur(14px) saturate(0)", duration: 2, ease: "expo.out" }, 0.75)
      .to(".portrait__shine", { left: "130%", duration: 1.8, ease: "power2.inOut" }, 1.4)
      .from(".portrait__orbit", { scale: 0.6, opacity: 0, rotate: -90, duration: 2, ease: "expo.out" }, 0.9)
      .from(".chip", { opacity: 0, y: 50, scale: 0.85, duration: 1.3, stagger: 0.15, ease: "back.out(1.4)", onStart: function () { counters(document.querySelector(".hero__meta")); } }, 1.5)
      .from(".hero__scroll", { opacity: 0, duration: 1 }, 1.6)
      .from(".nav > *", { opacity: 0, y: -20, duration: 1, stagger: 0.08 }, 1.1);

    gsap.to(".portrait__orbit", { rotate: 360, duration: 40, repeat: -1, ease: "none" });
    gsap.utils.toArray(".chip").forEach(function (c, i) {
      gsap.to(c, { y: i % 2 ? 12 : -12, duration: 3 + i * 0.6, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 3 + i * 0.3 });
    });
    gsap.to(".portrait__shine", { left: "-60%", duration: 0.01, delay: 4, onComplete: function () {
      gsap.to(".portrait__shine", { left: "130%", duration: 2.2, ease: "power2.inOut", repeat: -1, repeatDelay: 5 });
    } });
    if (fine) {
      var px = gsap.quickTo(".portrait__img", "x", { duration: 1.2, ease: "power3" });
      var ax = gsap.quickTo(".portrait__arch", "x", { duration: 1.2, ease: "power3" });
      var mx = gsap.quickTo(".hero__meta", "x", { duration: 1.2, ease: "power3" });
      var my = gsap.quickTo(".hero__meta", "y", { duration: 1.2, ease: "power3" });
      document.querySelector(".hero").addEventListener("pointermove", function (e) {
        var nx = e.clientX / window.innerWidth - 0.5, ny = e.clientY / window.innerHeight - 0.5;
        px(nx * 18); ax(nx * -10); mx(nx * 34); my(ny * 24);
      });
    }
    gsap.to(".hero__curve-dot", { scale: 1.8, opacity: 0.4, duration: 1.4, repeat: -1, yoyo: true, ease: "sine.inOut", delay: 3.4 });

    gsap.timeline({ scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true } })
      .to(".hero__content", { yPercent: -18, opacity: 0.1, ease: "none" }, 0)
      .to(".hero__row:first-child", { xPercent: -8 * DIR, ease: "none" }, 0)
      .to(".hero__row--indent", { xPercent: 8 * DIR, ease: "none" }, 0)
      .to(".hero__canvas, .hero__curve", { scale: 1.15, opacity: 0.3, ease: "none" }, 0)
      .to(".hero__portrait", { yPercent: 14, ease: "none" }, 0)
      .to(".portrait__img", { scale: 1.06, ease: "none" }, 0)
      .to(".hero__meta", { yPercent: -20, opacity: 0, ease: "none" }, 0)
      .to(".hero__scroll", { opacity: 0, y: -40, ease: "none" }, 0);
  }

  function loader(done) {
    var num = document.querySelector(".loader__num");
    var o = { v: 0 };
    var tl = gsap.timeline({
      onComplete: function () {
        document.querySelector(".loader").style.display = "none";
        document.body.classList.remove("is-loading");
        if (lenis) lenis.start();
      }
    });
    tl.from(".loader__inner > *", { opacity: 0, y: 30, duration: 0.8, stagger: 0.1, ease: "power3.out" })
      .to(o, { v: 25, duration: 1.8, ease: "power2.inOut", onUpdate: function () { num.textContent = Math.round(o.v); } }, 0.2)
      .to(".loader__bar span", { scaleX: 1, duration: 1.8, ease: "power2.inOut" }, 0.2)
      .to(".loader__inner", { opacity: 0, y: -40, filter: "blur(10px)", duration: 0.7, ease: "power3.in" }, "+=0.25")
      .to(".loader__panel--a", { yPercent: -100, duration: 1.2, ease: "expo.inOut" }, "-=0.15")
      .to(".loader__panel--b", { yPercent: 100, duration: 1.2, ease: "expo.inOut" }, "<")
      .add(done, "-=0.75");
  }

  function initMarquee() {
    var track = document.querySelector(".marquee__track");
    var item = track.querySelector(".marquee__item");
    var w = item.offsetWidth;
    var x = 0, speed = 1, dir = 1;
    gsap.ticker.add(function () {
      x -= (0.6 + Math.abs(speed)) * dir * DIR;
      if (x <= -w) x += w;
      if (x > 0) x -= w;
      gsap.set(track, { x: RTL ? -x - w : x });
      speed *= 0.92;
    });
    ScrollTrigger.create({
      trigger: ".marquee", start: "top bottom", end: "bottom top",
      onUpdate: function (self) { speed = Math.min(Math.abs(self.getVelocity()) / 220, 12); dir = self.direction; }
    });
    window.addEventListener("resize", function () { w = item.offsetWidth; });
  }

  function initStatement() {
    var s = SplitText.create(".statement__text", { type: "words", wordsClass: "word" });
    gsap.to(s.words, {
      color: "#ece7dc", stagger: 0.12, ease: "none",
      scrollTrigger: { trigger: ".statement__text", start: "top 78%", end: "bottom 42%", scrub: 0.6 }
    });
    gsap.utils.toArray(".seat").forEach(function (seat, i) {
      gsap.from(seat, {
        opacity: 0, y: 40, duration: 1.1, delay: i * 0.12, ease: "expo.out",
        scrollTrigger: { trigger: ".statement__seats", start: "top 85%", onEnter: function () { setTimeout(function () { seat.classList.add("is-in"); }, i * 120); } }
      });
    });
  }

  function initConverge(mm) {
    mm.add("(min-width: 1025px)", function () {
      var tl = gsap.timeline({
        scrollTrigger: { trigger: ".converge", start: "top top", end: "+=160%", scrub: 1, pin: ".converge__pin", anticipatePin: 1 }
      });
      tl.from(".converge__side--debt", { xPercent: -90 * DIR, opacity: 0, ease: "power2.out" }, 0)
        .from(".converge__side--equity", { xPercent: 90 * DIR, opacity: 0, ease: "power2.out" }, 0)
        .from(".converge__side li", { opacity: 0, y: 20, stagger: 0.04 }, 0.25)
        .from(".converge__plus", { scale: 0, rotate: -270, opacity: 0, ease: "back.out(1.6)" }, 0.2)
        .from(".converge__rings i", { scale: 0.2, opacity: 0, stagger: 0.08, ease: "power3.out" }, 0.15)
        .from(".converge__title, .converge__sub", { opacity: 0, y: 40, stagger: 0.1 }, 0.5)
        .to(".converge__rings i:nth-child(2)", { rotate: 180, ease: "none" }, 0)
        .to({}, { duration: 0.3 });
    });
    mm.add("(max-width: 1024px)", function () {
      gsap.from(".converge__plus", { scale: 0, rotate: -180, duration: 1.4, ease: "back.out(1.6)", scrollTrigger: { trigger: ".converge", start: "top 70%" } });
      gsap.from(".converge__side", { opacity: 0, y: 60, duration: 1.2, stagger: 0.15, ease: "expo.out", scrollTrigger: { trigger: ".converge__side", start: "top 85%" } });
      gsap.from(".converge__title, .converge__sub", { opacity: 0, y: 30, duration: 1, stagger: 0.1, scrollTrigger: { trigger: ".converge__core", start: "top 80%" } });
    });
  }

  function initPillars() {
    var track = document.querySelector(".pillars__track");
    function dist() { return Math.max(0, track.scrollWidth - window.innerWidth); }
    var tween = gsap.to(track, {
      x: function () { return -dist() * DIR; }, ease: "none",
      scrollTrigger: { trigger: ".pillars", start: "top top", end: function () { return "+=" + dist(); }, scrub: 1, pin: ".pillars__pin", invalidateOnRefresh: true, anticipatePin: 1 }
    });
    if (RTL) {
      gsap.from(".pillar", { opacity: 0, y: 80, duration: 1.4, stagger: 0.12, ease: "expo.out", scrollTrigger: { trigger: ".pillars", start: "top 60%" } });
      return;
    }
    gsap.utils.toArray(".pillar").forEach(function (p) {
      gsap.from(p.querySelectorAll(".pillar__icon, h3, p"), {
        opacity: 0, y: 50, stagger: 0.08, ease: "power3.out",
        scrollTrigger: { trigger: p, containerAnimation: tween, start: "left 95%", end: "left 55%", scrub: true, horizontal: true }
      });
      gsap.fromTo(p.querySelector(".pillar__num"), { xPercent: 40 * DIR }, {
        xPercent: -40 * DIR, ease: "none",
        scrollTrigger: { trigger: p, containerAnimation: tween, start: "left right", end: "right left", scrub: true, horizontal: true }
      });
      var icon = p.querySelector(".pillar__icon");
      icon.querySelectorAll("path, circle, rect").forEach(function (sh) {
        var l = sh.getTotalLength ? sh.getTotalLength() : 200;
        gsap.fromTo(sh, { strokeDasharray: l, strokeDashoffset: l }, {
          strokeDashoffset: 0, ease: "none",
          scrollTrigger: { trigger: p, containerAnimation: tween, start: "left 100%", end: "left 50%", scrub: true, horizontal: true }
        });
      });
      p.addEventListener("pointermove", function (e) {
        var r = p.getBoundingClientRect();
        p.style.setProperty("--mx", e.clientX - r.left + "px");
        p.style.setProperty("--my", e.clientY - r.top + "px");
      });
    });
  }

  function initReady() {
    var fg = document.querySelector(".ring__fg");
    var L = 2 * Math.PI * 88;
    gsap.set(fg, { strokeDasharray: L, strokeDashoffset: L });
    var num = document.querySelector(".ring__num");
    var items = gsap.utils.toArray(".checks li");
    items.forEach(function (li) {
      li.querySelectorAll("circle, path").forEach(function (sh) {
        var l = sh.getTotalLength();
        gsap.set(sh, { strokeDasharray: l, strokeDashoffset: l });
      });
    });
    var o = { v: 0 };
    var tl = gsap.timeline({ scrollTrigger: { trigger: ".ready", start: "top 65%", end: "bottom 75%", scrub: 0.8 } });
    tl.to(o, { v: 100, ease: "none", duration: 4, onUpdate: function () {
      num.textContent = Math.round(o.v);
      items.forEach(function (li, i) { li.classList.toggle("is-on", o.v >= (i + 1) * 25 - 12); });
    } }, 0)
      .to(fg, { strokeDashoffset: 0, ease: "none", duration: 4 }, 0);
    items.forEach(function (li, i) {
      tl.to(li.querySelectorAll("circle, path"), { strokeDashoffset: 0, ease: "power2.out", duration: 0.8, stagger: 0.2 }, i * 0.95 + 0.1);
    });
    gsap.from(".checks li", { opacity: 0, x: 50 * DIR, duration: 1.1, stagger: 0.1, ease: "expo.out", scrollTrigger: { trigger: ".checks", start: "top 85%" } });
    gsap.from(".ring", { scale: 0.7, opacity: 0, rotate: -40, duration: 1.6, ease: "expo.out", scrollTrigger: { trigger: ".ring", start: "top 85%" } });
    gsap.from(".ready__lede, .ready__src", { opacity: 0, y: 30, duration: 1.2, stagger: 0.12, ease: "expo.out", scrollTrigger: { trigger: ".ready__lede", start: "top 88%" } });
  }

  function initRecord() {
    gsap.utils.toArray(".rec").forEach(function (r, i) {
      gsap.from(r.children, { opacity: 0, y: 40, duration: 1.2, stagger: 0.08, delay: (i % 2) * 0.12, ease: "expo.out", scrollTrigger: { trigger: r, start: "top 85%" } });
    });
    gsap.from(".voice__sub", { opacity: 0, y: 20, duration: 1, scrollTrigger: { trigger: ".voice__sub", start: "top 90%" } });
  }

  function initJourney() {
    gsap.to(".journey__line span", {
      scaleY: 1, ease: "none",
      scrollTrigger: { trigger: ".journey__list", start: "top 60%", end: "bottom 60%", scrub: 0.5 }
    });
    gsap.utils.toArray(".step").forEach(function (st) {
      gsap.from(st.querySelectorAll(".step__when, h3, p, .step__tag"), {
        opacity: 0, x: 60 * DIR, duration: 1.3, stagger: 0.08, ease: "expo.out",
        scrollTrigger: { trigger: st, start: "top 80%" }
      });
      ScrollTrigger.create({ trigger: st, start: "top 62%", end: "bottom 62%", toggleClass: { targets: st, className: "is-active" }, onLeave: function () { st.classList.add("is-active"); } });
    });
  }

  function initQuote() {
    var s = SplitText.create(".quote__text", { type: "words,lines", mask: "lines", wordsClass: "word" });
    gsap.from(s.words, {
      yPercent: 110, opacity: 0, duration: 1.4, stagger: 0.05, ease: "expo.out",
      scrollTrigger: { trigger: ".quote", start: "top 65%" }
    });
    gsap.fromTo(".quote__mark", { y: 120, rotate: -20 }, { y: -60, rotate: 0, ease: "none", scrollTrigger: { trigger: ".quote", start: "top bottom", end: "bottom top", scrub: true } });
    gsap.from(".quote__by", { opacity: 0, letterSpacing: AR ? "0" : "0.8em", duration: 1.6, ease: "expo.out", scrollTrigger: { trigger: ".quote__by", start: "top 90%" } });
  }

  function initEngage() {
    gsap.from(".row", {
      opacity: 0, y: 60, duration: 1.2, stagger: 0.1, ease: "expo.out",
      scrollTrigger: { trigger: ".engage__list", start: "top 80%" }
    });
    if (!fine) return;
    var fl = document.querySelector(".engage__float");
    var xTo = gsap.quickTo(fl, "x", { duration: 0.7, ease: "power3" }), yTo = gsap.quickTo(fl, "y", { duration: 0.7, ease: "power3" });
    var list = document.querySelector(".engage__list");
    list.addEventListener("pointermove", function (e) { xTo(e.clientX); yTo(e.clientY); });
    list.addEventListener("pointerenter", function () { gsap.to(fl, { opacity: 1, scale: 1, duration: 0.5 }); });
    list.addEventListener("pointerleave", function () { gsap.to(fl, { opacity: 0, scale: 0.6, duration: 0.5 }); });
  }

  function initCards() {
    gsap.from(".card", {
      opacity: 0, y: 100, rotateX: -25, transformOrigin: "50% 100%", duration: 1.5, stagger: 0.14, ease: "expo.out",
      scrollTrigger: { trigger: ".voice__cards", start: "top 82%" }
    });
    gsap.from(".voice__formats span", {
      opacity: 0, scale: 0.6, duration: 0.9, stagger: 0.06, ease: "back.out(2)",
      scrollTrigger: { trigger: ".voice__formats", start: "top 90%" }
    });
    if (!fine) return;
    document.querySelectorAll("[data-tilt]").forEach(function (c) {
      var rX = gsap.quickTo(c, "rotationX", { duration: 0.6, ease: "power3" });
      var rY = gsap.quickTo(c, "rotationY", { duration: 0.6, ease: "power3" });
      c.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
        rY(px * 14); rX(-py * 14);
        c.style.setProperty("--mx", e.clientX - r.left + "px");
        c.style.setProperty("--my", e.clientY - r.top + "px");
      });
      c.addEventListener("pointerleave", function () { rX(0); rY(0); });
    });
  }

  function initContact() {
    gsap.from(".contact__row > *", {
      yPercent: 115, rotate: 4 * DIR, duration: 1.6, stagger: 0.12, ease: "expo.out",
      scrollTrigger: { trigger: ".contact__title", start: "top 80%" }
    });
    gsap.from(".contact__lede, .contact__actions > *", {
      opacity: 0, y: 40, duration: 1.2, stagger: 0.1, ease: "expo.out",
      scrollTrigger: { trigger: ".contact__lede", start: "top 90%" }
    });
    gsap.fromTo(".contact__glow", { scale: 0.4, opacity: 0 }, { scale: 1.1, opacity: 1, ease: "none", scrollTrigger: { trigger: ".contact", start: "top bottom", end: "center center", scrub: true } });
    var s = SplitText.create(".footer__big", { type: "chars" });
    gsap.from(s.chars, {
      yPercent: 100, opacity: 0, stagger: { each: 0.03, from: "center" }, ease: "power3.out",
      scrollTrigger: { trigger: ".footer", start: "top bottom", end: "bottom bottom", scrub: 1 }
    });
  }

  function initReveals() {
    gsap.utils.toArray(".h2").forEach(function (h) {
      var s = SplitText.create(h, { type: "lines", mask: "lines", linesClass: "split-line-inner" });
      gsap.from(s.lines, { yPercent: 110, duration: 1.4, stagger: 0.1, ease: "expo.out", scrollTrigger: { trigger: h, start: "top 85%" } });
    });
    gsap.utils.toArray("section:not(.hero) .eyebrow").forEach(function (e) {
      gsap.from(e.querySelector(".line"), { scaleX: 0, transformOrigin: RTL ? "right" : "left", duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: e, start: "top 90%" } });
      gsap.from(e.lastElementChild, { opacity: 0, x: -20 * DIR, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: e, start: "top 90%" } });
    });
    gsap.from(".voice__lede", { opacity: 0, y: 30, duration: 1.2, ease: "expo.out", scrollTrigger: { trigger: ".voice__lede", start: "top 90%" } });
  }

  function start() {
    var mm = gsap.matchMedia();
    initCursor();
    initMagnetic();
    initNav();
    initMenu();
    initHeroCanvas();
    initMarquee();
    initStatement();
    initConverge(mm);
    initPillars();
    initReady();
    initJourney();
    initRecord();
    initQuote();
    initEngage();
    initCards();
    initContact();
    initReveals();
    ScrollTrigger.refresh();
    if (reduced) {
      document.querySelector(".loader").style.display = "none";
      document.body.classList.remove("is-loading");
      heroIntro();
    } else {
      loader(heroIntro);
    }
  }

  var fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  Promise.race([fontsReady, new Promise(function (r) { setTimeout(r, 2500); })]).then(start);
})();
