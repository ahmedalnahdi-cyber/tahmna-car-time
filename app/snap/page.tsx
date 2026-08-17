import type { Metadata } from "next";
import Link from "next/link";
import { campaignConfig } from "../../lib/campaign-config";

type SnapSearchParams = Promise<{ name?: string; days?: string; tier?: string }>;

const clean = (value: string | undefined, fallback: string, max = 48) =>
  (value ?? fallback).replace(/[<>]/g, "").trim().slice(0, max) || fallback;

export async function generateMetadata({ searchParams }: { searchParams: SnapSearchParams }): Promise<Metadata> {
  const params = await searchParams;
  const name = clean(params.name, "صاحب البطاقة", 28);
  const days = clean(params.days, "؟", 8);
  const tier = clean(params.tier, "شخصية تهمنا");
  const title = `${name} يقضي ${days} يوم داخل السيارة!`;
  const description = `شخصيته: ${tier}. اكتشف بطاقتك أنت في حاسبة تهمنا من سويتر.`;
  const tierId = campaignConfig.tiers.find((item) => item.name === tier)?.id ?? campaignConfig.tiers[0].id;
  const sticker = `https://tahmna-car-time.a7medalnahdi.chatgpt.site/snap-stickers/${tierId}.png`;

  return {
    title,
    description,
    openGraph: { title, description, siteName: "تهمنا من سويتر", locale: "ar_SA", type: "website", images: [] },
    twitter: { card: "summary", title, description, images: [] },
    alternates: { canonical: "/snap" },
    other: { "snapchat:sticker": sticker },
  };
}

export default async function SnapResultPage({ searchParams }: { searchParams: SnapSearchParams }) {
  const params = await searchParams;
  const name = clean(params.name, "صاحب البطاقة", 28);
  const days = clean(params.days, "؟", 8);
  const tier = clean(params.tier, "شخصية تهمنا");

  return (
    <main className="snap-landing" dir="rtl">
      <section>
        <img src="/tahmna-logo.svg" alt="تهمنا" width="170" height="120" />
        <span>بطاقة وقت السيارة</span>
        <h1>{name} يقضي <strong>{days}</strong> يوم داخل السيارة!</h1>
        <p>شخصيته: <b>{tier}</b></p>
        <Link href="/">اكتشف بطاقتك أنت <i aria-hidden="true">←</i></Link>
      </section>
    </main>
  );
}
