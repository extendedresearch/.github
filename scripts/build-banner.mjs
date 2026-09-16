// Generates profile/assets/banner.svg: wordmark, label, and four synthetic signal traces.
import { writeFileSync } from "node:fs";

const W = 1280, H = 400;
const ink = "#0E1013", surface = "#1B1E23", secondary = "#B2B8C2", paper = "#F3F2EE";
const citrus = "#C8F522", coral = "#FF8066", pink = "#F551A4", iris = "#9877FF", sky = "#26BFFF";

// Deterministic pseudo-random so the file is reproducible.
let seed = 7;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) - 0.5;

const x0 = 64, x1 = W - 64, top = 176, row = 50, amp = 16;
const path = (fn, step) => {
  let d = "";
  for (let x = x0; x <= x1; x += step) d += `${d ? "L" : "M"}${x} ${fn(x).toFixed(1)}`;
  return d;
};

const traces = [
  // Stepped: event codes / state changes.
  { c: sky, fn: (() => { const lv = [0, -0.8, 0.6, -0.2, 0.9, -0.6, 0.3, -0.9, 0.5]; return x => lv[Math.floor((x - x0) / 128) % lv.length] * amp + rand() * 2; })(), step: 6 },
  // Noisy oscillation: EEG-like.
  { c: iris, fn: x => (Math.sin(x / 11) * 0.55 + Math.sin(x / 4.3) * 0.2 + rand() * 0.5) * amp, step: 3 },
  // Periodic pulse: cardiac-like.
  { c: pink, fn: x => { const p = ((x - x0) % 118) / 118; return (p < 0.08 ? -Math.sin(p / 0.08 * Math.PI) * 1.4 : p < 0.2 ? Math.sin((p - 0.08) / 0.12 * Math.PI) * 0.35 : 0) * amp + amp * 0.5; }, step: 2 },
  // Slow wave: motion / breathing.
  { c: coral, fn: x => (Math.sin(x / 58) * 0.8 + Math.sin(x / 23) * 0.15) * amp, step: 4 },
];

const cursor = 832;
const lines = traces.map((t, i) => {
  const y = top + i * row;
  return `<path d="${path(x => y + t.fn(x), t.step)}" stroke="${t.c}" />`;
}).join("\n    ");

const dots = traces.map((t, i) => {
  const y = top + i * row + t.fn(cursor);
  return `<circle cx="${cursor}" cy="${y.toFixed(1)}" r="5" fill="${t.c}" stroke="${ink}" stroke-width="2"/>`;
}).join("\n  ");

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-labelledby="t d">
  <title id="t">Extended Research.</title>
  <desc id="d">Wordmark and the label "Open infrastructure for the science of brains and behaviour" above four synthetic signal traces. The traces are illustrative, not recorded data.</desc>
  <defs>
    <clipPath id="recorded"><rect x="0" y="0" width="${cursor}" height="${H}"/></clipPath>
    <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse"><path d="M32 0H0V32" fill="none" stroke="${surface}" stroke-width="1"/></pattern>
  </defs>
  <rect width="${W}" height="${H}" rx="16" fill="${ink}"/>
  <rect x="1" y="120" width="${W - 2}" height="${H - 121}" fill="url(#grid)" opacity="0.7"/>
  <text x="64" y="84" fill="${paper}" font-family="Arial, Helvetica, sans-serif" font-size="48" font-weight="700" letter-spacing="-1.9">Extended Research<tspan fill="${citrus}">.</tspan></text>
  <text x="${W - 64}" y="80" text-anchor="end" fill="${secondary}" font-family="Consolas, 'Liberation Mono', Menlo, monospace" font-size="15" letter-spacing="1.2">OPEN INFRASTRUCTURE FOR THE SCIENCE OF BRAINS AND BEHAVIOUR</text>
  <line x1="64" y1="120" x2="${W - 64}" y2="120" stroke="${surface}" stroke-width="2"/>
  <g fill="none" stroke-width="2" stroke-linejoin="round" opacity="0.28">
    ${lines}
  </g>
  <g fill="none" stroke-width="2" stroke-linejoin="round" clip-path="url(#recorded)">
    ${lines}
  </g>
  <line x1="${cursor}" y1="140" x2="${cursor}" y2="${H - 36}" stroke="${paper}" stroke-width="1.5" opacity="0.6"/>
  ${dots}
</svg>
`;

writeFileSync(new URL("../profile/assets/banner.svg", import.meta.url), svg);
console.log(`wrote ${svg.length} bytes`);
