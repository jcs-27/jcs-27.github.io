// Progressive enhancement only: the page is complete without this file.
(function () {
  "use strict";
  var root = document.documentElement;

  // ---- Theme toggle -------------------------------------------------------
  var themeBtn = document.getElementById("theme-toggle");
  var prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

  function currentTheme() {
    return root.getAttribute("data-theme") || (prefersDark.matches ? "dark" : "light");
  }
  function syncThemeButton() {
    themeBtn.setAttribute("aria-pressed", String(currentTheme() === "dark"));
  }
  if (themeBtn) {
    syncThemeButton();
    themeBtn.addEventListener("click", function () {
      var next = currentTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("theme", next); } catch (e) {}
      syncThemeButton();
    });
    prefersDark.addEventListener("change", syncThemeButton);
  }

  // ---- Mobile menu --------------------------------------------------------
  var menuBtn = document.getElementById("menu-btn");
  var menu = document.getElementById("menu");
  var main = document.getElementById("main");
  var footer = document.querySelector(".foot");

  function setMenu(open, returnFocus) {
    menu.hidden = !open;
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.textContent = open ? "Close" : "Menu";
    [main, footer].forEach(function (el) { if (el) el.inert = open; });
    document.body.style.overflow = open ? "hidden" : "";
    if (open) {
      var first = menu.querySelector("a");
      if (first) first.focus();
    } else if (returnFocus) {
      menuBtn.focus();
    }
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener("click", function () { setMenu(menu.hidden, true); });
    menu.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false, false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !menu.hidden) setMenu(false, true);
    });
    // Close the menu if the viewport grows past the breakpoint.
    window.matchMedia("(min-width: 1121px)").addEventListener("change", function (mq) {
      if (mq.matches && !menu.hidden) setMenu(false, false);
    });
  }

  // ---- Current section in the nav -----------------------------------------
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-list a"));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var visible = new Map();
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { visible.set(entry.target.id, entry.isIntersecting); });
      var active = null;
      sections.forEach(function (s) { if (visible.get(s.id)) active = active || s.id; });
      navLinks.forEach(function (a) {
        if (a.getAttribute("href") === "#" + active) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { observer.observe(s); });
  }

  // ---- Copy email ---------------------------------------------------------
  var copyBtn = document.getElementById("copy-email");
  var copyStatus = document.getElementById("copy-status");
  if (copyBtn && navigator.clipboard && window.isSecureContext) {
    copyBtn.hidden = false;
    var timer;
    copyBtn.addEventListener("click", function () {
      navigator.clipboard.writeText(copyBtn.dataset.email).then(function () {
        copyStatus.textContent = "Copied to clipboard.";
      }, function () {
        copyStatus.textContent = "Couldn't copy. Select the address above instead.";
      });
      clearTimeout(timer);
      timer = setTimeout(function () { copyStatus.textContent = ""; }, 4000);
    });
  }
})();
