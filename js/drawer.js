(function () {
  var burger = document.querySelector(".burger");
  var nav = document.querySelector(".nav");
  var header = document.querySelector(".hdr");
  if (!burger || !nav || !header) return;

  // build the drawer from the existing desktop nav so links never drift apart
  var drawer = document.createElement("div");
  drawer.className = "drawer";
  drawer.setAttribute("data-drawer", "");
  drawer.setAttribute("aria-hidden", "true");

  var navWrap = document.createElement("nav");
  navWrap.className = "drawer-nav";
  navWrap.setAttribute("aria-label", "منوی اصلی");
  var links = nav.querySelectorAll("a");
  for (var i = 0; i < links.length; i++) {
    var c = links[i].cloneNode(true);
    c.className = "drawer-nav-a";
    navWrap.appendChild(c);
  }
  drawer.appendChild(navWrap);

  // copy the header call-to-action
  var cta = header.querySelector(".hdr-cta");
  if (cta) {
    var ctaWrap = document.createElement("div");
    ctaWrap.className = "drawer-cta";
    ctaWrap.appendChild(cta.cloneNode(true));
    drawer.appendChild(ctaWrap);
  }

  // copy the language switcher
  var lang = header.querySelector(".lang-switcher");
  if (lang) {
    var langWrap = document.createElement("div");
    langWrap.className = "drawer-lang";
    var langLinks = lang.querySelectorAll("a");
    for (var j = 0; j < langLinks.length; j++) {
      var lc = langLinks[j].cloneNode(true);
      if (langLinks[j].getAttribute("aria-current") === "true" || langLinks[j].classList.contains("active")) {
        lc.setAttribute("aria-current", "true");
      } else {
        lc.removeAttribute("aria-current");
      }
      langWrap.appendChild(lc);
    }
    drawer.appendChild(langWrap);
  }

  header.appendChild(drawer);

  var open = false;
  function setOpen(next) {
    open = next;
    drawer.setAttribute("aria-hidden", open ? "false" : "true");
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    document.documentElement.style.overflow = open ? "hidden" : "";
  }

  burger.addEventListener("click", function () { setOpen(!open); });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && open) { setOpen(false); burger.focus(); }
  });

  // tapping a link should close it
  drawer.addEventListener("click", function (e) {
    if (e.target.closest("a")) setOpen(false);
  });

  // leaving mobile hides the drawer state
  window.addEventListener("resize", function () {
    if (window.innerWidth > 1024 && open) setOpen(false);
  });
})();