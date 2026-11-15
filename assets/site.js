(function () {
  var root = document.documentElement;

  // theme
  var saved = null;
  try { saved = localStorage.getItem("wj-theme"); } catch (e) {}
  if (saved) root.setAttribute("data-theme", saved);
  var btn = document.querySelector(".theme");
  function current() {
    return root.getAttribute("data-theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }
  function label() { if (btn) btn.textContent = current() === "dark" ? "Light theme" : "Dark theme"; }
  if (btn) {
    label();
    btn.addEventListener("click", function () {
      var next = current() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("wj-theme", next); } catch (e) {}
      label();
    });
  }

  // before / after sliders
  document.querySelectorAll(".ba").forEach(function (ba) {
    var input = ba.querySelector("input");
    if (!input) return;
    function set() { ba.style.setProperty("--pos", input.value + "%"); }
    input.addEventListener("input", set);
    set();
  });

  // table of contents: highlight the section in view, close the mobile menu on tap
  var links = Array.prototype.slice.call(document.querySelectorAll(".toc a"));
  var byId = {};
  links.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
  var details = document.querySelector(".toc details");
  function fit() { if (details) details.open = window.innerWidth > 980; }
  fit();
  window.addEventListener("resize", fit);
  links.forEach(function (a) {
    a.addEventListener("click", function () {
      if (details && window.innerWidth <= 980) details.open = false;
    });
  });
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          links.forEach(function (a) { a.classList.remove("on"); });
          var a = byId[e.target.id];
          if (a) a.classList.add("on");
        }
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    document.querySelectorAll("main section[id]").forEach(function (s) { io.observe(s); });
  }

  // cutscene loops: play only while on screen; respect reduced motion
  var loops = Array.prototype.slice.call(document.querySelectorAll("video.loop"));
  var still = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (still || !("IntersectionObserver" in window)) {
    loops.forEach(function (v) { v.controls = true; });
  } else {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var v = e.target;
        if (e.isIntersecting) {
          var p = v.play();
          if (p && p.catch) p.catch(function () { v.controls = true; });
        } else {
          v.pause();
        }
      });
    }, { threshold: 0.35 });
    loops.forEach(function (v) { vio.observe(v); });
  }
})();
