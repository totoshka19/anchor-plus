/* =========================================================================
   Переключение языка RU <-> EN без зависимостей.
   Русский текст живёт в index.html: на загрузке он снимается в словарь RU,
   словарь EN задан ниже вручную, выбор языка хранится в localStorage.
   Новая строка: атрибут data-i18n="ключ" в HTML + перевод с тем же ключом в EN.
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
    "nav.partners": "Cooperation",
    "nav.request": "Request",

    "hero.eyebrow": "Freight forwarding company",
    "hero.title": "Transportation of industrial and raw material cargo",
    "hero.subtitle": "Railway, road, and multimodal transportation of coal, metal, grain, petrochemical products, and other cargo across Russia, Kazakhstan, and international destinations",
    "hero.cta1": "Contact us",
    "hero.scroll": "Scroll down",

    "about.kicker": "About us",
    "about.title": "Reliable partner in industrial logistics",
    "about.p1": "ANCHOR\u00A0PLUS is a freight forwarding company specializing in the organization of bulk, general, container, and raw material cargo. We work with enterprises in the mining, metallurgical, agricultural, petrochemical, and manufacturing industries.",
    "about.p2": "We build logistics around the client's needs: from picking up cargo at the extraction site by road to rail transportation and transshipment at sea ports. We handle the entire route and keep the cargo under control at every stage.",
    "about.p3": "We transport industrial and raw material cargo across Russia, Kazakhstan, and international destinations",
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
    "cargo.title1": "We work with a wide range of cargo",
    "cargo.lead1": "We tailor a solution to the specific cargo, route, and shipment volume. We consider loading requirements, cargo safety, transit times, documentation, and further transshipment.",
    "cargo.title2": "Container transportation by rail",
    "cargo.lead2": "We organize container transportation by rail for industrial, raw material, commercial, and consolidated cargo shipments.",
    "cargo.lead3": "We select the appropriate container type, coordinate the route, arrange container supply, rail dispatch, and further delivery to the terminal, warehouse, or final recipient.",
    "cargo.lead4": "Container transportation is suitable for cargo where safety, easy transshipment, clear logistics, and delivery across domestic and international routes are essential.",
    "cargo.s1.title": "Coal",
    "cargo.s1.text": "We arrange bulk transportation of steam, hard and coking coal. We handle single-wagon, group and block-train shipments, including delivery to stations, terminals and ports.",
    "cargo.s2.title": "Metal and metal products",
    "cargo.s2.text": "We transport rolled metal, sheet metal, pipes, rebar, billets, steel structures and other products of metallurgical plants. We select suitable transport and keep shipping conditions under control.",
    "cargo.s3.title": "Grain cargo",
    "cargo.s3.text": "We arrange transportation of grain and agricultural products, taking into account seasonality, volumes, dispatch dates and cargo safety requirements.",
    "cargo.s4.title": "Petrochemical products",
    "cargo.s4.text": "We handle petrochemical and chemical cargo, where the right route, proper documentation and compliance with transportation requirements are essential.",
    "cargo.s5.title": "Ferroalloys and raw materials",
    "cargo.s5.text": "We transport ferrosilicon, ferromanganese, silicomanganese, ore, concentrates and other materials for the metallurgical and industrial sectors.",
    "cargo.s6.title": "Other cargo",
    "cargo.s6.text": "We are open to non-standard tasks and will design a transport scheme around your cargo, route and requirements.",
    "carousel.prev": "Previous slide",
    "carousel.next": "Next slide",
    "carousel.dots": "Slide navigation",

    "geo.kicker": "Geography",
    "geo.title": "Geography of our operations",
    "geo.lead1": "We arrange transportation across Russia, Kazakhstan, CIS countries and international destinations. Core routes are built on railway infrastructure, road transport and sea ports.",
    "geo.lead2": "We accompany cargo along the entire route: from the place of production, extraction or storage to the destination station, terminal, port or final recipient.",
    "geo.dirsTitle": "Main destinations",
    "geo.dir1": "Russia",
    "geo.dir2": "Kazakhstan",
    "geo.dir3": "CIS countries",
    "geo.dir4": "China and other Asian countries",
    "geo.dir5": "Export routes via sea ports",
    "geo.dir6": "Domestic industrial routes across Russia",
    "geo.map": "img/map-en-solid.svg?v=2",
    "geo.mapAlt": "Map of shipping destinations: Russia, Kazakhstan, CIS countries, sea ports, China and Asian countries",
    "geo.road": "Road transport",
    "geo.roadDesc": "Cargo pickup from the production, extraction or storage site and delivery to the station or terminal",
    "geo.rail": "Railway",
    "geo.railDesc": "The backbone of our routes: transportation across the rail networks of Russia, Kazakhstan and CIS countries",
    "geo.sea": "Sea transshipment",
    "geo.seaDesc": "Transshipment at sea ports and export shipments to China and other Asian countries",

    "why.kicker": "Advantages",
    "why.title": "Why clients choose us",
    "why.f1.title": "Industrial logistics expertise",
    "why.f1.text": "We understand the specifics of moving bulk, raw material and industrial cargo: from coal and metal to grain and petrochemicals.",
    "why.f2.title": "End-to-end transport management",
    "why.f2.text": "We handle the entire process: route, transport, paperwork, coordination with all parties involved and execution control.",
    "why.f3.title": "Multimodal solutions",
    "why.f3.text": "We combine rail, road and sea transport to find the most efficient delivery scheme.",
    "why.f4.title": "Custom quote",
    "why.f4.text": "Every project is calculated based on the cargo, volume, destination, timing and client requirements.",
    "why.f5.title": "Control at every stage",
    "why.f5.text": "We accompany the shipment from loading until the cargo arrives at its destination.",
    "why.f6.title": "Large-volume shipments",
    "why.f6.text": "We arrange transportation for industrial enterprises, traders, manufacturers and exporters.",

    "partners.kicker": "Cooperation",
    "partners.title": "Open to cooperation",
    "partners.p1": "We are ready for long-term cooperation with shippers, manufacturing enterprises, traders, carriers, terminals, port operators and logistics partners.",
    "partners.p2": "Our goal is to build resilient transport chains that help businesses deliver cargo reliably, transparently and on agreed timelines.",
    "partners.imgAlt": "A worker in a hard hat and a manager review a shipping route on a tablet at a sea port near a freight train",

    "request.kicker": "Request",
    "request.title": "Let's calculate your route and shipping cost",
    "request.lead": "Contact us for a consultation on transporting your cargo. We will clarify the shipment details, destination and timing, and propose the optimal transport scheme.",
    "request.nameLabel": "Name",
    "request.namePh": "How should we address you",
    "request.phoneLabel": "Phone",
    "request.phonePh": "+7 (___) ___-__-__",
    "request.companyLabel": "Company",
    "request.companyPh": "Company name",
    "request.cargoLabel": "Type of cargo",
    "request.cargoPh": "Coal, metal, grain…",
    "request.directionLabel": "Shipping direction",
    "request.directionPh": "From → to",
    "request.messageLabel": "Message",
    "request.messagePh": "Shipment volume, timing, special requirements",
    "request.consentText": "I consent to the processing of my personal data in accordance with the ",
    "request.consentLink": "Privacy Policy",
    "request.errRequired": "Please fill in this field",
    "request.errPhone": "Please enter a valid phone number",
    "request.errConsent": "Consent to personal data processing is required",
    "request.submit": "Submit request",
    "request.success": "Thank you! We will get in touch with you shortly.",

    "contacts.addressValue": "123112, Moscow, Presnenskaya nab. 12, office 15/27",

    "footer.desc": "Reliable logistics for large industrial shipments",
    "footer.navTitle": "Navigation",
    "footer.contactsTitle": "Contacts",
    "footer.copy": "JSC ANCHOR\u00A0PLUS. All rights reserved.",
    "footer.legal": "TIN 7720853862 · PSRN 1217700412731",
    "footer.privacy": "Privacy Policy"
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
    const nodes = document.querySelectorAll(`[${PREFIX}], [${PREFIX}-content], [${PREFIX}-alt], [${PREFIX}-src], [${PREFIX}-aria-label], [${PREFIX}-placeholder]`);
    nodes.forEach((el) => {
      for (const attrNode of el.attributes) {
        const name = attrNode.name;
        if (name !== PREFIX && !name.startsWith(`${PREFIX}-`)) continue;

        const attr = name === PREFIX ? null : name.slice(PREFIX.length + 1); // напр. "alt", "src", "content"
        const key = attrNode.value;

        targets.push({ el, attr, key });
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
