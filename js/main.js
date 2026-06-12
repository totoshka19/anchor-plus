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
  function setNav(open) {
    header.classList.toggle("nav-open", open);
    document.documentElement.classList.toggle("nav-lock", open); // overflow:hidden на <html>
    if (burger) burger.setAttribute("aria-expanded", open ? "true" : "false");
  }
  function closeNav() { setNav(false); }

  if (burger) {
    burger.addEventListener("click", () => setNav(!header.classList.contains("nav-open")));
  }
  document.querySelectorAll(".nav__link").forEach((link) => {
    link.addEventListener("click", closeNav);
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && header.classList.contains("nav-open")) closeNav();
  });
  // При переходе на десктоп меню закрываем (иначе блокировка прокрутки «зависнет»)
  window.addEventListener("resize", () => {
    if (window.innerWidth >= 1200 && header.classList.contains("nav-open")) closeNav();
  });

  /* --- Тень у хедера + кнопка «наверх» по скроллу --- */
  function onScroll() {
    const y = window.scrollY;
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

    // Страница могла открыться уже прокрученной (перезагрузка, #якорь) — показываем
    // всё выше текущего экрана. Именно load: срабатывает и в фоновой вкладке,
    // и после восстановления позиции прокрутки.
    function revealAboveFold() {
      if (!window.scrollY) return;
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

  /* --- Карусель «Грузы» --- */
  const carousel = document.getElementById("cargoCarousel");
  if (carousel) {
    const track   = carousel.querySelector(".carousel__track");
    const slides  = Array.from(track.children);
    const prevBtn = document.getElementById("cargoPrev");
    const nextBtn = document.getElementById("cargoNext");
    const dotsBox = document.getElementById("cargoDots");
    let index = 0;
    let perView = 0;
    let dots = [];

    // те же брейкпоинты, что в CSS: 3 слайда на десктопе, 2 на планшете, 1 на мобайле
    const getPerView = () => (window.innerWidth >= 1200 ? 3 : window.innerWidth >= 768 ? 2 : 1);
    const maxIndex = () => slides.length - perView;

    function buildDots() {
      dotsBox.innerHTML = "";
      dots = Array.from({ length: maxIndex() + 1 }, (_, i) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "carousel__dot";
        dot.setAttribute("aria-label", `Слайд ${i + 1}`);
        dot.addEventListener("click", () => goTo(i));
        dotsBox.appendChild(dot);
        return dot;
      });
    }

    function update() {
      const gap = parseFloat(getComputedStyle(track).gap) || 0;
      const step = slides[0].getBoundingClientRect().width + gap;
      track.style.transform = `translateX(${-index * step}px)`;
      prevBtn.disabled = index === 0;
      nextBtn.disabled = index === maxIndex();
      dots.forEach((dot, i) => dot.classList.toggle("is-active", i === index));
    }

    function goTo(i) {
      index = Math.max(0, Math.min(i, maxIndex()));
      update();
    }

    prevBtn.addEventListener("click", () => goTo(index - 1));
    nextBtn.addEventListener("click", () => goTo(index + 1));

    function layout() {
      const pv = getPerView();
      if (pv !== perView) { perView = pv; buildDots(); }
      goTo(index);
    }
    window.addEventListener("resize", layout);
    layout();

    // листаем только горизонтальные жесты: вертикальные — прокрутка страницы
    let startX = null, startY = null;
    track.addEventListener("pointerdown", (e) => { startX = e.clientX; startY = e.clientY; });
    track.addEventListener("pointerup", (e) => {
      if (startX === null) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      startX = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) goTo(index + (dx < 0 ? 1 : -1));
    });
    track.addEventListener("pointercancel", () => { startX = null; });
    // нативное перетаскивание <img> перехватывало бы жест мыши
    track.addEventListener("dragstart", (e) => e.preventDefault());

    // без ховера (тач) описание раскрывается тапом
    if (window.matchMedia("(hover: none)").matches) {
      slides.forEach((slide) => {
        slide.addEventListener("click", () => {
          const wasOpen = slide.classList.contains("is-open");
          slides.forEach((s) => s.classList.remove("is-open"));
          if (!wasOpen) slide.classList.add("is-open");
        });
      });
    }
  }

  /* --- Форма заявки (клиентская валидация; отправка — заглушка) --- */
  const requestForm = document.getElementById("requestForm");
  if (requestForm) {
    const statusEl = document.getElementById("requestStatus");

    // сообщение об успехе: показать и через паузу плавно убрать
    let statusTimer = null;
    const showStatus = () => {
      if (!statusEl) return;
      clearTimeout(statusTimer);
      statusEl.classList.remove("is-hiding");
      statusEl.hidden = false;                   // текст уже локализован через data-i18n
      statusTimer = setTimeout(() => {
        statusEl.classList.add("is-hiding");      // запускаем угасание (opacity → 0)
        statusTimer = setTimeout(() => {          // после перехода убираем из потока
          statusEl.hidden = true;
          statusEl.classList.remove("is-hiding");
        }, 500);
      }, 6000);
    };

    // показать/скрыть ошибку у поля и связанной подписи (aria-describedby)
    const setError = (input, show) => {
      const errEl = document.getElementById(input.getAttribute("aria-describedby"));
      input.classList.toggle("is-invalid", show);
      input.setAttribute("aria-invalid", show ? "true" : "false");
      if (errEl) errEl.hidden = !show;
    };

    // нормализуем телефон к российскому формату +7 (XXX) XXX-XX-XX
    const phoneInput = requestForm.elements["phone"];
    const phoneDigits = (v) => {
      let d = v.replace(/\D/g, "");
      if (d[0] === "7" || d[0] === "8") d = d.slice(1); // отбрасываем код страны
      return d.slice(0, 10);                            // максимум 10 национальных цифр
    };
    const formatPhone = (v) => {
      const d = phoneDigits(v);
      if (!d) return "";
      let out = "+7 (" + d.slice(0, 3);
      if (d.length >= 3) out += ")";
      if (d.length > 3)  out += " "  + d.slice(3, 6);
      if (d.length > 6)  out += "-"  + d.slice(6, 8);
      if (d.length > 8)  out += "-"  + d.slice(8, 10);
      return out;
    };

    // обязательны: имя (непустое), телефон (ровно 10 цифр), согласие (отмечено)
    const checks = {
      name:    (v) => v.trim().length > 0,
      phone:   (v) => phoneDigits(v).length === 10,
      consent: (el) => el.checked,
    };

    requestForm.addEventListener("submit", (e) => {
      e.preventDefault();
      let firstInvalid = null;

      ["name", "phone"].forEach((nm) => {
        const input = requestForm.elements[nm];
        const ok = checks[nm](input.value);
        setError(input, !ok);
        if (!ok && !firstInvalid) firstInvalid = input;
      });

      const consent = requestForm.elements["consent"];
      const consentOk = checks.consent(consent);
      setError(consent, !consentOk);
      if (!consentOk && !firstInvalid) firstInvalid = consent;

      if (firstInvalid) { firstInvalid.focus(); return; }

      // ---- ЗАГЛУШКА ОТПРАВКИ ----
      // TODO(бэкенд): заменить на реальную отправку, напр.:
      //   const data = Object.fromEntries(new FormData(requestForm));
      //   fetch("/api/request", { method: "POST", body: JSON.stringify(data) })
      //     .then(() => showSuccess()).catch(() => showError());
      // и показывать успех только после ответа сервера.
      console.warn("[requestForm] Отправка не подключена — это клиентская заглушка.");
      requestForm.reset();
      showStatus();
    });

    // маска телефона: на лету вырезаем нецифры и форматируем как +7 (XXX) XXX-XX-XX
    phoneInput.addEventListener("input", () => {
      const formatted = formatPhone(phoneInput.value);
      if (phoneInput.value !== formatted) phoneInput.value = formatted;
    });

    // снимаем подсветку ошибки, как только пользователь правит поле
    requestForm.addEventListener("input", (e) => {
      if (e.target.classList.contains("is-invalid")) setError(e.target, false);
    });
  }
})();
