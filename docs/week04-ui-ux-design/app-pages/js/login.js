(function () {
  "use strict";

  var root = document.getElementById("vp-login");
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

  var form = document.getElementById("vp-form");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
  });

  var signupLink = document.getElementById("link-signup");
  if (signupLink) signupLink.addEventListener("click", function (e) {
    e.preventDefault();
  });

  setState("default");
})();
