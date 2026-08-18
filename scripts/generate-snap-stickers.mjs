import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const tiers = [
  [1, 40, "المحسود", "#72d7ff"],
  [41, 45, "المحظوظ", "#ffb238"],
  [46, 55, "جديد عالزحمة", "#ff7a50"],
  [56, 70, "مدرك الإشارات", "#ff5a1f"],
  [71, 80, "شيخ المخارج", "#1389ff"],
  [81, 85, "ساكن في الدائري", "#ff7a50"],
  [86, 95, "راعي الهواجيس", "#b99cff"],
  [96, 130, "ضحية الدائري", "#72d7ff"],
  [131, 160, "خوي المحطات", "#ffb238"],
  [161, 190, "راعي خطوط", "#ff7a50"],
  [191, 220, "الكداد", "#b99cff"],
  [221, 240, "المراثوني", "#ff5a1f"],
];

const output = path.resolve("public/snap-stickers");
await fs.mkdir(output, { recursive: true });
const font = (await fs.readFile(path.resolve("public/fonts/LamaSans-ExtraBold.woff2"))).toString("base64");
const tahmnaLogo = await sharp(path.resolve("public/tahmna-logo.svg")).resize({ width: 210, height: 150, fit: "contain" }).png().toBuffer();
const sweaterLogo = await sharp(path.resolve("public/sweater-logo-white.svg")).resize({ width: 260, height: 107, fit: "contain" }).png().toBuffer();
const requestedMinute = Number(process.env.STICKER_MINUTE);
const minutesToRender = Number.isInteger(requestedMinute) && requestedMinute >= 1 && requestedMinute <= 240
  ? [requestedMinute]
  : Array.from({ length: 240 }, (_, index) => index + 1);

for (const minutes of minutesToRender) {
  const [, , name, accent] = tiers.find(([min, max]) => minutes >= min && minutes <= max);
  const rawDays = (minutes * 365) / 1440;
  const days = Math.abs(rawDays - Math.round(rawDays)) < 0.05 ? String(Math.round(rawDays)) : rawDays.toFixed(1);
  const nameSize = name.length > 15 ? 54 : 66;
  const svg = `
  <svg width="1200" height="720" viewBox="0 0 1200 720" xmlns="http://www.w3.org/2000/svg">
    <style>@font-face{font-family:Lama;src:url(data:font/woff2;base64,${font})} text{font-family:Lama,Arial,sans-serif}</style>
    <defs>
      <filter id="shadow"><feDropShadow dx="0" dy="14" stdDeviation="10" flood-opacity=".30"/></filter>
      <clipPath id="inner"><rect x="34" y="30" width="1132" height="650" rx="64"/></clipPath>
    </defs>
    <rect x="18" y="14" width="1164" height="684" rx="84" fill="#171512" filter="url(#shadow)"/>
    <rect x="34" y="30" width="1132" height="650" rx="64" fill="#fff8ea" stroke="#171512" stroke-width="6"/>
    <g clip-path="url(#inner)">
      <rect x="34" y="30" width="1132" height="138" fill="#ff5a1f"/>
      <circle cx="1028" cy="408" r="320" fill="${accent}" opacity=".11"/>
      <path d="M34 568h1132v112H34z" fill="${accent}"/>
    </g>
    <rect x="920" y="45" width="214" height="108" rx="28" fill="#fff8ea"/>
    <text x="910" y="245" text-anchor="middle" direction="rtl" fill="#171512" font-size="54" font-weight="900">أنا أقضي</text>
    <text x="910" y="323" text-anchor="middle" direction="rtl" fill="#171512" font-size="48" font-weight="900">يوم من سنتي</text>
    <text x="910" y="389" text-anchor="middle" direction="rtl" fill="#171512" font-size="48" font-weight="900">داخل السيارة</text>
    <text x="420" y="430" text-anchor="middle" fill="#ff5a1f" stroke="#171512" stroke-width="4" paint-order="stroke" font-size="248" font-weight="900">${days}</text>
    <text x="420" y="505" text-anchor="middle" direction="rtl" fill="#171512" font-size="43" font-weight="900">يومًا في السنة</text>
    <text x="600" y="640" text-anchor="middle" direction="rtl" fill="#fff" font-size="${nameSize}" font-weight="900">${name}</text>
  </svg>`;
  await sharp(Buffer.from(svg))
    .composite([
      { input: sweaterLogo, left: 70, top: 46 },
      { input: tahmnaLogo, left: 922, top: 24 },
    ])
    .png({ compressionLevel: 9, palette: true })
    .toFile(path.join(output, `result-${minutes}.png`));
}

console.log(`Generated ${minutesToRender.length} personalized Snapchat sticker(s) in ${output}`);
