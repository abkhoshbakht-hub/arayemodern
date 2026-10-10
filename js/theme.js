/* Araye Modern - day / night toggle
   Every page load starts in day mode; the choice is not remembered. */
(function () {
  "use strict";

  var root = document.documentElement;

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
    render(root.getAttribute("data-theme") !== "dark");
  }

  function init() {
    render(false);

    var buttons = document.querySelectorAll("[data-theme-toggle]");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener("click", toggle);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();