(function () {
  "use strict";

  function initFilter() {
    var filter = document.querySelector(".gal-filter");
    var grid = document.querySelector(".gal");
    if (!filter || !grid) return;

    var buttons = filter.querySelectorAll(".gf-b");
    var cards = grid.querySelectorAll(".gal-c");
    if (!buttons.length || !cards.length) return;

    var labels = {};
    var tags = grid.querySelectorAll(".gal-tag");
    for (var t = 0; t < tags.length; t++) {
      var v = (tags[t].textContent || "").trim();
      if (v && !labels[v]) labels[v] = v;
    }

    // tag each card with the slug of its own category so the buttons can match
    for (var c = 0; c < cards.length; c++) {
      var tag = cards[c].querySelector(".gal-tag");
      var key = tag ? (tag.textContent || "").trim() : "";
      if (!key) continue;
      cards[c].setAttribute("data-cat", key);
    }

    function slug(s) {
      return (s || "")
        .toLowerCase()
        .replace(/[\s‌]+/g, "-")
        .replace(/[^\p{L}\p{N}-]/gu, "");
    }

    var slugMap = {};
    for (var name in labels) {
      if (Object.prototype.hasOwnProperty.call(labels, name)) slugMap[slug(name)] = name;
    }

    var empty = document.createElement("p");
    empty.className = "gal-empty";
    empty.setAttribute("data-gal-empty", "");
    empty.textContent = filter.getAttribute("data-empty") || "";
    empty.style.display = "none";
    grid.parentNode.insertBefore(empty, grid.nextSibling);

    function apply(cat) {
      var shown = 0;
      for (var i = 0; i < cards.length; i++) {
        var cardCat = cards[i].getAttribute("data-cat");
        var match = !cat || cardCat === cat;
        cards[i].style.display = match ? "" : "none";
        if (match) shown++;
      }
      empty.style.display = shown ? "none" : "";
      return shown;
    }

    function select(btn) {
      for (var i = 0; i < buttons.length; i++) {
        var on = buttons[i] === btn;
        buttons[i].classList.toggle("is-on", on);
        buttons[i].setAttribute("aria-selected", on ? "true" : "false");
      }
      var raw = (btn.textContent || "").trim();
      var cat = slugMap[slug(raw)];
      apply(cat || "");
    }

    for (var b = 0; b < buttons.length; b++) {
      (function (btn) {
        btn.addEventListener("click", function () { select(btn); });
      })(buttons[b]);
    }

    // honour a filter preselected in the markup
    var initial = filter.querySelector(".gf-b.is-on");
    if (initial) select(initial);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initFilter);
  } else {
    initFilter();
  }
})();