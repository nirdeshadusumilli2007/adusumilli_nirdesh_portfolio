/* Page behaviour: scroll reveal, the name marquee, the small "View" dot on
   the work rows and the buttons that lean toward the cursor. Everything here
   is an extra; the pages read fine without it. */
(function () {
  "use strict";

  const mq = function (q) { return !!window.matchMedia && window.matchMedia(q).matches; };
  const reduce = mq("(prefers-reduced-motion: reduce)");
  const fine = mq("(hover: hover) and (pointer: fine)");

  /* ---- reveal: only things that start below the fold are hidden first ---- */
  if (!reduce && "IntersectionObserver" in window) {
    const below = Array.prototype.filter.call(document.querySelectorAll("[data-r]"), function (el) {
      return el.getBoundingClientRect().top > window.innerHeight * 0.92;
    });
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -6% 0px" });
    below.forEach(function (el) { el.classList.add("pre"); io.observe(el); });
    window.addEventListener("beforeprint", function () {
      below.forEach(function (el) { el.classList.add("in"); });
    });
  }

  /* ---- marquee: drifts on its own, follows the scroll direction ---- */
  const marq = document.querySelector(".marq");
  if (marq && !reduce) {
    const unit = marq.firstElementChild;
    let w = 0, x = 0, dir = 1, push = 0, last = 0, raf = 0, seen = true;
    let lastY = window.scrollY;

    const measure = function () { w = unit.getBoundingClientRect().width; };
    measure();
    window.addEventListener("resize", measure);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    marq.style.animation = "none";

    window.addEventListener("scroll", function () {
      const y = window.scrollY;
      if (y === lastY) return;
      dir = y > lastY ? 1 : -1;
      push = Math.min(5, push + Math.abs(y - lastY) * 0.04);
      lastY = y;
    }, { passive: true });

    const frame = function (ts) {
      const dt = last ? Math.min(48, ts - last) : 16;
      last = ts;
      if (w) {
        x += dir * (0.07 + push * 0.05) * dt;
        push *= 0.93;
        x = ((x % w) + w) % w;
        marq.style.transform = "translate3d(" + (-x).toFixed(1) + "px,0,0)";
      }
      raf = requestAnimationFrame(frame);
    };
    const start = function () { if (!raf && seen && !document.hidden) { last = 0; raf = requestAnimationFrame(frame); } };
    const stop = function () { if (raf) { cancelAnimationFrame(raf); raf = 0; } };

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        seen = entries[0].isIntersecting;
        if (seen) start(); else stop();
      }).observe(marq.parentElement);
    }
    document.addEventListener("visibilitychange", function () { if (document.hidden) stop(); else start(); });
    start();
  }

  /* ---- small "View" dot that follows the cursor over the work rows (mouse only) ---- */
  const rows = document.querySelectorAll(".row");
  const dot = document.querySelector(".view-dot");
  if (rows.length && dot && fine && !reduce) {
    let tx = 0, ty = 0, x = 0, y = 0, on = false, raf = 0;

    const loop = function () {
      x += (tx - x) * 0.2; y += (ty - y) * 0.2;
      dot.style.transform = "translate3d(" + x.toFixed(1) + "px," + y.toFixed(1) + "px,0)";
      const settled = Math.abs(tx - x) < 0.3 && Math.abs(ty - y) < 0.3;
      raf = on || !settled ? requestAnimationFrame(loop) : 0;
    };

    const show = function (flag) {
      on = flag;
      dot.classList.toggle("on", flag);
      if (flag && !raf) raf = requestAnimationFrame(loop);
    };

    rows.forEach(function (row) {
      row.addEventListener("pointerenter", function (e) {
        if (!on) { x = tx = e.clientX; y = ty = e.clientY; }
        show(true);
      });
      row.addEventListener("pointermove", function (e) { tx = e.clientX; ty = e.clientY; });
      row.addEventListener("pointerleave", function () { show(false); });
    });
    window.addEventListener("scroll", function () { if (on) show(false); }, { passive: true });
  }

  /* ---- buttons that lean toward the cursor ---- */
  if (fine && !reduce) {
    document.querySelectorAll("[data-mag]").forEach(function (el) {
      el.addEventListener("pointermove", function (e) {
        const r = el.getBoundingClientRect();
        const mx = (e.clientX - (r.left + r.width / 2)) * 0.3;
        const my = (e.clientY - (r.top + r.height / 2)) * 0.3;
        el.style.transform = "translate(" + mx.toFixed(1) + "px," + my.toFixed(1) + "px)";
      });
      el.addEventListener("pointerleave", function () { el.style.transform = ""; });
    });
  }
})();
