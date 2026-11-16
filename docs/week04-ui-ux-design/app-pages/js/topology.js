(function () {
  "use strict";

  var root = document.getElementById("vp-topo");
  var segs = Array.prototype.slice.call(document.querySelectorAll(".seg[data-state]"));
  var tabs = Array.prototype.slice.call(document.querySelectorAll(".topo-tabs .tl-tab[data-tab]"));

  function setState(state) {
    if (!root) return;
    root.setAttribute("data-state", state);
    segs.forEach(function (s) {
      s.classList.toggle("active", s.getAttribute("data-state") === state);
    });

    // Sync left tabs highlight
    tabs.forEach(function (t) {
      var tabName = t.getAttribute("data-tab");
      if (state === "settings") {
        t.classList.toggle("on", tabName === "settings");
      } else {
        t.classList.toggle("on", tabName === "inventory");
      }
    });
  }

  segs.forEach(function (s) {
    s.addEventListener("click", function () {
      setState(s.getAttribute("data-state"));
    });
  });

  tabs.forEach(function (t) {
    t.addEventListener("click", function () {
      var tabName = t.getAttribute("data-tab");
      if (tabName === "settings") {
        setState("settings");
      } else {
        setState("default");
      }
    });
  });

  if (root) {
    Array.prototype.slice.call(root.querySelectorAll("a, button")).forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
      });
    });
  }

  setState("default");
})();
