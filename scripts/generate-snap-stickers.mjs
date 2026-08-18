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
const tahmnaLogo = await sharp(path.resolve("public/tahmna-logo.svg")).resize({ width: 88, height: 58, fit: "contain" }).png().toBuffer();
const sweaterLogo = await sharp(path.resolve("public/sweater-logo-white.svg")).resize({ width: 92, height: 38, fit: "contain" }).png().toBuffer();
const requestedMinute = Number(process.env.STICKER_MINUTE);
const minutesToRender = Number.isInteger(requestedMinute) && requestedMinute >= 1 && requestedMinute <= 240
  ? [requestedMinute]
  : Array.from({ length: 240 }, (_, index) => index + 1);

for (const minutes of minutesToRender) {
  const [, , name, accent] = tiers.find(([min, max]) => minutes >= min && minutes <= max);
  const rawDays = (minutes * 365) / 1440;
  const days = Math.abs(rawDays - Math.round(rawDays)) < 0.05 ? String(Math.round(rawDays)) : rawDays.toFixed(1);
  const nameSize = name.length > 15 ? 28 : 34;
  const svg = `
  <svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
    <style>@font-face{font-family:Lama;src:url(data:font/woff2;base64,${font})} text{font-family:Lama,Arial,sans-serif}</style>
    <defs>
      <filter id="shadow"><feDropShadow dx="0" dy="7" stdDeviation="5" flood-opacity=".34"/></filter>
      <clipPath id="inner"><rect x="12" y="10" width="376" height="374" rx="54"/></clipPath>
    </defs>
    <rect x="7" y="5" width="386" height="386" rx="61" fill="#171512" filter="url(#shadow)"/>
    <rect x="12" y="10" width="376" height="374" rx="54" fill="#fff8ea" stroke="#171512" stroke-width="5"/>
    <g clip-path="url(#inner)">
      <rect x="12" y="10" width="376" height="78" fill="#ff5a1f"/>
      <circle cx="335" cy="216" r="150" fill="${accent}" opacity=".12"/>
      <circle cx="54" cy="260" r="74" fill="#ff5a1f" opacity=".08"/>
      <path d="M12 318h376v66H12z" fill="${accent}"/>
    </g>
    <rect x="22" y="20" width="102" height="58" rx="18" fill="#fff8ea"/>
    <rect x="278" y="25" width="100" height="48" rx="16" fill="#171512"/>
    <text x="200" y="124" text-anchor="middle" direction="rtl" fill="#171512" font-size="24" font-weight="900">وقتي داخل السيارة</text>
    <text x="200" y="244" text-anchor="middle" fill="#ff5a1f" stroke="#171512" stroke-width="3" paint-order="stroke" font-size="118" font-weight="900">${days}</text>
    <text x="200" y="285" text-anchor="middle" direction="rtl" fill="#171512" font-size="27" font-weight="900">يوم في السنة</text>
    <text x="200" y="363" text-anchor="middle" direction="rtl" fill="#fff" font-size="${nameSize}" font-weight="900">${name}</text>
  </svg>`;
  await sharp(Buffer.from(svg))
    .composite([
      { input: tahmnaLogo, left: 29, top: 20 },
      { input: sweaterLogo, left: 282, top: 30 },
    ])
    .png({ compressionLevel: 9, palette: true })
    .toFile(path.join(output, `result-${minutes}.png`));
}

console.log(`Generated ${minutesToRender.length} personalized Snapchat sticker(s) in ${output}`);
