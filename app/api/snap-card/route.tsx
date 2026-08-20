import { ImageResponse } from "next/og";
import { getTier } from "../../../lib/campaign-config";

export const runtime = "edge";

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

const cleanName = (value: string | null) => (value ?? "صاحب البطاقة").replace(/[<>]/g, "").trim().slice(0, 20) || "صاحب البطاقة";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const minutes = Math.min(240, Math.max(1, Math.round(Number(url.searchParams.get("minutes")) || 1)));
  const name = cleanName(url.searchParams.get("name"));
  const days = (minutes * 365) / 1440;
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

        <div style={{ height: "140px", display: "flex", alignItems: "center", justifyContent: "center", gap: "32px" }}>
          <div style={{ width: "190px", height: "128px", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff8ea", borderRadius: "26px" }}>
            <img src={`${origin}/tahmna-logo.svg`} alt="" style={{ width: 128, height: 92, objectFit: "contain" }} />
          </div>
          <div style={{ width: "2px", height: "104px", display: "flex", background: "rgba(255,248,234,.35)" }} />
          <img src={`${origin}/sweater-logo-white.svg`} alt="" style={{ width: 245, height: 102, objectFit: "contain" }} />
        </div>

        <div style={{ height: "465px", marginTop: "28px", display: "flex", position: "relative", border: "8px solid #fff8ea", borderRadius: "42px", overflow: "hidden" }}>
          <img src={`${origin}/snap-stickers/${tier.id}.png`} alt="" style={{ width: 920, height: 465, objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, display: "flex", background: "linear-gradient(transparent 48%, rgba(0,0,0,.9))" }} />
          <div style={{ position: "absolute", left: 30, right: 30, bottom: 25, display: "flex", justifyContent: "center", color: "white", fontSize: "58px" }}>{tier.name}</div>
        </div>

        <div style={{ height: "234px", marginTop: "22px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", fontSize: "39px", whiteSpace: "nowrap" }}>{`${name}… وش ذا كله!`}</div>
          <div style={{ marginTop: "3px", display: "flex", justifyContent: "center", fontSize: "25px", color: "rgba(255,248,234,.72)", whiteSpace: "nowrap" }}>تقضيه من سنتك داخل السيارة</div>
          <div style={{ marginTop: "13px", display: "flex", alignItems: "flex-end", justifyContent: "center", gap: "18px" }}>
            <div style={{ paddingBottom: "14px", display: "flex", fontSize: "36px" }}>{dayUnit(days)}</div>
            <div style={{ display: "flex", fontSize: "150px", lineHeight: 0.72, color: "#ff5a1f", letterSpacing: "-6px" }}>{formatNumber(days)}</div>
          </div>
        </div>

        <div style={{ height: "62px", marginTop: "8px", padding: "0 30px", display: "flex", alignItems: "center", justifyContent: "center", gap: "20px", background: tier.accent, borderRadius: "31px", color: "white", fontSize: "25px" }}>
          <div style={{ display: "flex" }}>{`${minutes} دقيقة يوميًا`}</div>
          <div style={{ display: "flex" }}>•</div>
          <div style={{ display: "flex" }}>{`${hours} ساعة سنويًا`}</div>
        </div>

        <div style={{ height: "48px", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,248,234,.74)", fontSize: "23px" }}>
          {tier.message}
        </div>

        <div style={{ height: "104px", marginTop: "8px", padding: "10px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff8ea", borderRadius: "28px", color: "#171512" }}>
          <img src={`${origin}/qr-game-sweater.png`} alt="" style={{ width: 86, height: 86 }} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", marginRight: "25px", flex: 1 }}>
            <div style={{ fontSize: "31px" }}>اكتشف بطاقتك</div>
            <div style={{ marginTop: "4px", fontSize: "22px", color: "#ff5a1f" }}>#سيارتك_تهمنا</div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1350,
      fonts: [{ name: "Lama Sans", data: font, weight: 900, style: "normal" }],
      headers: { "Cache-Control": "public, max-age=31536000, immutable" },
    },
  );
}
