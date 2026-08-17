export type ResultTier = {
  id: string;
  min: number;
  max: number;
  name: string;
  message: string;
  image: string;
  emoji: string;
  accent: string;
  alt: string;
};

export const campaignConfig = {
  brand: {
    name: "سويتر",
    campaign: "تهمنا",
    hashtag: "#سيارتك_تهمنا",
  },
  colors: {
    orange: "#ff5a1f",
    accent: "#1389ff",
    ink: "#171512",
    cream: "#fff8ea",
  },
  calculator: {
    min: 1,
    max: 240,
    step: 1,
    defaultValue: 67,
  },
  shareUrl: "https://sweater.sa/tahmna",
  bookingUrl: "https://sweater.sa/",
  fallbackDiscount: {
    code: "TAHMNA-DEMO",
    value: "خصم 20٪",
    expiresAt: "31 ديسمبر 2026",
    terms: "على أول حجز عبر سويتر، بحد أقصى 30 ر.س.",
  },
  tiers: [
    {
      id: "meme-tier-1",
      min: 1,
      max: 40,
      name: "المحسود",
      message: "ترا كل أهل الرياض حاسدينك.",
      image: "/memes/meme-tier-1.webp",
      emoji: "👋",
      accent: "#72d7ff",
      alt: "صورة تعبيرية لشخصية المحسود",
    },
    {
      id: "meme-tier-3",
      min: 41,
      max: 45,
      name: "المحظوظ",
      message: "ساكن جنب كل شيء.",
      image: "/memes/meme-tier-3.webp",
      emoji: "⚡",
      accent: "#ffb238",
      alt: "صورة تعبيرية لشخصية المحظوظ",
    },
    {
      id: "meme-tier-4",
      min: 46,
      max: 55,
      name: "جديد عالزحمة",
      message: "توك ما شفت شيء.",
      image: "/memes/meme-tier-4.webp",
      emoji: "🚦",
      accent: "#ff7a50",
      alt: "صورة تعبيرية لشخصية جديد عالزحمة",
    },
    {
      id: "meme-tier-6",
      min: 56,
      max: 70,
      name: "مدرك الإشارات",
      message: "حافظ كل إشارة في دربك.",
      image: "/memes/meme-tier-6.webp",
      emoji: "😎",
      accent: "#ff5a1f",
      alt: "صورة تعبيرية لشخصية مدرك الإشارات",
    },
    {
      id: "meme-tier-8",
      min: 71,
      max: 80,
      name: "شيخ المخارج",
      message: "ما بقى اختصار ما جربته.",
      image: "/memes/meme-tier-8.webp",
      emoji: "📦",
      accent: "#1389ff",
      alt: "صورة تعبيرية لشخصية شيخ المخارج",
    },
    {
      id: "meme-tier-10",
      min: 81,
      max: 85,
      name: "ساكن في الدائري",
      message: "مصبح ممسي في الدائري.",
      image: "/memes/meme-tier-10.webp",
      emoji: "📋",
      accent: "#ff7a50",
      alt: "صورة تعبيرية لشخصية ساكن في الدائري",
    },
    {
      id: "meme-tier-11",
      min: 86,
      max: 95,
      name: "راعي الهواجيس",
      message: "فكرة رايحة وفكرة جاية وأنت للحين ما وصلت.",
      image: "/memes/meme-tier-11.webp",
      emoji: "🚗",
      accent: "#b99cff",
      alt: "صورة تعبيرية لشخصية راعي الهواجيس",
    },
    {
      id: "meme-tier-13",
      min: 96,
      max: 130,
      name: "ضحية الدائري",
      message: "لا وصلت بدري ولا رجعت.",
      image: "/memes/meme-tier-13.webp",
      emoji: "💼",
      accent: "#72d7ff",
      alt: "صورة تعبيرية لشخصية ضحية الدائري",
    },
    {
      id: "meme-tier-15",
      min: 131,
      max: 160,
      name: "خوي المحطات",
      message: "فلوسك راحت على البنزين.",
      image: "/memes/meme-tier-15.webp",
      emoji: "🔑",
      accent: "#ffb238",
      alt: "صورة تعبيرية لشخصية خوي المحطات",
    },
    {
      id: "meme-tier-16",
      min: 161,
      max: 190,
      name: "راعي خطوط",
      message: "يبي لك تحسن علاقتك مع الناس.",
      image: "/memes/meme-tier-16.webp",
      emoji: "🛋️",
      accent: "#ff7a50",
      alt: "صورة تعبيرية لشخصية راعي خطوط",
    },
    {
      id: "meme-tier-17",
      min: 191,
      max: 220,
      name: "الكداد",
      message: "يبي لك تغير زيت كل مشوار.",
      image: "/memes/meme-tier-17.webp",
      emoji: "🏠",
      accent: "#b99cff",
      alt: "صورة تعبيرية لشخصية الكداد",
    },
    {
      id: "meme-tier-18",
      min: 221,
      max: 240,
      name: "المراثوني",
      message: "ماخذ الدائري ماراثون رايح جاي.",
      image: "/memes/meme-tier-18.webp",
      emoji: "👑",
      accent: "#ff5a1f",
      alt: "صورة تعبيرية لشخصية المراثوني",
    },
  ] satisfies ResultTier[],
};

export const getTier = (minutes: number) =>
  campaignConfig.tiers.find((tier) => minutes >= tier.min && minutes <= tier.max) ??
  campaignConfig.tiers[campaignConfig.tiers.length - 1];
