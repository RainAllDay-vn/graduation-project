(function () {
  "use strict";

  var root = document.getElementById("vp-documents");
  var segs = Array.prototype.slice.call(document.querySelectorAll(".seg[data-state]"));

  function setState(state) {
    root.setAttribute("data-state", state);
    segs.forEach(function (s) {
      s.classList.toggle("active", s.getAttribute("data-state") === state);
    });
  }

  segs.forEach(function (s) {
    s.addEventListener("click", function () {
      setState(s.getAttribute("data-state"));
    });
  });

  Array.prototype.slice.call(root.querySelectorAll("a, button")).forEach(function (el) {
    el.addEventListener("click", function (e) {
      e.preventDefault();
    });
  });

  setState("default");
})();
