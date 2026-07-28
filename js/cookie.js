/* =========================================================================
   Плашка «Мы используем cookie» (информирование по 152-ФЗ).
   Показывается, пока посетитель не нажал «Хорошо»; выбор хранится
   в localStorage и общий для всех страниц сайта.
   ========================================================================= */
(() => {
  "use strict";

  const KEY = "ankor-cookie-ok";
  const box = document.getElementById("cookieNotice");
  const btn = document.getElementById("cookieAccept");
  if (!box || !btn) return;

  let seen = null;
  try { seen = localStorage.getItem(KEY); } catch {}
  if (seen === "1") return;               // выбор уже сделан — не показываем

  box.hidden = false;
  btn.addEventListener("click", () => {
    try { localStorage.setItem(KEY, "1"); } catch {}
    box.hidden = true;
  });
})();
