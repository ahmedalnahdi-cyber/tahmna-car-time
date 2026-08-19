import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const tiers = [
  [1, 40, "المحسود", "#72d7ff", "ترا كل أهل الرياض حاسدينك"],
  [41, 45, "المحظوظ", "#ffb238", "ساكن جنب كل شيء"],
  [46, 55, "جديد عالزحمة", "#ff7a50", "توك ما شفت شيء"],
  [56, 70, "مدرك الإشارات", "#ff5a1f", "حافظ كل إشارة في دربك"],
  [71, 80, "شيخ المخارج", "#1389ff", "ما بقى اختصار ما جربته"],
  [81, 85, "ساكن في الدائري", "#ff7a50", "مصبح ممسي في الدائري"],
  [86, 95, "راعي الهواجيس", "#b99cff", "فكرة رايحة وفكرة جاية وأنت للحين ما وصلت"],
  [96, 130, "ضحية الدائري", "#72d7ff", "لا وصلت بدري ولا رجعت"],
  [131, 160, "خوي المحطات", "#ffb238", "فلوسك راحت على البنزين"],
  [161, 190, "راعي خطوط", "#ff7a50", "يبي لك تحسن علاقتك مع الناس"],
  [191, 220, "الكداد", "#b99cff", "يبي لك تغير زيت كل مشوار"],
  [221, 240, "المراثوني", "#ff5a1f", "ماخذ الدائري ماراثون رايح جاي"],
];

const output = path.resolve("public/snap-stickers");
await fs.mkdir(output, { recursive: true });
const font = (await fs.readFile(path.resolve("public/fonts/LamaSans-ExtraBold.woff2"))).toString("base64");
const tahmnaLogo = await sharp(path.resolve("public/tahmna-logo.svg")).resize({ width: 210, height: 132, fit: "contain" }).png().toBuffer();
const sweaterLogo = await sharp(path.resolve("public/sweater-logo-white.svg")).resize({ width: 230, height: 95, fit: "contain" }).png().toBuffer();
const requestedMinute = Number(process.env.STICKER_MINUTE);
const minutesToRender = Number.isInteger(requestedMinute) && requestedMinute >= 1 && requestedMinute <= 240
  ? [requestedMinute]
  : Array.from({ length: 240 }, (_, index) => index + 1);

for (const minutes of minutesToRender) {
  const [, , name, accent, message] = tiers.find(([min, max]) => minutes >= min && minutes <= max);
  const rawDays = (minutes * 365) / 1440;
  const days = Math.abs(rawDays - Math.round(rawDays)) < 0.05 ? String(Math.round(rawDays)) : rawDays.toFixed(1);
  const numericDays = Number(days);
  const dayUnit = numericDays === 2 ? "يومين" : numericDays >= 3 && numericDays <= 10 ? "أيام" : "يوم";
  const nameSize = name.length > 15 ? 68 : 82;
  const messageWords = message.split(" ");
  const messageLines = messageWords.reduce((lines, word) => {
    const last = lines.at(-1) ?? "";
    if (`${last} ${word}`.trim().length <= 27) lines[lines.length - 1] = `${last} ${word}`.trim();
    else lines.push(word);
    return lines;
  }, [""]).filter(Boolean).slice(0, 2);
  const svg = `
  <svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg">
    <style>@font-face{font-family:Lama;src:url(data:font/woff2;base64,${font})} text{font-family:Lama,Arial,sans-serif}</style>
    <defs>
      <filter id="shadow"><feDropShadow dx="18" dy="22" stdDeviation="0" flood-color="${accent}"/></filter>
      <radialGradient id="glow" cx="0" cy="0" r="1" gradientTransform="translate(880 160) rotate(135) scale(690)">
        <stop stop-color="${accent}" stop-opacity=".48"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/>
      </radialGradient>
      <pattern id="dots" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="2" fill="#fff8ea" opacity=".13"/></pattern>
    </defs>
    <rect x="36" y="28" width="990" height="1276" rx="72" fill="#171512" filter="url(#shadow)"/>
    <rect x="36" y="28" width="990" height="1276" rx="72" fill="url(#glow)"/>
    <rect x="36" y="28" width="990" height="1276" rx="72" fill="url(#dots)" stroke="#fff8ea" stroke-width="6"/>
    <path d="M82 245h916" stroke="#fff8ea" stroke-opacity=".2" stroke-width="2"/>
    <rect x="78" y="72" width="250" height="134" rx="34" fill="#fff8ea"/>
    <rect x="750" y="76" width="228" height="122" rx="30" fill="#ff5a1f"/>
    <text x="540" y="330" text-anchor="middle" direction="rtl" fill="#fff8ea" fill-opacity=".72" font-size="37" font-weight="900">تقضي من سنتك داخل السيارة</text>
    <text x="540" y="650" text-anchor="middle" fill="#ff5a1f" stroke="#fff8ea" stroke-width="6" paint-order="stroke" font-size="330" font-weight="900" letter-spacing="-8">${days}</text>
    <rect x="425" y="695" width="230" height="76" rx="38" fill="${accent}"/>
    <text x="540" y="747" text-anchor="middle" direction="rtl" fill="#171512" font-size="38" font-weight="900">${dayUnit}</text>
    <path d="M100 825h880" stroke="#fff8ea" stroke-opacity=".2" stroke-width="2"/>
    <text x="540" y="900" text-anchor="middle" direction="rtl" fill="${accent}" font-size="32" font-weight="900">شخصيتك</text>
    <text x="540" y="1000" text-anchor="middle" direction="rtl" fill="#fff8ea" font-size="${nameSize}" font-weight="900">${name}</text>
    ${messageLines.map((line, index) => `<text x="540" y="${1075 + index * 55}" text-anchor="middle" direction="rtl" fill="#fff8ea" fill-opacity=".76" font-size="36" font-weight="700">${line}</text>`).join("")}
    <rect x="84" y="1190" width="912" height="78" rx="26" fill="${accent}"/>
    <text x="540" y="1243" text-anchor="middle" direction="rtl" fill="#171512" font-size="35" font-weight="900">${minutes} دقيقة يوميًا  •  بطاقتك من تهمنا</text>
  </svg>`;
  await sharp(Buffer.from(svg))
    .composite([
      { input: tahmnaLogo, left: 98, top: 72 },
      { input: sweaterLogo, left: 748, top: 88 },
    ])
    .png({ compressionLevel: 9, palette: true, quality: 90 })
    .toFile(path.join(output, `result-${minutes}.png`));
}

console.log(`Generated ${minutesToRender.length} personalized Snapchat sticker(s) in ${output}`);
