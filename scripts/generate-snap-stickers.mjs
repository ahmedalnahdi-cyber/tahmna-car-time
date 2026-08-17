import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const tiers = [
  ["meme-tier-1", "المحسود", "#72d7ff"],
  ["meme-tier-2", "راعي المشاوير الخفيفة", "#1389ff"],
  ["meme-tier-3", "المحظوظ", "#ffb238"],
  ["meme-tier-4", "جديد عالزحمة", "#ff7a50"],
  ["meme-tier-6", "مدرك الإشارات", "#ff5a1f"],
  ["meme-tier-7", "صاحب الخط", "#72d7ff"],
  ["meme-tier-8", "شيخ المخارج", "#1389ff"],
  ["meme-tier-9", "موظف السيارة", "#ffb238"],
  ["meme-tier-10", "ساكن في الدائري", "#ff7a50"],
  ["meme-tier-11", "راعي الهواجيس", "#b99cff"],
  ["meme-tier-12", "راعي المسار الطويل", "#ff5a1f"],
  ["meme-tier-13", "ضحية الدائري", "#72d7ff"],
  ["meme-tier-14", "ساكن على الطريق", "#1389ff"],
  ["meme-tier-15", "خوي المحطات", "#ffb238"],
  ["meme-tier-16", "راعي خطوط", "#ff7a50"],
  ["meme-tier-17", "الكداد", "#b99cff"],
  ["meme-tier-18", "المراثوني", "#ff5a1f"],
];

const output = path.resolve("public/snap-stickers");
await fs.mkdir(output, { recursive: true });
const font = (await fs.readFile(path.resolve("public/fonts/LamaSans-ExtraBold.woff2"))).toString("base64");
const logo = await sharp(path.resolve("public/tahmna-logo.svg")).resize({ width: 112, height: 80, fit: "contain" }).png().toBuffer();

for (const [id, name, accent] of tiers) {
  const fontSize = name.length > 19 ? 35 : name.length > 14 ? 40 : 46;
  const svg = `
  <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
    <style>@font-face{font-family:Lama;src:url(data:font/woff2;base64,${font})} text{font-family:Lama,Arial,sans-serif}</style>
    <defs><filter id="shadow"><feDropShadow dx="0" dy="8" stdDeviation="5" flood-opacity=".28"/></filter></defs>
    <rect x="16" y="13" width="368" height="368" rx="58" fill="#171512" filter="url(#shadow)"/>
    <rect x="24" y="21" width="352" height="352" rx="51" fill="#fff8ea" stroke="${accent}" stroke-width="8"/>
    <path d="M24 267h352v55c0 28-23 51-51 51H75c-28 0-51-23-51-51z" fill="${accent}"/>
    <rect x="55" y="38" width="290" height="52" rx="26" fill="#171512"/>
    <text x="200" y="71" text-anchor="middle" direction="rtl" fill="#fff8ea" font-size="19" font-weight="900">بطاقة وقت السيارة</text>
    <text x="200" y="189" text-anchor="middle" direction="rtl" fill="#171512" font-size="21" font-weight="900">شخصيتك هي</text>
    <text x="200" y="246" text-anchor="middle" direction="rtl" fill="#171512" font-size="${fontSize}" font-weight="900">${name}</text>
    <text x="200" y="307" text-anchor="middle" direction="rtl" fill="#fff" font-size="17" font-weight="900">اكتشف كم يوم تقضي داخل سيارتك</text>
    <text x="200" y="344" text-anchor="middle" direction="rtl" fill="#171512" font-size="18" font-weight="900">#سيارتك_تهمنا</text>
  </svg>`;
  await sharp(Buffer.from(svg))
    .composite([{ input: logo, left: 144, top: 94 }])
    .png({ compressionLevel: 9, palette: true })
    .toFile(path.join(output, `${id}.png`));
}

console.log(`Generated ${tiers.length} Snapchat stickers in ${output}`);
