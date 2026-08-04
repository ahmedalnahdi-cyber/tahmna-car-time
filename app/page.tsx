"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import { campaignConfig, getTier, type ResultTier } from "../lib/campaign-config";

type Screen = "input" | "calculating" | "result";
type Discount = { code: string; value: string; expiresAt: string; terms: string };

const arabicDigits = new Intl.NumberFormat("ar-SA", { maximumFractionDigits: 1 });
const formatNumber = (value: number) => arabicDigits.format(Math.abs(value - Math.round(value)) < 0.05 ? Math.round(value) : value);
const track = (name: string, detail: Record<string, unknown> = {}) => {
  window.dispatchEvent(new CustomEvent("tahmna-analytics", { detail: { name, ...detail } }));
  const dataLayer = (window as typeof window & { dataLayer?: Record<string, unknown>[] }).dataLayer;
  dataLayer?.push({ event: name, ...detail });
};

const getSessionId = () => {
  const key = "tahmna_anonymous_session";
  const existing = sessionStorage.getItem(key);
  if (existing) return existing;
  const id = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  sessionStorage.setItem(key, id);
  return id;
};

function Brand() {
  return (
    <div className="brand" aria-label="سويتر - تهمنا">
      <span className="brand-name">سويتر</span>
      <span className="brand-dot" aria-hidden="true" />
      <span className="brand-campaign">تهمنا</span>
    </div>
  );
}

function MemePlaceholder({ tier }: { tier: ResultTier }) {
  return (
    <div className="meme-placeholder" style={{ "--tier-accent": tier.accent } as React.CSSProperties} role="img" aria-label={tier.alt}>
      <span className="meme-label">{tier.id}</span>
      <span className="meme-emoji" aria-hidden="true">{tier.emoji}</span>
      <span className="meme-caption">{tier.name}</span>
    </div>
  );
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("input");
  const [minutesInput, setMinutesInput] = useState(String(campaignConfig.calculator.defaultValue));
  const [minutes, setMinutes] = useState(campaignConfig.calculator.defaultValue);
  const [error, setError] = useState("");
  const [sharing, setSharing] = useState(false);
  const [shareError, setShareError] = useState("");
  const [fallbackOpen, setFallbackOpen] = useState(false);
  const [discount, setDiscount] = useState<Discount | null>(null);
  const [copied, setCopied] = useState(false);
  const started = useRef(false);

  const days = useMemo(() => (minutes * 365) / 1440, [minutes]);
  const hours = useMemo(() => Math.round((minutes * 365) / 60), [minutes]);
  const tier = useMemo(() => getTier(minutes), [minutes]);

  useEffect(() => track("calculator_opened"), []);

  const markStarted = () => {
    if (!started.current) {
      started.current = true;
      track("calculator_started");
    }
  };

  const validate = () => {
    if (minutesInput.trim() === "") return "اكتب عدد الدقائق أولًا.";
    const value = Number(minutesInput);
    if (!Number.isFinite(value)) return "اكتب رقمًا صحيحًا يا بطل.";
    if (value < 0) return "الوقت ما يرجع للخلف يا بطل.";
    if (value === 0) return "أكيد تركب السيارة مو تطالعها من بعيد؟";
    return "";
  };

  const calculate = () => {
    markStarted();
    const validation = validate();
    if (validation) {
      setError(validation);
      return;
    }
    const value = Math.round(Number(minutesInput));
    if (value > campaignConfig.calculator.max && !window.confirm("أكثر من 6 ساعات؟ متأكد من الرقم؟")) return;
    setError("");
    setMinutes(value);
    setScreen("calculating");
    track("result_generated", { minutes: value });
    track("result_tier", { tier: getTier(value).id });
    window.setTimeout(() => setScreen("result"), 1450);
  };

  const generateStory = async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas");

    ctx.fillStyle = campaignConfig.colors.ink;
    ctx.fillRect(0, 0, 1080, 1920);
    ctx.fillStyle = campaignConfig.colors.orange;
    ctx.beginPath();
    ctx.arc(960, 120, 350, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = tier.accent;
    ctx.beginPath();
    ctx.arc(80, 1560, 260, 0, Math.PI * 2);
    ctx.fill();

    ctx.direction = "rtl";
    ctx.textAlign = "right";
    ctx.fillStyle = campaignConfig.colors.cream;
    ctx.font = "700 54px Arial";
    ctx.fillText("سويتر", 920, 170);
    ctx.fillStyle = campaignConfig.colors.lime;
    ctx.font = "900 106px Arial";
    ctx.fillText("تهمنا", 920, 300);

    ctx.fillStyle = campaignConfig.colors.cream;
    ctx.font = "700 48px Arial";
    ctx.fillText(`أقضي ${formatNumber(days)} يومًا من سنتي`, 920, 490);
    ctx.fillText("داخل السيارة!", 920, 552);
    ctx.fillStyle = campaignConfig.colors.orange;
    ctx.font = "900 240px Arial";
    ctx.fillText(formatNumber(days), 920, 815);
    ctx.fillStyle = campaignConfig.colors.cream;
    ctx.font = "700 44px Arial";
    ctx.fillText(`${arabicDigits.format(minutes)} دقيقة يوميًا`, 920, 890);

    ctx.fillStyle = tier.accent;
    ctx.roundRect(100, 1010, 880, 500, 52);
    ctx.fill();
    ctx.textAlign = "center";
    ctx.font = "180px Arial";
    ctx.fillText(tier.emoji, 540, 1240);
    ctx.fillStyle = campaignConfig.colors.ink;
    ctx.font = "900 58px Arial";
    ctx.fillText(`شخصيتي: ${tier.name}`, 540, 1350);
    ctx.font = "700 38px Arial";
    ctx.fillText(tier.message, 540, 1420, 760);

    const qrUrl = await QRCode.toDataURL(campaignConfig.shareUrl, { width: 210, margin: 1, color: { dark: "#171512", light: "#fff8ea" } });
    const qr = new Image();
    await new Promise<void>((resolve, reject) => {
      qr.onload = () => resolve();
      qr.onerror = () => reject(new Error("qr"));
      qr.src = qrUrl;
    });
    ctx.fillStyle = campaignConfig.colors.cream;
    ctx.roundRect(100, 1610, 880, 220, 36);
    ctx.fill();
    ctx.drawImage(qr, 730, 1615, 210, 210);
    ctx.textAlign = "right";
    ctx.fillStyle = campaignConfig.colors.ink;
    ctx.font = "900 43px Arial";
    ctx.fillText("احسب وقتك أنت بعد", 670, 1700);
    ctx.font = "700 34px Arial";
    ctx.fillText(campaignConfig.brand.hashtag, 670, 1760);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png", 0.94));
    if (!blob) throw new Error("blob");
    return new File([blob], "نتيجتي-تهمنا.png", { type: "image/png" });
  };

  const downloadFile = (file: File) => {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(file);
    link.download = file.name;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  };

  const revealDiscount = async () => {
    try {
      const response = await fetch("/api/discount-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ result: minutes, tier: tier.id, sessionId: getSessionId() }),
      });
      if (!response.ok) throw new Error("discount");
      setDiscount((await response.json()) as Discount);
    } catch {
      setDiscount(campaignConfig.fallbackDiscount);
    }
    track("discount_revealed");
  };

  const share = async () => {
    setSharing(true);
    setShareError("");
    track("share_clicked");
    try {
      const file = await generateStory();
      const shareData = {
        files: [file],
        text: `طلعت أقضي ${formatNumber(days)} يومًا من سنتي داخل السيارة 😅 احسب نتيجتك أنت بعد. ${campaignConfig.brand.hashtag}`,
      };
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        track("share_invoked");
        await navigator.share(shareData);
        await revealDiscount();
      } else {
        downloadFile(file);
        setFallbackOpen(true);
        track("share_fallback_downloaded");
        await revealDiscount();
      }
    } catch (shareFailure) {
      if (shareFailure instanceof DOMException && shareFailure.name === "AbortError") return;
      setShareError("تعذر تجهيز الصورة هذه المرة. جرّب مرة ثانية.");
    } finally {
      setSharing(false);
    }
  };

  const downloadAgain = async () => {
    try {
      downloadFile(await generateStory());
      track("share_fallback_downloaded");
      await revealDiscount();
    } catch {
      setShareError("تعذر تجهيز الصورة هذه المرة. جرّب مرة ثانية.");
    }
  };

  const copyShareText = async () => {
    await navigator.clipboard.writeText(`طلعت أقضي ${formatNumber(days)} يومًا من سنتي داخل السيارة 😅 احسب نتيجتك أنت بعد. ${campaignConfig.brand.hashtag}`);
  };

  const copyCode = async () => {
    if (!discount) return;
    await navigator.clipboard.writeText(discount.code);
    setCopied(true);
    track("discount_code_copied");
    window.setTimeout(() => setCopied(false), 1800);
  };

  const recalculate = () => {
    track("recalculate_clicked");
    setScreen("input");
    setDiscount(null);
    setFallbackOpen(false);
    setShareError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className={`experience screen-${screen}`} dir="rtl">
      <div className="noise" aria-hidden="true" />
      <header><Brand /><span className="micro-tag">تجربة من سويتر</span></header>

      {screen === "input" && (
        <section className="panel input-panel" aria-labelledby="calculator-title">
          <div className="hero-mark" aria-hidden="true"><span>تهمـ</span><span>نا!</span></div>
          <div className="eyebrow"><i /> حاسبة وقتك في السيارة</div>
          <h1 id="calculator-title">كم يوم من سنتك<br />تقضيه <em>داخل سيارتك؟</em></h1>
          <p className="intro">حط متوسط وقتك اليومي في السيارة… ويمكن النتيجة تصدمك شوي.</p>

          <div className="calculator-card">
            <label htmlFor="minutes">كم دقيقة تقضيها يوميًا في السيارة؟</label>
            <div className="number-field" data-suffix="دقيقة">
              <input
                id="minutes"
                type="number"
                inputMode="numeric"
                value={minutesInput}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? "minutes-error" : "minutes-hint"}
                onFocus={markStarted}
                onChange={(event) => {
                  setMinutesInput(event.target.value);
                  setError("");
                }}
                onKeyDown={(event) => event.key === "Enter" && calculate()}
              />
            </div>
            <input
              className="slider"
              type="range"
              min={campaignConfig.calculator.min}
              max={campaignConfig.calculator.max}
              step={campaignConfig.calculator.step}
              value={Math.min(campaignConfig.calculator.max, Math.max(1, Number(minutesInput) || 1))}
              aria-label="اختيار عدد الدقائق"
              onPointerDown={markStarted}
              onChange={(event) => {
                setMinutesInput(event.target.value);
                setError("");
              }}
              style={{ "--range-progress": `${(Math.min(360, Math.max(1, Number(minutesInput) || 1)) / 360) * 100}%` } as React.CSSProperties}
            />
            <div className="range-labels" id="minutes-hint"><span>دقيقة واحدة</span><span>٦ ساعات</span></div>
            {error && <p className="field-error" id="minutes-error" role="alert">{error}</p>}
            <button className="primary-button" onClick={calculate}>احسب وقتي <span aria-hidden="true">←</span></button>
          </div>
          <p className="privacy-note"><span>●</span> بدون تسجيل وبدون بيانات شخصية</p>
        </section>
      )}

      {screen === "calculating" && (
        <section className="panel loading-panel" aria-live="polite" aria-busy="true">
          <div className="loading-orbit"><span className="loading-number">{arabicDigits.format(minutes)}</span><small>دقيقة</small></div>
          <div className="road"><span className="car" aria-hidden="true">🚙</span><i /><i /><i /><i /></div>
          <h1>جالسين نحسب مشاويرك…</h1>
          <p>نجمع الدقائق، نعدّ الساعات، ونجهّز الصدمة.</p>
          <div className="calendar-flip" aria-hidden="true"><span>٣٦٥</span><small>يوم</small></div>
        </section>
      )}

      {screen === "result" && (
        <section className="panel result-panel" aria-labelledby="result-title">
          <div className="eyebrow"><i /> نتيجتك</div>
          <h1 id="result-title">يا ساتر… شوف نتيجتك!</h1>
          <div className="result-number"><strong>{formatNumber(days)}</strong><span>يومًا</span></div>
          <p className="result-context">من سنتك تقضيها داخل السيارة</p>

          <div className="tier-card" style={{ "--tier-accent": tier.accent } as React.CSSProperties}>
            <div className="tier-heading"><span>شخصيتك</span><h2>{tier.name}</h2></div>
            <MemePlaceholder tier={tier} />
            <blockquote>«{tier.message}»</blockquote>
          </div>

          <div className="stat-strip">
            <span>يعني تقريبًا</span>
            <strong>{arabicDigits.format(hours)} ساعة</strong>
            <span>في السنة</span>
          </div>

          <div className="share-card">
            <span className="share-sticker">جاهز للستوري ✦</span>
            <h2>شاركنا نتيجتك وخذ<br />كود خصم خاص.</h2>
            <p>شاركها في الستوري وخل أصحابك يحسبون وقتهم.</p>
            <button className="primary-button" onClick={share} disabled={sharing}>
              {sharing ? "جالسين نجهّز بطاقتك…" : "شارك نتيجتي"} <span aria-hidden="true">↗</span>
            </button>
            {shareError && <div className="share-error" role="alert"><span>{shareError}</span><button onClick={share}>إعادة المحاولة</button></div>}
          </div>

          {fallbackOpen && (
            <div className="fallback-box" role="status">
              <h3>حفظنا لك النتيجة 🎉</h3>
              <p>افتح Instagram، اختر Story، وارفع الصورة.</p>
              <div><button onClick={downloadAgain}>تحميل الصورة</button><button onClick={copyShareText}>نسخ نص المشاركة</button></div>
            </div>
          )}

          {discount && (
            <div className="discount-card">
              <div className="confetti" aria-hidden="true">✦　●　✦　●</div>
              <p>كفو! هذا كودك الخاص من سويتر.</p>
              <button className="code" onClick={copyCode} aria-label="نسخ كود الخصم"><span>{discount.code}</span><small>{copied ? "تم النسخ ✓" : "نسخ الكود"}</small></button>
              <a className="primary-button" href={campaignConfig.bookingUrl} target="_blank" rel="noreferrer" onClick={() => track("booking_clicked")}>استخدم الخصم واحجز الآن <span aria-hidden="true">←</span></a>
              <ul><li>{discount.value}</li><li>ينتهي في {discount.expiresAt}</li><li>{discount.terms}</li><li>يستخدم مرة واحدة فقط</li></ul>
            </div>
          )}

          <button className="secondary-button" onClick={recalculate}>احسبها مرة ثانية</button>
        </section>
      )}

      <footer><span>مهما كانت النتيجة…</span><strong>سيارتك تهمنا.</strong></footer>
    </main>
  );
}

