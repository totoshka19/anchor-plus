/* =========================================================================
   Интерфейсное поведение лендинга (без зависимостей).
   ========================================================================= */
(() => {
  "use strict";

  const header = document.getElementById("header");
  const burger = document.getElementById("burger");
  const toTop  = document.getElementById("toTop");

  /* --- Год в подвале --- */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* --- Мобильное меню (бургер) --- */
  // Открытие/закрытие меню + блокировка прокрутки страницы под ним
  function setNav(open) {
    header.classList.toggle("nav-open", open);
    document.documentElement.classList.toggle("nav-lock", open); // overflow:hidden на <html>
    if (burger) burger.setAttribute("aria-expanded", open ? "true" : "false");
  }
  function closeNav() { setNav(false); }

  if (burger) {
    burger.addEventListener("click", () => setNav(!header.classList.contains("nav-open")));
  }
  // Клик по пункту меню закрывает его
  document.querySelectorAll(".nav__link").forEach((link) => {
    link.addEventListener("click", closeNav);
  });
  // Esc закрывает меню
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && header.classList.contains("nav-open")) closeNav();
  });
  // При переходе на десктоп меню закрываем (иначе блокировка прокрутки «зависнет»)
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1200 && header.classList.contains("nav-open")) closeNav();
  });

  /* --- Тень у хедера + кнопка «наверх» по скроллу --- */
  function onScroll() {
    const y = window.pageYOffset || document.documentElement.scrollTop;
    header.classList.toggle("is-scrolled", y > 8);
    if (toTop) toTop.classList.toggle("is-visible", y > 500);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toTop) {
    toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  }

  /* --- Появление блоков при прокрутке --- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target); // анимируем один раз
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

    reveals.forEach((el) => io.observe(el));

    // Если страница открылась уже прокрученной (перезагрузка или ссылка на #якорь),
    // сразу показываем всё, что в зоне видимости или выше неё — чтобы контент
    // над текущим экраном не оставался скрытым. Блоки ниже по-прежнему анимируются.
    // Используем событие load (а не requestAnimationFrame): оно срабатывает даже
    // в фоновой вкладке и уже после восстановления позиции прокрутки.
    function revealAboveFold() {
      if (!window.pageYOffset) return;
      reveals.forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight) {
          el.classList.add("is-visible");
          io.unobserve(el);
        }
      });
    }
    if (document.readyState === "complete") revealAboveFold();
    else window.addEventListener("load", revealAboveFold);
  } else {
    // Фолбэк: если IntersectionObserver не поддерживается — просто показываем
    reveals.forEach((el) => el.classList.add("is-visible"));
  }
})();
