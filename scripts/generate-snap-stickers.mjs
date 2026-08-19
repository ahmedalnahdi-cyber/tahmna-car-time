import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import QRCode from "qrcode";

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

const tierIds = ["meme-tier-1", "meme-tier-3", "meme-tier-4", "meme-tier-6", "meme-tier-8", "meme-tier-10", "meme-tier-11", "meme-tier-13", "meme-tier-15", "meme-tier-16", "meme-tier-17", "meme-tier-18"];
const qrDataUrl = await QRCode.toDataURL("https://game.sweater.sa", { width: 180, margin: 1, color: { dark: "#171512", light: "#fff8ea" } });

for (const minutes of minutesToRender) {
  const tierIndex = tiers.findIndex(([min, max]) => minutes >= min && minutes <= max);
  const [, , name, accent, message] = tiers[tierIndex];
  const meme = (await fs.readFile(path.join(output, `${tierIds[tierIndex]}.png`))).toString("base64");
  const rawDays = (minutes * 365) / 1440;
  const days = Math.abs(rawDays - Math.round(rawDays)) < 0.05 ? String(Math.round(rawDays)) : rawDays.toFixed(1);
  const numericDays = Number(days);
  const dayUnit = numericDays === 2 ? "يومين" : numericDays >= 3 && numericDays <= 10 ? "أيام" : "يوم";
  const nameSize = name.length > 15 ? 52 : 62;
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
      <filter id="shadow"><feDropShadow dx="14" dy="18" stdDeviation="0" flood-color="${accent}"/></filter>
      <radialGradient id="glow" cx="0" cy="0" r="1" gradientTransform="translate(880 160) rotate(135) scale(690)">
        <stop stop-color="${accent}" stop-opacity=".48"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/>
      </radialGradient>
      <pattern id="dots" width="40" height="40" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="2" fill="#fff8ea" opacity=".13"/></pattern>
      <clipPath id="meme"><rect x="82" y="238" width="916" height="430" rx="42"/></clipPath>
      <linearGradient id="shade" x1="0" y1="0" x2="0" y2="1"><stop offset=".45" stop-opacity="0"/><stop offset="1" stop-opacity=".88"/></linearGradient>
    </defs>
    <rect x="36" y="28" width="990" height="1276" rx="72" fill="#171512" filter="url(#shadow)"/>
    <rect x="36" y="28" width="990" height="1276" rx="72" fill="url(#glow)"/>
    <rect x="36" y="28" width="990" height="1276" rx="72" fill="url(#dots)" stroke="#ff5a1f" stroke-width="8"/>
    <rect x="600" y="68" width="190" height="132" rx="28" fill="#fff8ea"/>
    <path d="M540 82v102" stroke="#fff8ea" stroke-opacity=".28" stroke-width="2"/>
    <image href="data:image/png;base64,${meme}" x="82" y="238" width="916" height="430" preserveAspectRatio="xMidYMid slice" clip-path="url(#meme)"/>
    <rect x="82" y="238" width="916" height="430" rx="42" fill="url(#shade)" stroke="#fff8ea" stroke-width="7"/>
    <text x="540" y="620" text-anchor="middle" direction="rtl" fill="#fff" font-size="${nameSize}" font-weight="900">${name}</text>
    <text x="540" y="753" text-anchor="middle" direction="rtl" fill="#fff8ea" font-size="36" font-weight="900">تقضي من سنتك داخل السيارة</text>
    <text x="620" y="930" text-anchor="middle" fill="#ff5a1f" font-size="210" font-weight="900" letter-spacing="-5">${days}</text>
    <text x="355" y="900" text-anchor="middle" direction="rtl" fill="#fff8ea" font-size="48" font-weight="900">${dayUnit}</text>
    <rect x="170" y="970" width="740" height="66" rx="33" fill="${accent}"/>
    <text x="540" y="1015" text-anchor="middle" direction="rtl" fill="#fff" font-size="29" font-weight="900">${minutes} دقيقة يوميًا</text>
    ${messageLines.map((line, index) => `<text x="540" y="${1090 + index * 42}" text-anchor="middle" direction="rtl" fill="#fff8ea" fill-opacity=".76" font-size="29" font-weight="700">${line}</text>`).join("")}
    <rect x="82" y="1172" width="916" height="94" rx="28" fill="#fff8ea"/>
    <image href="${qrDataUrl}" x="892" y="1182" width="74" height="74"/>
    <text x="465" y="1230" text-anchor="middle" direction="rtl" fill="#171512" font-size="30" font-weight="900">اكتشف بطاقتك • #سيارتك_تهمنا</text>
  </svg>`;
  await sharp(Buffer.from(svg))
    .composite([
      { input: tahmnaLogo, left: 590, top: 68 },
      { input: sweaterLogo, left: 285, top: 84 },
    ])
    .png({ compressionLevel: 9, palette: true, quality: 90 })
    .toFile(path.join(output, `result-${minutes}.png`));
}

console.log(`Generated ${minutesToRender.length} personalized Snapchat sticker(s) in ${output}`);
