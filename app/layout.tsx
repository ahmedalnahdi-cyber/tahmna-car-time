import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

const title = "حاسبة وقتك في السيارة | تهمنا من سويتر";
const description = "احسب كم يومًا من سنتك تقضيه داخل السيارة، واكتشف شخصيتك وخذ كود خصم من سويتر.";

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const image = `${protocol}://${host}/og-tahmna.png`;

  return {
    title,
    description,
    openGraph: { title, description, siteName: "تهمنا من سويتر", locale: "ar_SA", type: "website", images: [{ url: image, width: 1734, height: 907, alt: "كم يومًا في السنة تقضيه داخل سيارتك؟" }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-4FR2S86GJY" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer = window.dataLayer || [];
window.gtag = window.gtag || function(){window.dataLayer.push(arguments);};
window.gtag('js', new Date());
window.gtag('config', 'G-4FR2S86GJY', { send_page_view: true });`,
          }}
        />
        <script
          type="module"
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token":"5f2957c3429742479898308420beaa1e"}'
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
