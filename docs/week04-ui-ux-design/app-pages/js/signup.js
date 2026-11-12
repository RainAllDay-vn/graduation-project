(function () {
  "use strict";

  var root = document.getElementById("vp-signup");
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

  var loginLink = document.getElementById("link-login");
  if (loginLink) loginLink.addEventListener("click", function (e) {
    e.preventDefault();
  });

  /* ---- chuyển ngôn ngữ VI/EN ---- */
  var T = {
    "h1": { vi: "Tạo tài khoản", en: "Create account" },
    "lead-pre": { vi: "Đã có tài khoản?", en: "Already have an account?" },
    "lead-link": { vi: "Đăng nhập", en: "Sign in" },
    "banner-err": { vi: "Email này đã được đăng ký.", en: "This email is already registered." },
    "banner-ok": { vi: "Tạo tài khoản thành công — đã gửi email kích hoạt tới hộp thư công ty.", en: "Account created — activation email sent to your company inbox." },
    "name-ph": { vi: "Họ và tên", en: "Full name" },
    "email-ph": { vi: "Email công ty — ten@congty.vn", en: "Company email — name@company.vn" },
    "pass-ph": { vi: "Mật khẩu", en: "Password" },
    "pass2-ph": { vi: "Nhập lại mật khẩu", en: "Retype password" },
    "hint": { vi: "tối thiểu 8 ký tự", en: "minimum 8 characters" },
    "err-under": { vi: "Mật khẩu xác nhận không khớp.", en: "Passwords do not match." },
    "submit": { vi: "Tạo tài khoản", en: "Create account" },
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
