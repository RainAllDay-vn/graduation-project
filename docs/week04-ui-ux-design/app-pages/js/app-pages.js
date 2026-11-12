(function () {
  "use strict";

  /* ---- fit miniature vào vùng giữa (khung thiết kế 1440x900) ---- */
  var stage = document.getElementById("stage");
  var frame = document.querySelector(".viewport-frame");
  var vp = document.querySelector(".viewport");
  var DESIGN_W = 1440, DESIGN_H = 900;

  function fitViewport() {
    if (!stage || !frame || !vp) return;
    var hint = document.querySelector(".stage-hint");
    var hintH = hint ? hint.offsetHeight : 0;
    var cs = getComputedStyle(stage);
    var availW = stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    var availH = stage.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - hintH - 6;
    var s = Math.min(availW / DESIGN_W, availH / DESIGN_H);
    s = Math.max(0.15, s);
    vp.style.transform = "scale(" + s + ")";
    frame.style.width = Math.floor(DESIGN_W * s) + "px";
    frame.style.height = Math.floor(DESIGN_H * s) + "px";
  }

  window.addEventListener("resize", fitViewport);
  fitViewport();

  /* ---- soi card (sidebar trái) <-> vùng — chỉ card kích hoạt, miniature không clickable ---- */
  var viewport = document.querySelector(".viewport");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".card[data-region]"));
  var regions = Array.prototype.slice.call(document.querySelectorAll(".viewport [data-region]"));
  var pinnedCard = null;

  function applyHl(regionId) {
    viewport.classList.remove("dim");
    regions.forEach(function (r) { r.classList.remove("hl"); r.classList.remove("dimmed"); });
    if (!regionId) return;
    viewport.classList.add("dim");
    var el = viewport.querySelector('[data-region="' + regionId + '"]');
    if (!el) return;
    el.classList.add("hl");
    regions.forEach(function (r) {
      if (r !== el && !r.contains(el) && !el.contains(r)) r.classList.add("dimmed");
    });
  }

  function setPinned(card) {
    cards.forEach(function (c) { c.classList.remove("pinned"); });
    pinnedCard = card;
    if (card) card.classList.add("pinned");
    applyHl(card ? card.getAttribute("data-region") : null);
  }

  cards.forEach(function (card) {
    card.addEventListener("mouseenter", function () {
      applyHl(card.getAttribute("data-region"));
    });
    card.addEventListener("mouseleave", function () {
      applyHl(pinnedCard ? pinnedCard.getAttribute("data-region") : null);
    });
    card.addEventListener("click", function (e) {
      e.stopPropagation();
      setPinned(card === pinnedCard ? null : card);
      if (card === pinnedCard) card.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
  });

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".card[data-region]")) setPinned(null);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setPinned(null);
  });
})();
