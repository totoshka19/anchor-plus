/* =========================================================================
   Генератор карты для секции «География»: сплошные силуэты стран.
   Пишет img/map-ru-solid.svg и img/map-en-solid.svg.

   Инструмент разработчика, НЕ нужен для работы сайта и не выгружается на хостинг.
   Запуск:  node tools/make-map.mjs
   Данные:  Natural Earth 110m admin_0_countries (скачиваются автоматически в %TEMP%).
   ========================================================================= */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DATA = join(tmpdir(), 'ne_110m_countries.geojson');
const DATA_URL = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson';

/* ----------------------------- Параметры ----------------------------- */

// Видимое окно карты: северо-восточная четверть (Вост. Европа → Япония)
const LON = [15, 150];
const LAT = [6, 76];

const W = 1600;                                        // ширина viewBox
const H = Math.round(W * (LAT[1] - LAT[0]) / (LON[1] - LON[0])); // ≈830, равнопромежуточная проекция

// Палитра — соответствует :root в css/style.css
const C = {
  solidBase: '#e1eaf5', // суша вне зоны присутствия
  solidOps:  '#a8c4e5', // страны присутствия
  navy:    '#14284a',
  blue:    '#2b5a9e',
  blueLt:  '#3d6fb5',
  chipBrd: '#cdddf0',
  muted:   '#5d6e88',
};

// Страны присутствия (имена ADMIN из Natural Earth)
const OPS = new Set([
  'Russia', 'Kazakhstan', 'Belarus', 'Moldova', 'Armenia', 'Azerbaijan',
  'Uzbekistan', 'Turkmenistan', 'Tajikistan', 'Kyrgyzstan', 'China',
]);

/* ------------------------- Проекция и геометрия ------------------------- */

const px = lon => (lon - LON[0]) / (LON[1] - LON[0]) * W;
const py = lat => (LAT[1] - lat) / (LAT[1] - LAT[0]) * H;

const bbox = ring => {
  let minX = 1e9, minY = 1e9, maxX = -1e9, maxY = -1e9;
  for (const [x, y] of ring) {
    if (x < minX) minX = x; if (x > maxX) maxX = x;
    if (y < minY) minY = y; if (y > maxY) maxY = y;
  }
  return [minX, minY, maxX, maxY];
};

/* ----------------------------- Загрузка данных ----------------------------- */

if (!existsSync(DATA)) {
  console.log('Скачиваю Natural Earth…');
  const res = await fetch(DATA_URL);
  if (!res.ok) throw new Error(`Не удалось скачать геоданные: ${res.status}`);
  writeFileSync(DATA, await res.text());
}

const geo = JSON.parse(readFileSync(DATA, 'utf8'));

// Полигоны → [{ ops, rings: [{ bbox, outer: bool, pts }] }]
const shapes = [];
const foundOps = new Set();
for (const f of geo.features) {
  const name = f.properties.ADMIN ?? f.properties.admin;
  const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates]
    : f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates : [];
  const ops = OPS.has(name);
  if (ops) foundOps.add(name);
  for (const poly of polys) {
    shapes.push({ ops, rings: poly.map((pts, i) => ({ bbox: bbox(pts), outer: i === 0, pts })) });
  }
}
const missing = [...OPS].filter(n => !foundOps.has(n));
if (missing.length) console.warn('ВНИМАНИЕ, не найдены страны:', missing.join(', '));

/* ------------------------- Полигоны стран ------------------------- */

// берём только страны, чей bbox пересекает окно карты (остальное всё равно за кадром)
const inWindow = ([bx0, by0, bx1, by1]) =>
  bx1 >= LON[0] && bx0 <= LON[1] && by1 >= LAT[0] && by0 <= LAT[1];

const ringPath = pts =>
  pts.map(([lon, lat], i) => `${i ? 'L' : 'M'}${px(lon).toFixed(1)} ${py(lat).toFixed(1)}`).join('') + 'Z';

const solid = { base: [], ops: [] };
for (const s of shapes) {
  if (!inWindow(s.rings[0].bbox)) continue;
  solid[s.ops ? 'ops' : 'base'].push(s.rings.map(r => ringPath(r.pts)).join(''));
}

// отдельный <path> на страну: белая обводка даёт границы между соседями
const solidLayer = (paths, color) =>
  `<g fill="${color}" fill-rule="evenodd" stroke="#fff" stroke-width="1.2" stroke-linejoin="round">` +
  paths.map(d => `<path d="${d}"/>`).join('') + `</g>`;

/* --------------------------- Узлы и маршруты --------------------------- */

const P = {
  moscow: [px(37.62), py(55.75)],
  cis:    [px(27.56), py(53.90)],   // Минск
  kz:     [px(71.43), py(51.13)],   // Астана
  china:  [px(105.0), py(35.0)],
  vlad:   [px(131.89), py(43.12)],  // Владивосток
  sea:    [px(121.5), py(31.2)],    // выход в море (к портам Азии)
};

// дуга a→b с прогибом bow (px; >0 — вправо от направления, <0 — влево)
const arc = ([ax, ay], [bx, by], bow) => {
  const mx = (ax + bx) / 2, my = (ay + by) / 2;
  const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy);
  const cx = mx - dy / len * bow, cy = my + dx / len * bow;
  return { d: `M${ax.toFixed(0)} ${ay.toFixed(0)} Q${cx.toFixed(0)} ${cy.toFixed(0)} ${bx.toFixed(0)} ${by.toFixed(0)}`,
           // середина квадратичной кривой при t=0.5 — сюда вешается чип
           mid: [(ax + 2 * cx + bx) / 4, (ay + 2 * cy + by) / 4] };
};

const routes = {
  moscowKz:  arc(P.moscow, P.kz,     46),
  kzChina:   arc(P.kz,     P.china,  36),
  moscowCis: arc(P.moscow, P.cis,   -18),
  transsib:  arc(P.moscow, P.vlad, -120),
  vladSea:   arc(P.vlad,   P.sea,   -60),
};

const node = ([x, y], color = C.blue) =>
  `<g><circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="17" fill="none" stroke="${color}" stroke-width="2.5" opacity=".4"/>` +
  `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="9" fill="${color}"/></g>`;

const label = ([x, y], dy, text, anchor = 'middle') =>
  `<text x="${x.toFixed(0)}" y="${(y + dy).toFixed(0)}" text-anchor="${anchor}">${text}</text>`;

const chip = ([x, y], text) => {
  const w = Math.round(text.length * 11.5 + 30);
  return `<g><rect x="${(x - w / 2).toFixed(0)}" y="${(y - 17).toFixed(0)}" width="${w}" height="34" rx="17" fill="#fff" stroke="${C.chipBrd}"/>` +
    `<text x="${x.toFixed(0)}" y="${(y + 6).toFixed(0)}" text-anchor="middle">${text}</text></g>`;
};

/* ----------------------------- Сборка SVG ----------------------------- */

const L10N = {
  ru: {
    file: 'map-ru-solid.svg',
    aria: 'Карта направлений перевозок: Россия, Казахстан, страны СНГ, Китай и страны Азии, морские порты',
    russia: 'Россия', kz: 'Казахстан', cis: 'Страны СНГ',
    china: 'Китай и страны Азии', ports: 'Морские порты',
    road: 'авто', rail: 'ж/д', sea: 'море',
  },
  en: {
    file: 'map-en-solid.svg',
    aria: 'Shipping routes map: Russia, Kazakhstan, CIS countries, China and Asian countries, sea ports',
    russia: 'Russia', kz: 'Kazakhstan', cis: 'CIS countries',
    china: 'China and Asian countries', ports: 'Sea ports',
    road: 'road', rail: 'rail', sea: 'sea',
  },
};

const build = t => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${t.aria}">
  <defs>
    <linearGradient id="route" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${C.blue}"/>
      <stop offset="1" stop-color="${C.blueLt}"/>
    </linearGradient>
  </defs>

  <!-- суша: фон + страны присутствия -->
  ${solidLayer(solid.base, C.solidBase)}
  ${solidLayer(solid.ops, C.solidOps)}

  <!-- дуги маршрутов -->
  <g fill="none" stroke="url(#route)" stroke-width="4" stroke-linecap="round" stroke-dasharray="1 14">
    <path d="${routes.moscowKz.d}"/>
    <path d="${routes.kzChina.d}"/>
    <path d="${routes.moscowCis.d}"/>
    <path d="${routes.transsib.d}"/>
    <path d="${routes.vladSea.d}"/>
  </g>

  <!-- чипы видов транспорта -->
  <g font-family="Segoe UI, Arial, sans-serif" font-size="18" font-weight="700" fill="${C.blue}">
    ${chip(routes.moscowCis.mid, t.road)}
    ${chip(routes.moscowKz.mid, t.rail)}
    ${chip(routes.vladSea.mid, t.sea)}
  </g>

  <!-- узлы направлений -->
  ${node(P.moscow)}
  ${node(P.cis)}
  ${node(P.kz)}
  ${node(P.china, C.blueLt)}
  ${node(P.vlad, C.blueLt)}

  <!-- подписи: белая обводка, чтобы читались поверх точек -->
  <g font-family="Segoe UI, Arial, sans-serif" font-size="25" font-weight="800" fill="${C.navy}"
     paint-order="stroke" stroke="#fff" stroke-width="7" stroke-linejoin="round">
    ${label(P.moscow, -32, t.russia)}
    ${label(P.cis, 48, t.cis)}
    ${label(P.kz, 48, t.kz)}
    ${label(P.china, 50, t.china)}
    ${label(P.vlad, -32, t.ports)}
  </g>
</svg>
`;

for (const t of Object.values(L10N)) {
  const svg = build(t);
  writeFileSync(join(ROOT, 'img', t.file), svg);
  console.log(`Записан img/${t.file} (${(svg.length / 1024).toFixed(0)} КБ)`);
}
