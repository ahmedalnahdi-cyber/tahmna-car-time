import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const title = "حاسبة وقتك في السيارة | تهمنا من سويتر";
const description = "احسب كم يومًا من سنتك تقضيه داخل السيارة، واكتشف شخصيتك وخذ كود خصم من سويتر.";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const image = `${protocol}://${host}/og.png`;

  return {
    title,
    description,
    openGraph: { title, description, locale: "ar_SA", type: "website", images: [{ url: image, width: 1200, height: 630, alt: "حاسبة وقتك في السيارة من حملة تهمنا" }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
