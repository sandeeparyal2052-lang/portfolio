const fs = require("fs");
const path = require("path");

const outDir = path.join(__dirname, "..", "images", "hero-bg");
fs.mkdirSync(outDir, { recursive: true });

const NAVY = "#0e1b29";
const LINE = "#5c93be";
const LINE_DIM = "#2e6e9e";
const SIGNAL = "#d9622b";

function grid(w, h, step, opacity) {
  const lines = [];
  for (let x = 0; x <= w; x += step) lines.push(`<line x1="${x}" y1="0" x2="${x}" y2="${h}" />`);
  for (let y = 0; y <= h; y += step) lines.push(`<line x1="0" y1="${y}" x2="${w}" y2="${y}" />`);
  return `<g stroke="${LINE}" stroke-width="1" opacity="${opacity}">${lines.join("")}</g>`;
}

// 1) Construction site: crane + rising building frame
function craneScene(w, h) {
  return `
  ${grid(w, h, 40, 0.12)}
  <g stroke="${LINE}" stroke-width="2" fill="none" opacity="0.55">
    <!-- crane mast -->
    <line x1="260" y1="${h - 40}" x2="260" y2="120" />
    <line x1="260" y1="120" x2="620" y2="120" />
    <line x1="260" y1="120" x2="140" y2="160" />
    <line x1="260" y1="160" x2="300" y2="120" />
    <line x1="260" y1="200" x2="330" y2="120" />
    <line x1="260" y1="240" x2="360" y2="120" />
    <!-- hook line -->
    <line x1="560" y1="120" x2="560" y2="280" stroke-dasharray="4 6" />
    <rect x="540" y="280" width="40" height="24" />
    <!-- building frame (columns + beams) -->
    <g stroke="${LINE_DIM}">
      <line x1="700" y1="${h - 40}" x2="700" y2="200" />
      <line x1="820" y1="${h - 40}" x2="820" y2="160" />
      <line x1="940" y1="${h - 40}" x2="940" y2="200" />
      <line x1="1060" y1="${h - 40}" x2="1060" y2="240" />
      <line x1="700" y1="200" x2="1060" y2="240" />
      <line x1="700" y1="320" x2="1060" y2="360" />
      <line x1="700" y1="440" x2="1060" y2="480" />
      <line x1="700" y1="320" x2="700" y2="440" />
      <line x1="820" y1="280" x2="820" y2="400" />
      <line x1="940" y1="300" x2="940" y2="420" />
    </g>
  </g>
  <g stroke="${SIGNAL}" stroke-width="1.5" opacity="0.5">
    <line x1="700" y1="${h - 20}" x2="1060" y2="${h - 20}" />
    <line x1="700" y1="${h - 26}" x2="700" y2="${h - 14}" />
    <line x1="1060" y1="${h - 26}" x2="1060" y2="${h - 14}" />
  </g>`;
}

// 2) Deck / patio structural framing line diagram
function deckFramingScene(w, h) {
  const joists = [];
  for (let x = 280; x <= 1100; x += 60) {
    joists.push(`<line x1="${x}" y1="380" x2="${x}" y2="620" />`);
  }
  return `
  ${grid(w, h, 40, 0.12)}
  <g stroke="${LINE}" stroke-width="1.6" opacity="0.55">
    <rect x="280" y="380" width="820" height="240" fill="none" />
    ${joists.join("")}
    <line x1="280" y1="380" x2="1100" y2="380" stroke-width="2.4" />
    <line x1="280" y1="620" x2="1100" y2="620" stroke-width="2.4" />
  </g>
  <g stroke="${LINE_DIM}" stroke-width="2" opacity="0.6">
    <line x1="320" y1="620" x2="320" y2="760" />
    <line x1="560" y1="620" x2="560" y2="760" />
    <line x1="800" y1="620" x2="800" y2="760" />
    <line x1="1040" y1="620" x2="1040" y2="760" />
  </g>
  <g stroke="${SIGNAL}" stroke-width="1.5" opacity="0.55">
    <line x1="280" y1="340" x2="1100" y2="340" />
    <line x1="280" y1="330" x2="280" y2="350" />
    <line x1="1100" y1="330" x2="1100" y2="350" />
  </g>`;
}

// 3) Structural elevation / framing line diagram
function elevationScene(w, h) {
  const cols = [];
  for (let x = 260; x <= 1180; x += 115) {
    cols.push(`<line x1="${x}" y1="180" x2="${x}" y2="640" />`);
  }
  const beams = [220, 320, 420, 520].map(
    (y) => `<line x1="260" y1="${y}" x2="1180" y2="${y}" />`
  );
  return `
  ${grid(w, h, 40, 0.12)}
  <g stroke="${LINE}" stroke-width="1.6" opacity="0.55">
    ${cols.join("")}
    ${beams.join("")}
  </g>
  <g stroke="${SIGNAL}" stroke-width="1.4" opacity="0.45">
    <circle cx="260" cy="180" r="5" fill="none" />
    <circle cx="1180" cy="180" r="5" fill="none" />
    <circle cx="260" cy="640" r="5" fill="none" />
    <circle cx="1180" cy="640" r="5" fill="none" />
  </g>`;
}

// 4) Foundation / floor plan with dimension lines
function planScene(w, h) {
  return `
  ${grid(w, h, 40, 0.12)}
  <g stroke="${LINE}" stroke-width="1.8" opacity="0.55">
    <rect x="300" y="220" width="760" height="460" fill="none" />
    <line x1="300" y1="420" x2="1060" y2="420" />
    <line x1="620" y1="220" x2="620" y2="680" />
  </g>
  <g stroke="${LINE_DIM}" stroke-width="1.2" opacity="0.45">
    <line x1="300" y1="160" x2="1060" y2="160" />
    <line x1="300" y1="150" x2="300" y2="170" />
    <line x1="1060" y1="150" x2="1060" y2="170" />
    <line x1="1120" y1="220" x2="1120" y2="680" />
    <line x1="1110" y1="220" x2="1130" y2="220" />
    <line x1="1110" y1="680" x2="1130" y2="680" />
  </g>
  <g stroke="${SIGNAL}" stroke-width="1.4" opacity="0.45">
    <circle cx="300" cy="220" r="4" fill="none" />
    <circle cx="1060" cy="220" r="4" fill="none" />
    <circle cx="300" cy="680" r="4" fill="none" />
    <circle cx="1060" cy="680" r="4" fill="none" />
  </g>`;
}

const scenes = [
  { file: "site-crane.svg", build: craneScene },
  { file: "deck-framing.svg", build: deckFramingScene },
  { file: "elevation-diagram.svg", build: elevationScene },
  { file: "foundation-plan.svg", build: planScene }
];

const W = 1600;
const H = 900;

for (const scene of scenes) {
  const svg = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="${NAVY}" />
  ${scene.build(W, H)}
</svg>`;
  fs.writeFileSync(path.join(outDir, scene.file), svg);
}

console.log(`Generated ${scenes.length} hero background scenes in ${outDir}`);
