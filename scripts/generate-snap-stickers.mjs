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
const logo = await sharp(path.resolve("public/tahmna-logo.svg")).resize({ width: 280, height: 200, fit: "contain" }).png().toBuffer();

for (let minutes = 1; minutes <= 240; minutes += 1) {
  const [, , name, accent] = tiers.find(([min, max]) => minutes >= min && minutes <= max);
  const rawDays = (minutes * 365) / 1440;
  const days = Math.abs(rawDays - Math.round(rawDays)) < 0.05 ? String(Math.round(rawDays)) : rawDays.toFixed(1);
  const nameSize = name.length > 15 ? 26 : 30;
  const svg = `
  <svg width="1000" height="1000" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
    <style>@font-face{font-family:Lama;src:url(data:font/woff2;base64,${font})} text{font-family:Lama,Arial,sans-serif}</style>
    <defs><filter id="shadow"><feDropShadow dx="0" dy="8" stdDeviation="5" flood-opacity=".28"/></filter></defs>
    <rect x="14" y="12" width="372" height="372" rx="64" fill="#171512" filter="url(#shadow)"/>
    <rect x="22" y="20" width="356" height="356" rx="56" fill="#fff8ea" stroke="${accent}" stroke-width="8"/>
    <path d="M22 286h356v34c0 31-25 56-56 56H78c-31 0-56-25-56-56z" fill="${accent}"/>
    <rect x="50" y="38" width="300" height="45" rx="23" fill="#171512"/>
    <text x="200" y="67" text-anchor="middle" direction="rtl" fill="#fff8ea" font-size="16" font-weight="900">تحدي وقت السيارة</text>
    <text x="120" y="129" text-anchor="middle" direction="rtl" fill="#171512" font-size="18" font-weight="900">أنا أقضي</text>
    <text x="200" y="229" text-anchor="middle" fill="#ff5a1f" font-size="112" font-weight="900">${days}</text>
    <text x="200" y="267" text-anchor="middle" direction="rtl" fill="#171512" font-size="21" font-weight="900">يوم من سنتي داخل السيارة</text>
    <text x="200" y="320" text-anchor="middle" direction="rtl" fill="#fff" font-size="${nameSize}" font-weight="900">${name}</text>
    <text x="200" y="351" text-anchor="middle" direction="rtl" fill="#171512" font-size="16" font-weight="900">كم تطلع نتيجتك؟  #سيارتك_تهمنا</text>
  </svg>`;
  await sharp(Buffer.from(svg))
    .composite([{ input: logo, left: 630, top: 220 }])
    .png({ compressionLevel: 9, palette: true })
    .toFile(path.join(output, `result-${minutes}.png`));
}

console.log(`Generated 240 personalized Snapchat stickers in ${output}`);
