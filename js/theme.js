/* Araye Modern - day / night toggle
   The visitor's choice is remembered, and a first-time visitor follows the
   operating system preference. */
(function () {
  "use strict";

  var root = document.documentElement;
  var KEY = "am-theme";

  function stored() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }

  function remember(v) {
    try { localStorage.setItem(KEY, v); } catch (e) { /* private mode */ }
  }

  function systemDark() {
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  function render(dark) {
    root.setAttribute("data-theme", dark ? "dark" : "light");

    var buttons = document.querySelectorAll("[data-theme-toggle]");
    for (var i = 0; i < buttons.length; i++) {
      var btn = buttons[i];
      var label = dark
        ? btn.getAttribute("data-label-day")
        : btn.getAttribute("data-label-night");

      btn.setAttribute("aria-pressed", dark ? "true" : "false");
      if (label) btn.setAttribute("aria-label", label);

      var text = btn.querySelector("[data-theme-text]");
      if (text && label) text.textContent = label;
    }
  }

  function toggle() {
    var next = root.getAttribute("data-theme") !== "dark";
    render(next);
    remember(next ? "dark" : "light");
  }

  function init() {
    var saved = stored();
    render(saved ? saved === "dark" : systemDark());

    var buttons = document.querySelectorAll("[data-theme-toggle]");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener("click", toggle);
    }

    // follow the system only while the visitor has not chosen yet
    if (window.matchMedia) {
      var mq = window.matchMedia("(prefers-color-scheme: dark)");
      var onChange = function (e) {
        if (!stored()) render(e.matches);
      };
      if (mq.addEventListener) mq.addEventListener("change", onChange);
      else if (mq.addListener) mq.addListener(onChange);
    }
  }

  // apply the stored theme before first paint to avoid a flash of day mode
  try {
    var pre = stored();
    if (pre) root.setAttribute("data-theme", pre);
  } catch (e) { /* ignore */ }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();