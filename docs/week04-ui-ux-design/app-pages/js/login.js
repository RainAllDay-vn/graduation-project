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

  /* ---- chuyển ngôn ngữ VI/EN ---- */
  var T = {
    "h1": { vi: "Đăng nhập", en: "Sign in" },
    "lead-pre": { vi: "Chưa có tài khoản?", en: "Don't have an account?" },
    "lead-link": { vi: "Đăng ký", en: "Sign up" },
    "banner-err": { vi: "Tài khoản hoặc mật khẩu không đúng.", en: "Wrong username or password." },
    "banner-ok": { vi: "Đăng nhập thành công — đang mở Tổng quan mạng…", en: "Signed in — opening Network overview…" },
    "user-ph": { vi: "Tên đăng nhập nội bộ", en: "Internal username" },
    "pass-ph": { vi: "Mật khẩu", en: "Password" },
    "remember": { vi: "Ghi nhớ tôi", en: "Remember me" },
    "forgot": { vi: "Quên mật khẩu?", en: "Forgot password?" },
    "submit": { vi: "Đăng nhập", en: "Sign in" },
    "submit-busy": { vi: "Đang đăng nhập…", en: "Signing in…" },
    "divider": { vi: "HOẶC", en: "OR" },
    "sso": { vi: "Đăng nhập bằng SSO công ty", en: "Sign in with company SSO" },
    "ft-a": { vi: "NOC TOPOLOGY v0.4 · MÔI TRƯỜNG", en: "NOC TOPOLOGY v0.4 · ENVIRONMENT" },
    "ft-b": { vi: "HỖ TRỢ: IT NỘI BỘ", en: "SUPPORT: INTERNAL IT" }
  };

  function setLang(lang) {
    Array.prototype.slice.call(document.querySelectorAll("[data-i18n]")).forEach(function (el) {
      var k = el.getAttribute("data-i18n");
      if (T[k]) el.textContent = T[k][lang];
    });
    Array.prototype.slice.call(document.querySelectorAll("[data-i18n-ph]")).forEach(function (el) {
      var k = el.getAttribute("data-i18n-ph");
      if (T[k]) el.setAttribute("placeholder", T[k][lang]);
    });
    Array.prototype.slice.call(document.querySelectorAll(".vp-lang .lg")).forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-lang") === lang);
    });
  }

  Array.prototype.slice.call(document.querySelectorAll(".vp-lang .lg")).forEach(function (b) {
    b.addEventListener("click", function () {
      setLang(b.getAttribute("data-lang"));
    });
  });

  setState("default");
  setLang("vi");
})();
