import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";

type SnapSearchParams = Promise<{ name?: string; days?: string; unit?: string; minutes?: string; tier?: string }>;

const clean = (value: string | undefined, fallback: string, max = 48) =>
  (value ?? fallback).replace(/[<>]/g, "").trim().slice(0, max) || fallback;

export async function generateMetadata({ searchParams }: { searchParams: SnapSearchParams }): Promise<Metadata> {
  const params = await searchParams;
  const days = clean(params.days, "؟", 8);
  const unit = clean(params.unit, "يوم", 8);
  const tier = clean(params.tier, "شخصية تهمنا");
  const title = `شخصية ${tier} تقضي ${days} ${unit} في السنة`;
  const description = `شخصيته: ${tier}. اكتشف بطاقتك أنت في حاسبة تهمنا من سويتر.`;
  return {
    title,
    description,
    openGraph: { title, description, siteName: "تهمنا من سويتر", locale: "ar_SA", type: "website", images: [] },
    twitter: { card: "summary", title, description, images: [] },
    alternates: { canonical: "/snap" },
  };
}

export default async function SnapResultPage({ searchParams }: { searchParams: SnapSearchParams }) {
  const params = await searchParams;
  const requestHeaders = await headers();
  const name = clean(params.name, "صاحب البطاقة", 28);
  const days = clean(params.days, "؟", 8);
  const unit = clean(params.unit, "يوم", 8);
  const tier = clean(params.tier, "شخصية تهمنا");
  const minutes = Math.min(240, Math.max(1, Math.round(Number(params.minutes) || 1)));
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "tahmna-car-time.a7medalnahdi.chatgpt.site";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  const stickerParams = new URLSearchParams({ name, minutes: String(minutes), v: "14" });
  const sticker = `${protocol}://${host}/api/snap-card?${stickerParams.toString()}`;

  return (
    <main className="snap-landing" dir="rtl">
      <meta property="snapchat:sticker" content={sticker} />
      <section>
        <div className="snap-brand" aria-label="تهمنا من سويتر">
          <span className="snap-tahmna-logo"><img src="/tahmna-logo.svg" alt="شعار تهمنا" width="170" height="120" /></span>
          <span className="snap-brand-divider" aria-hidden="true" />
          <img className="snap-sweater-logo" src="/sweater-logo-white.svg" alt="شعار سويتر" width="518" height="213" />
        </div>
        <h1>{name} يقضي <strong>{days}</strong> {unit} داخل السيارة!</h1>
        <p>شخصيته: <b>{tier}</b></p>
        <Link href="/">اكتشف بطاقتك أنت <i aria-hidden="true">←</i></Link>
      </section>
    </main>
  );
}
