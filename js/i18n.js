/* =========================================================================
   Переключение языка RU <-> EN без зависимостей.

   Как это работает:
   1. Русский текст — прямо в index.html (он же контент по умолчанию).
   2. На загрузке скрипт находит все элементы с атрибутами data-i18n*
      и СНИМАЕТ из них русские строки -> это словарь RU.
   3. Английский словарь (EN) задан ниже вручную.
   4. Кнопка RU/EN подменяет текст/атрибуты и запоминает выбор в localStorage.

   Чтобы поправить английский перевод — редактируйте объект EN ниже.
   Чтобы добавить новую переводимую строку — повесьте в HTML атрибут
   data-i18n="мой.ключ" и добавьте 'мой.ключ' в EN.
   ========================================================================= */
(() => {
  "use strict";

  /* ----------------------------- Словарь EN ----------------------------- */
  const EN = {
    "meta.title": "ANCHOR PLUS — international shipping of coal, metal and ferroalloys",
    "meta.description": "Freight forwarding company. Rail and multimodal transportation of coal, metal products and ferroalloys from Russia via Kazakhstan to Asian countries.",

    "a11y.skip": "Skip to content",

    "logo.src": "img/logo-en.svg",
    "brand.name": "ANCHOR PLUS",

    "nav.about": "About",
    "nav.cargo": "Cargo",
    "nav.geo": "Geography",
    "nav.why": "Advantages",
    "nav.partners": "Partners",
    "nav.contacts": "Contacts",

    "hero.eyebrow": "Freight forwarding company",
    "hero.title": "Transportation of industrial and raw materials",
    "hero.subtitle": "Railway, road, and multimodal transportation of coal, metal, grain, petrochemical products, and other cargo across Russia, Kazakhstan, and international destinations",
    "hero.cta1": "Contact us",
    "hero.scroll": "Scroll down",

    "about.kicker": "About us",
    "about.title": "Reliable partner in industrial logistics",
    "about.p1": "ANCHOR PLUS is a freight forwarding company specializing in the organization of bulk, general, container, and raw material cargo. We work with enterprises in the mining, metallurgical, agricultural, petrochemical, and manufacturing industries.",
    "about.p2": "We build logistics around the client's needs: from picking up cargo at the extraction site by road to rail transportation and transshipment at sea ports. We handle the entire route and keep the cargo under control at every stage.",
    "about.p3": "We transport industrial and raw materials across Russia, Kazakhstan, and international destinations",
    "about.p4": "Our services include railway, road, and multimodal transportation of coal, metal, grain, petrochemical products, and other cargo.",
    "about.p5": "Full-service support covers route selection, transport and rolling stock coordination, document preparation, participant management, and cargo tracking to the destination.",
    "about.hl1": "International and domestic transportation",
    "about.hl2": "Railway, road, and multimodal logistics",
    "about.hl3": "Handling of industrial, raw material, and bulk cargo",
    "about.hl4": "Individual route and cost calculation",
    "about.hl5": "Cargo control at every stage",
    "about.ctaText": "Reliable logistics for large industrial shipments",
    "about.ctaBtn": "Calculate transportation",

    "cargo.kicker": "Cargo",
    "cargo.title": "What we ship",
    "cargo.lead": "We specialize in bulk and metallurgical cargo that requires reliable logistics and experience.",
    "cargo.coal.title": "Coal",
    "cargo.coal.text": "Steam and coking coal in bulk. We arrange block-train and single-wagon shipments.",
    "cargo.metal.title": "Metal products",
    "cargo.metal.text": "Rolled metal, billets, pipes and metal goods. We select rolling stock to match the cargo.",
    "cargo.ferro.title": "Ferroalloys",
    "cargo.ferro.text": "Ferrosilicon, ferromanganese, silicomanganese and other alloys, shipped with proper packaging.",
    "cargo.coal.alt": "Coal bulk transportation",
    "cargo.metal.alt": "Metal products transportation",
    "cargo.ferro.alt": "Ferroalloys transportation",

    "geo.kicker": "Geography",
    "geo.title": "Geography of our operations",
    "geo.lead": "Our main route runs from Russia via Kazakhstan to Asian countries. We deliver cargo by any mode of transport and arrange transshipment at sea ports.",
    "geo.map": "img/map-en.svg",
    "geo.mapAlt": "Map of routes from Russia via Kazakhstan to Asian countries",
    "geo.road": "Road transport",
    "geo.roadDesc": "Cargo pickup at the extraction site and delivery to the rail terminal.",
    "geo.rail": "Railway",
    "geo.railDesc": "The main leg of the route: transportation across the Russian and Kazakh rail networks.",
    "geo.sea": "Sea transshipment",
    "geo.seaDesc": "Transshipment at sea ports and shipping to Asian countries.",

    "why.kicker": "Advantages",
    "why.title": "Why clients choose us",
    "why.f1.title": "Multimodal",
    "why.f1.text": "Road, rail and sea transshipment within a single route.",
    "why.f2.title": "Direct routes",
    "why.f2.text": "Established corridors through Kazakhstan to Asian countries.",
    "why.f3.title": "Custom quote",
    "why.f3.text": "We calculate the rate and delivery scheme for your specific cargo.",
    "why.f4.title": "Control at every stage",
    "why.f4.text": "We accompany cargo from the extraction site to the recipient.",
    "why.f5.title": "Bulk cargo",
    "why.f5.text": "Experience with coal, metal and ferroalloys.",
    "why.f6.title": "International forwarding",
    "why.f6.text": "Paperwork and support at border crossings.",

    "partners.kicker": "Partners",
    "partners.title": "Our partners",
    "partners.lead": "We are open to cooperation with shippers, carriers and port operators.",

    "contacts.kicker": "Contacts",
    "contacts.title": "Get in touch",
    "contacts.lead": "Call us for a consultation and a shipping cost estimate — we will find the best route.",
    "contacts.phoneLabel": "Phone",
    "contacts.emailLabel": "Email",
    "contacts.addressLabel": "Address",
    "contacts.addressValue": "123112, Moscow, Presnenskaya nab. 12, office 15/27",

    "footer.desc": "Freight forwarding company. International transportation of coal, metal products and ferroalloys.",
    "footer.navTitle": "Navigation",
    "footer.contactsTitle": "Contacts",
    "footer.copy": "JSC \"ANCHOR PLUS\". All rights reserved.",
    "footer.legal": "TIN 7720853862 · PSRN 1217700412731"
  };

  /* --------------------------- Движок (общий) --------------------------- */
  const STORAGE_KEY = "ankor-lang";
  const PREFIX = "data-i18n";
  const DICT = { ru: {}, en: EN };
  const targets = [];      // [{ el, attr|null, key }]
  let buttons = [];
  let current = "ru";

  // Собираем все переводимые цели и заодно снимаем русские строки.
  function collect() {
    const nodes = document.querySelectorAll(`[${PREFIX}], [${PREFIX}-content], [${PREFIX}-alt], [${PREFIX}-src], [${PREFIX}-aria-label]`);
    nodes.forEach((el) => {
      for (const attrNode of el.attributes) {
        const name = attrNode.name;
        if (name !== PREFIX && !name.startsWith(`${PREFIX}-`)) continue;

        const attr = name === PREFIX ? null : name.slice(PREFIX.length + 1); // напр. "alt", "src", "content"
        const key = attrNode.value;

        targets.push({ el, attr, key });
        // RU = то, что уже стоит в разметке
        DICT.ru[key] = attr === null ? el.textContent : el.getAttribute(attr);
      }
    });
  }

  function apply(lang) {
    const map = DICT[lang] || {};
    targets.forEach((t) => {
      const val = map[t.key];
      if (val == null) return;               // нет перевода — оставляем как есть
      if (t.attr === null) t.el.textContent = val;
      else t.el.setAttribute(t.attr, val);
    });
    document.documentElement.lang = lang;
  }

  function setLang(lang) {
    if (lang !== "ru" && lang !== "en") lang = "ru";
    current = lang;
    apply(lang);
    buttons.forEach((b) => b.classList.toggle("is-active", b.getAttribute("data-lang") === lang));
    try { localStorage.setItem(STORAGE_KEY, lang); } catch {}
  }

  function init() {
    collect();

    buttons = Array.from(document.querySelectorAll(".lang-switch__btn"));
    buttons.forEach((b) => {
      b.addEventListener("click", () => setLang(b.getAttribute("data-lang")));
    });

    let saved = null;
    try { saved = localStorage.getItem(STORAGE_KEY); } catch {}
    // По умолчанию — русский. Меняем только если пользователь раньше выбрал EN.
    setLang(saved === "en" ? "en" : "ru");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
