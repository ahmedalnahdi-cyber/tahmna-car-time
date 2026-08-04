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
    max: 360,
    step: 5,
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
      max: 20,
      name: "الضيف الخفيف",
      message: "سيارتك للحين ما لحقت تحفظ اسمك.",
      image: "/memes/meme-tier-1.webp",
      emoji: "👋",
      accent: "#72d7ff",
      alt: "صورة تعبيرية لشخصية الضيف الخفيف",
    },
    {
      id: "meme-tier-2",
      min: 21,
      max: 45,
      name: "راعي المشاوير الخفيفة",
      message: "مشوارين وترجع… وضعك للحين بالسليم.",
      image: "/memes/meme-tier-2.webp",
      emoji: "😌",
      accent: "#1389ff",
      alt: "صورة تعبيرية لشخصية راعي المشاوير الخفيفة",
    },
    {
      id: "meme-tier-3",
      min: 46,
      max: 75,
      name: "ابن الطريق",
      message: "واضح إن السيارة جزء رسمي من جدولك اليومي.",
      image: "/memes/meme-tier-3.webp",
      emoji: "😎",
      accent: "#ffb238",
      alt: "صورة تعبيرية لشخصية ابن الطريق",
    },
    {
      id: "meme-tier-4",
      min: 76,
      max: 120,
      name: "موظف السيارة",
      message: "أنت والسيارة بينكم دوام رسمي وعقد غير مكتوب.",
      image: "/memes/meme-tier-4.webp",
      emoji: "🫡",
      accent: "#ff7a50",
      alt: "صورة تعبيرية لشخصية موظف السيارة",
    },
    {
      id: "meme-tier-5",
      min: 121,
      max: 180,
      name: "ساكن على الطريق",
      message: "سلامات… تنام في السيارة أنت؟",
      image: "/memes/meme-tier-5.webp",
      emoji: "😴",
      accent: "#b99cff",
      alt: "صورة تعبيرية لشخصية ساكن على الطريق",
    },
    {
      id: "meme-tier-6",
      min: 181,
      max: Number.POSITIVE_INFINITY,
      name: "مالك العقار",
      message: "خلاص، نطلع لك صك على السيارة؟",
      image: "/memes/meme-tier-6.webp",
      emoji: "🏠",
      accent: "#ff5a1f",
      alt: "صورة تعبيرية لشخصية مالك العقار",
    },
  ] satisfies ResultTier[],
};

export const getTier = (minutes: number) =>
  campaignConfig.tiers.find((tier) => minutes >= tier.min && minutes <= tier.max) ??
  campaignConfig.tiers[campaignConfig.tiers.length - 1];
