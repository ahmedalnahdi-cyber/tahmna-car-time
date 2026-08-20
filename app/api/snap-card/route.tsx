import { ImageResponse } from "next/og";
import { getTier } from "../../../lib/campaign-config";

export const runtime = "edge";
export const dynamic = "force-dynamic";

const formatNumber = (value: number) => {
  const shown = Math.abs(value - Math.round(value)) < 0.05 ? Math.round(value) : Number(value.toFixed(1));
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 }).format(shown);
};

const dayUnit = (value: number) => {
  const shown = Math.abs(value - Math.round(value)) < 0.05 ? Math.round(value) : Number(value.toFixed(1));
  if (shown === 2) return "يومين";
  if (shown >= 3 && shown <= 10) return "أيام";
  return "يوم";
};

const cleanName = (value: string | null) =>
  (value ?? "صاحب البطاقة").replace(/[<>]/g, "").trim().replace(/\s+/g, " ").slice(0, 20) || "صاحب البطاقة";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const minutes = Math.min(240, Math.max(1, Math.round(Number(url.searchParams.get("minutes")) || 1)));
  const name = cleanName(url.searchParams.get("name"));
  const days = (minutes * 365) / 1440;
  const annualMinutes = minutes * 365;
  const hours = Math.round((minutes * 365) / 60);
  const tier = getTier(minutes);
  const origin = url.origin;
  const font = await fetch(`${origin}/fonts/LamaSans-Black.ttf`).then((response) => response.arrayBuffer());

  return new ImageResponse(
    (
      <div
        dir="rtl"
        style={{
          width: "1080px",
          height: "1350px",
          display: "flex",
          flexDirection: "column",
          padding: "54px 70px",
          color: "#fff8ea",
          background: `radial-gradient(circle at 86% 8%, ${tier.accent}77 0, transparent 38%), #171512`,
          border: "10px solid #ff5a1f",
          borderRadius: "62px",
          fontFamily: "Lama Sans",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "absolute", inset: 0, display: "flex", opacity: 0.11, backgroundImage: "radial-gradient(#fff8ea 2px, transparent 2px)", backgroundSize: "38px 38px" }} />

        <div style={{ height: "140px", display: "flex", flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: "32px" }}>
          <div style={{ width: "190px", height: "128px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img src={`${origin}/tahmna-logo.svg`} alt="" style={{ width: 128, height: 92, objectFit: "contain" }} />
          </div>
          <div style={{ width: "2px", height: "104px", display: "flex", background: "rgba(255,248,234,.35)" }} />
          <img src={`${origin}/sweater-logo-white.svg`} alt="" style={{ width: 245, height: 102, objectFit: "contain" }} />
        </div>

        <div style={{ height: "445px", marginTop: "24px", display: "flex", position: "relative", border: "8px solid #fff8ea", borderRadius: "42px", overflow: "hidden" }}>
          <img src={`${origin}/meme-frames/${tier.id}.png`} alt="" style={{ width: 920, height: 465, objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", background: "linear-gradient(transparent 55%, rgba(0,0,0,.72))" }} />
          <div style={{ position: "absolute", right: 28, bottom: 24, padding: "13px 28px 15px", display: "flex", flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: "7px", color: "#171512", background: "#fff8ea", border: `5px solid ${tier.accent}`, borderRadius: "999px", boxShadow: "0 8px 0 rgba(0,0,0,.72)", fontSize: "46px", lineHeight: 1, whiteSpace: "nowrap", textAlign: "center" }}>
            {tier.name.split(" ").map((word, index) => <div key={`${word}-${index}`} style={{ display: "flex" }}>{word}</div>)}
          </div>
        </div>

        <div style={{ height: "248px", marginTop: "14px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div dir="rtl" style={{ display: "flex", justifyContent: "center", fontSize: "38px", lineHeight: 1.15, whiteSpace: "nowrap", color: "#fff8ea", textAlign: "center" }}>
            {name}
          </div>
          <div style={{ marginTop: "12px", display: "flex", flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: "15px" }}>
            <div style={{ display: "flex", fontSize: "38px", lineHeight: 1, color: "#fff8ea" }}>يقضي</div>
            <div style={{ display: "flex", fontSize: "132px", lineHeight: 0.74, color: "#ff5a1f", letterSpacing: "-5px" }}>{formatNumber(days)}</div>
          </div>
          <div style={{ marginTop: "13px", display: "flex", flexDirection: "row-reverse", justifyContent: "center", gap: "5px", fontSize: "27px", lineHeight: 1.2, color: "rgba(255,248,234,.82)", whiteSpace: "nowrap", textAlign: "center" }}>
            {[dayUnit(days), "من", "السنة", "في", "السيارة"].map((word, index) => <div key={`${word}-${index}`} style={{ display: "flex" }}>{word}</div>)}
          </div>
        </div>

        <div style={{ height: "78px", marginTop: "7px", padding: "9px 28px", display: "flex", flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: "32px", background: tier.accent, borderRadius: "28px", color: "white" }}>
          <div style={{ width: "360px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ display: "flex", fontSize: "29px", lineHeight: 1 }}>{formatNumber(annualMinutes)}</div>
            <div style={{ marginTop: "7px", display: "flex", flexDirection: "row-reverse", gap: "4px", fontSize: "18px", lineHeight: 1, opacity: .86 }}><div style={{ display: "flex" }}>دقيقة</div><div style={{ display: "flex" }}>سنويًا</div></div>
          </div>
          <div style={{ width: "2px", height: "42px", display: "flex", background: "rgba(255,255,255,.42)" }} />
          <div style={{ width: "360px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ display: "flex", fontSize: "29px", lineHeight: 1 }}>{String(hours)}</div>
            <div style={{ marginTop: "7px", display: "flex", flexDirection: "row-reverse", gap: "4px", fontSize: "18px", lineHeight: 1, opacity: .86 }}><div style={{ display: "flex" }}>ساعة</div><div style={{ display: "flex" }}>سنويًا</div></div>
          </div>
        </div>

        <div style={{ minHeight: "58px", padding: "10px 20px 8px", display: "flex", flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: "4px", color: "rgba(255,248,234,.82)", fontSize: "23px", lineHeight: 1.35, textAlign: "center" }}>
          {tier.message.replace(/[.،]$/g, "").split(" ").map((word, index) => <div key={`${word}-${index}`} style={{ display: "flex" }}>{word}</div>)}
        </div>

        <div style={{ height: "104px", marginTop: "8px", padding: "10px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff8ea", borderRadius: "28px", color: "#171512" }}>
          <img src={`${origin}/qr-game-sweater.png`} alt="" style={{ width: 86, height: 86 }} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", marginRight: "25px", flex: 1 }}>
            <div style={{ display: "flex", flexDirection: "row-reverse", gap: "5px", fontSize: "31px", lineHeight: 1.2, textAlign: "right" }}><div style={{ display: "flex" }}>اكتشف</div><div style={{ display: "flex" }}>بطاقتك</div></div>
            <div style={{ marginTop: "4px", fontSize: "22px", color: "#ff5a1f" }}>#سيارتك_تهمنا</div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1350,
      fonts: [{ name: "Lama Sans", data: font, weight: 900, style: "normal" }],
      headers: { "Cache-Control": "no-store, max-age=0" },
    },
  );
}
