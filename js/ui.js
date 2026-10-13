(function () {
  "use strict";

  /* ---------- scroll progress bar ---------- */
  function initProgress() {
    var bar = document.querySelector(".sprog");
    if (!bar) return;
    var fill = bar.querySelector("span");
    if (!fill) return;

    fill.style.transition = "transform .08s linear";

    function update() {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var p = max > 0 ? h.scrollTop / max : 0;
      fill.style.transform = "scaleX(" + Math.min(1, Math.max(0, p)) + ")";
    }

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
  }

  /* ---------- back to top ---------- */
  function initToTop() {
    var btn = document.querySelector(".to-top");
    if (!btn) return;

    function sync() {
      var y = window.pageYOffset || document.documentElement.scrollTop;
      if (y > 600) btn.classList.add("show");
      else btn.classList.remove("show");
    }

    btn.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    sync();
    window.addEventListener("scroll", sync, { passive: true });
  }

  function init() {
    initProgress();
    initToTop();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();