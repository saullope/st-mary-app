// Ilustraciones para contar, con la cantidad exacta que pide la pregunta.
// Una foto de stock no garantiza cuántas cosas muestra y en primer grado eso confunde.
//
// Formato de la consulta (CatalogMedia.query con source "counting"):
//   "apple:3 + pear:2"         grupos separados por "+", con el signo dibujado entre ellos
//   "balloon:4,balloon-popped:2" varios objetos en un mismo grupo
//   "card:3"                   tarjeta de número: el dígito y sus puntos
//   "clock:9h30"               reloj de agujas con esa hora exacta (horas de 1 a 12)
//
// Cada objeto ocupa una celda de 100x100 y las filas tienen como mucho 5, para que se
// puedan contar de un vistazo (como los marcos de cinco que se usan en primer grado).

const CELL = 100;
const PER_ROW = 5;
const PAD = 24;
const PLUS = 70;

// Íconos planos en una caja de 100x100, sin texto ni detalles que distraigan.
const ICONS = {
  apple: `<path d="M50 30c-9-8-34-6-34 22 0 20 14 34 26 34 4 0 6-2 8-2s4 2 8 2c12 0 26-14 26-34 0-28-25-30-34-22z" fill="#E5484D"/>
    <path d="M50 30c0-8 2-14 6-18" stroke="#6B3E1F" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M55 20c6-8 16-8 20-4-6 7-14 8-20 4z" fill="#3FA34D"/>`,
  pear: `<path d="M50 22c-8 0-11 8-11 16 0 8-17 14-17 30 0 14 12 22 28 22s28-8 28-22c0-16-17-22-17-30 0-8-3-16-11-16z" fill="#9BCB3C"/>
    <path d="M50 22c0-6 1-10 4-13" stroke="#6B3E1F" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M54 14c5-6 13-6 16-2-5 5-11 6-16 2z" fill="#3FA34D"/>`,
  orange: `<circle cx="50" cy="55" r="32" fill="#F59E0B"/>
    <path d="M50 23c2-6 8-9 14-8-2 6-8 9-14 8z" fill="#3FA34D"/>
    <circle cx="40" cy="48" r="2" fill="#D97706"/><circle cx="58" cy="60" r="2" fill="#D97706"/><circle cx="46" cy="68" r="2" fill="#D97706"/>`,
  banana: `<path d="M20 30c4 30 26 50 62 44 4-1 4-6 0-6-28 2-44-14-52-40-2-5-10-4-10 2z" fill="#FACC15"/>
    <path d="M19 28l-3-8 8 2z" fill="#6B3E1F"/>`,
  bird: `<ellipse cx="48" cy="58" rx="28" ry="22" fill="#3B82F6"/>
    <circle cx="68" cy="40" r="15" fill="#3B82F6"/>
    <path d="M82 40l12 4-12 4z" fill="#F59E0B"/>
    <circle cx="71" cy="37" r="3.5" fill="#140A2E"/>
    <path d="M30 56c10-14 26-14 34-4-10 10-24 12-34 4z" fill="#1D4ED8"/>
    <path d="M40 80l-4 10M54 80l4 10" stroke="#F59E0B" stroke-width="4" stroke-linecap="round"/>`,
  pencil: `<g transform="rotate(-45 50 50)">
    <rect x="20" y="40" width="52" height="20" rx="3" fill="#FACC15"/>
    <rect x="14" y="40" width="10" height="20" rx="3" fill="#F472B6"/>
    <path d="M72 40l18 10-18 10z" fill="#F5D0A9"/><path d="M84 46.6l6 3.4-6 3.4z" fill="#140A2E"/></g>`,
  balloon: `<ellipse cx="50" cy="42" rx="24" ry="30" fill="#EC4899"/>
    <path d="M46 72h8l-4 6z" fill="#BE185D"/>
    <path d="M50 78c-6 6 6 10 0 18" stroke="#9CA3AF" stroke-width="2" fill="none"/>
    <ellipse cx="41" cy="30" rx="5" ry="9" fill="#F9A8D4"/>`,
  "balloon-popped": `<path d="M50 20l6 16 16-8-8 16 16 6-16 6 8 16-16-8-6 16-6-16-16 8 8-16-16-6 16-6-8-16 16 8z" fill="#E5E7EB" stroke="#9CA3AF" stroke-width="2"/>`,
  cookie: `<circle cx="50" cy="52" r="32" fill="#D6A15B"/>
    <circle cx="38" cy="42" r="4.5" fill="#5B3417"/><circle cx="60" cy="40" r="4" fill="#5B3417"/>
    <circle cx="52" cy="58" r="4.5" fill="#5B3417"/><circle cx="36" cy="64" r="3.5" fill="#5B3417"/><circle cx="66" cy="62" r="3.5" fill="#5B3417"/>`,
  "cookie-eaten": `<circle cx="38" cy="66" r="5" fill="#E8C99B"/><circle cx="54" cy="70" r="4" fill="#E8C99B"/>
    <circle cx="64" cy="62" r="3" fill="#E8C99B"/><circle cx="46" cy="58" r="3" fill="#E8C99B"/>`,
  star: `<path d="M50 14l10.6 22 24 3.4-17.4 16.8 4.2 23.8L50 68.6 28.6 80l4.2-23.8L15.4 39.4l24-3.4z" fill="#FACC15"/>`,
};

const CARD_COLORS = ["#5B3FE0", "#0E7490", "#BE185D", "#B45309", "#15803D", "#1D4ED8", "#9333EA", "#C2410C", "#0F766E", "#4338CA"];

function parse(spec) {
  return spec.split("+").map((group) =>
    group.split(",").map((part) => {
      const [name, count] = part.trim().split(":");
      const amount = Number(count);
      if (!Number.isInteger(amount) || amount < 0 || amount > 20) throw new Error(`counting: bad amount in "${part}"`);
      if (name !== "card" && !ICONS[name]) throw new Error(`counting: unknown icon "${name}"`);
      return { name, amount };
    }),
  );
}

// Tarjeta de número para LudiMemory: el dígito grande y abajo la misma cantidad de puntos.
function card(value) {
  const color = CARD_COLORS[value % CARD_COLORS.length];
  const dots = Array.from({ length: value }, (_, i) => {
    const row = Math.floor(i / PER_ROW);
    const col = i % PER_ROW;
    const inRow = Math.min(PER_ROW, value - row * PER_ROW);
    const x = 200 - ((inRow - 1) * 44) / 2 + col * 44;
    return `<circle cx="${x}" cy="${300 + row * 44}" r="16" fill="#ffffff"/>`;
  }).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <rect x="8" y="8" width="384" height="384" rx="36" fill="${color}"/>
  <text x="200" y="230" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="210" font-weight="700" fill="#ffffff">${value}</text>
  ${dots}
</svg>`;
}

// Reloj de agujas: la corta marca la hora y avanza con los minutos, como en uno real.
function clock(spec) {
  const match = /^clock:(\d{1,2})h(\d{2})$/.exec(spec.trim());
  if (!match) throw new Error(`counting: bad clock "${spec}" (use clock:9h30)`);
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 1 || hours > 12 || minutes > 59) throw new Error(`counting: bad time "${spec}"`);
  const point = (angle, length) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return `${(200 + length * Math.cos(rad)).toFixed(1)} ${(200 + length * Math.sin(rad)).toFixed(1)}`;
  };
  const numbers = Array.from({ length: 12 }, (_, i) => {
    const n = i + 1;
    const [x, y] = point(n * 30, 128).split(" ");
    return `<text x="${x}" y="${Number(y) + 14}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="40" font-weight="700" fill="#1C1633">${n}</text>`;
  }).join("");
  const ticks = Array.from({ length: 60 }, (_, i) => {
    const long = i % 5 === 0;
    return `<path d="M${point(i * 6, 168)} L${point(i * 6, long ? 154 : 161)}" stroke="#1C1633" stroke-width="${long ? 5 : 2}" stroke-linecap="round"/>`;
  }).join("");
  const hourAngle = (hours % 12) * 30 + minutes * 0.5;
  const minuteAngle = minutes * 6;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <circle cx="200" cy="200" r="190" fill="#5B3FE0"/>
  <circle cx="200" cy="200" r="176" fill="#FFFDF7"/>
  ${ticks}
  ${numbers}
  <path d="M200 200 L${point(hourAngle, 92)}" stroke="#E5484D" stroke-width="14" stroke-linecap="round"/>
  <path d="M200 200 L${point(minuteAngle, 118)}" stroke="#1C1633" stroke-width="8" stroke-linecap="round"/>
  <circle cx="200" cy="200" r="12" fill="#1C1633"/>
</svg>`;
}

export function countingSvg(spec) {
  if (spec.trim().startsWith("clock:")) return clock(spec);
  const groups = parse(spec);
  if (groups.length === 1 && groups[0].length === 1 && groups[0][0].name === "card") return card(groups[0][0].amount);

  // Cada grupo es un bloque de filas de 5; los grupos van uno al lado del otro.
  const blocks = groups.map((items) => {
    const icons = items.flatMap(({ name, amount }) => Array.from({ length: amount }, () => name));
    const cols = Math.min(PER_ROW, Math.max(1, icons.length));
    const rows = Math.max(1, Math.ceil(icons.length / PER_ROW));
    return { icons, width: cols * CELL, height: rows * CELL };
  });
  const height = Math.max(...blocks.map((b) => b.height));
  const width = blocks.reduce((sum, b) => sum + b.width, 0) + PLUS * (blocks.length - 1);

  let x = PAD;
  const parts = [];
  blocks.forEach((block, index) => {
    const top = PAD + (height - block.height) / 2;
    block.icons.forEach((name, i) => {
      const cx = x + (i % PER_ROW) * CELL;
      const cy = top + Math.floor(i / PER_ROW) * CELL;
      parts.push(`<g transform="translate(${cx} ${cy})">${ICONS[name]}</g>`);
    });
    x += block.width;
    if (index < blocks.length - 1) {
      const cy = PAD + height / 2;
      const cx = x + PLUS / 2;
      parts.push(`<path d="M${cx - 18} ${cy}h36M${cx} ${cy - 18}v36" stroke="#5B3FE0" stroke-width="9" stroke-linecap="round"/>`);
      x += PLUS;
    }
  });

  const w = width + PAD * 2;
  const h = height + PAD * 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <rect width="${w}" height="${h}" rx="24" fill="#FFFDF7"/>
  ${parts.join("\n  ")}
</svg>`;
}
