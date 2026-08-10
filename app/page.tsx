"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import { campaignConfig, getTier, type ResultTier } from "../lib/campaign-config";

type Screen = "input" | "calculating" | "result";
type Discount = { code: string; value: string; expiresAt: string; terms: string };

const englishDigits = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const formatNumber = (value: number) => englishDigits.format(Math.abs(value - Math.round(value)) < 0.05 ? Math.round(value) : value);
const getMemeVideo = (tier: ResultTier) => `/memes/${tier.id}.mp4`;
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
      <img className="brand-logo" src="/tahmna-logo.svg" alt="شعار تهمنا" width="929" height="659" />
    </div>
  );
}

function MemeMedia({ tier }: { tier: ResultTier }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [needsSoundTap, setNeedsSoundTap] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    video.volume = 1;
    void video.play().then(() => setNeedsSoundTap(false)).catch(() => {
      video.muted = true;
      void video.play();
      setNeedsSoundTap(true);
    });
  }, [tier.id]);

  const enableSound = async () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    video.volume = 1;
    await video.play();
    setNeedsSoundTap(false);
  };

  return (
    <div className="meme-media" style={{ "--tier-accent": tier.accent } as React.CSSProperties}>
      <video
        ref={videoRef}
        className="meme-video"
        src={getMemeVideo(tier)}
        autoPlay
        loop
        playsInline
        preload="auto"
        aria-label={`ميم شخصية ${tier.name}`}
      />
      <span className="meme-label">ميم شخصية {tier.name}</span>
      {needsSoundTap && <button className="sound-button" type="button" onClick={enableSound}>شغّل الميم بالصوت 🔊</button>}
      <span className="meme-caption">{tier.name}</span>
    </div>
  );
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("input");
  const [nameInput, setNameInput] = useState("");
  const [minutesInput, setMinutesInput] = useState(String(campaignConfig.calculator.defaultValue));
  const [minutes, setMinutes] = useState(campaignConfig.calculator.defaultValue);
  const [nameError, setNameError] = useState("");
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
  const displayName = useMemo(() => nameInput.trim().replace(/\s+/g, " "), [nameInput]);

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
    if (!displayName) {
      setNameError("وش نناديك؟ اكتب اسمك الأول.");
      return;
    }
    if (displayName.length < 2) {
      setNameError("اكتب اسمك بشكل أوضح شوي.");
      return;
    }
    const validation = validate();
    if (validation) {
      setError(validation);
      return;
    }
    const value = Math.round(Number(minutesInput));
    if (value > campaignConfig.calculator.max && !window.confirm("أكثر من 6 ساعات؟ متأكد من الرقم؟")) return;
    setNameError("");
    setError("");
    setMinutes(value);
    setScreen("calculating");
    track("result_generated", { minutes: value });
    track("result_tier", { tier: getTier(value).id });
    window.setTimeout(() => setScreen("result"), 1450);
  };

  const generateStory = async () => {
    await document.fonts.load('900 54px "Lama Sans"');
    const brandLogo = new Image();
    await new Promise<void>((resolve, reject) => {
      brandLogo.onload = () => resolve();
      brandLogo.onerror = () => reject(new Error("logo"));
      brandLogo.src = "/tahmna-logo.svg";
    });
    const memeFrame = document.createElement("video");
    memeFrame.src = getMemeVideo(tier);
    memeFrame.muted = true;
    memeFrame.playsInline = true;
    memeFrame.preload = "auto";
    await new Promise<void>((resolve, reject) => {
      memeFrame.onloadeddata = () => resolve();
      memeFrame.onerror = () => reject(new Error("meme"));
      memeFrame.load();
    });
    if (Number.isFinite(memeFrame.duration) && memeFrame.duration > 0.5) {
      await new Promise<void>((resolve) => {
        memeFrame.onseeked = () => resolve();
        memeFrame.currentTime = 0.5;
      });
    }
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas");

    ctx.fillStyle = campaignConfig.colors.cream;
    ctx.fillRect(0, 0, 1080, 1920);

    // رأس البطاقة: هوية اللعبة داخل منطقة الأمان للستوري.
    ctx.fillStyle = campaignConfig.colors.ink;
    ctx.fillRect(0, 0, 1080, 300);
    ctx.fillStyle = campaignConfig.colors.orange;
    ctx.beginPath();
    ctx.arc(1000, 20, 310, 0, Math.PI * 2);
    ctx.fill();
    ctx.direction = "rtl";
    ctx.textAlign = "right";
    ctx.fillStyle = campaignConfig.colors.cream;
    ctx.roundRect(745, 38, 250, 214, 34);
    ctx.fill();
    ctx.drawImage(brandLogo, 780, 68, 180, 128);
    ctx.fillStyle = campaignConfig.colors.cream;
    ctx.font = '600 30px "Lama Sans", Arial';
    ctx.fillText("حاسبة وقتك في السيارة", 430, 145);

    // اسم اللاعب والنتيجة الرئيسية.
    ctx.fillStyle = campaignConfig.colors.accent;
    ctx.roundRect(100, 360, 880, 120, 34);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.font = '900 56px "Lama Sans", Arial';
    ctx.textAlign = "center";
    ctx.fillText(`${displayName}، هذه نتيجتك`, 540, 438, 780);

    ctx.fillStyle = campaignConfig.colors.ink;
    ctx.font = '700 42px "Lama Sans", Arial';
    ctx.fillText("تقضي من سنتك داخل السيارة", 540, 570);
    ctx.fillStyle = campaignConfig.colors.orange;
    ctx.font = '900 250px "Lama Sans", Arial';
    ctx.fillText(formatNumber(days), 540, 820);
    ctx.fillStyle = campaignConfig.colors.ink;
    ctx.font = '900 58px "Lama Sans", Arial';
    ctx.fillText("يومًا كاملًا!", 540, 905);
    ctx.fillStyle = "#6f675d";
    ctx.font = '700 34px "Lama Sans", Arial';
    ctx.fillText(`${englishDigits.format(minutes)} دقيقة يوميًا • ${englishDigits.format(hours)} ساعة سنويًا`, 540, 970);

    // بطاقة الشخصية والميم.
    ctx.fillStyle = campaignConfig.colors.ink;
    ctx.roundRect(100, 1040, 880, 420, 48);
    ctx.fill();
    const frameX = 120;
    const frameY = 1090;
    const frameWidth = 300;
    const frameHeight = 320;
    const sourceRatio = memeFrame.videoWidth / memeFrame.videoHeight;
    const targetRatio = frameWidth / frameHeight;
    let sourceX = 0;
    let sourceY = 0;
    let sourceWidth = memeFrame.videoWidth;
    let sourceHeight = memeFrame.videoHeight;
    if (sourceRatio > targetRatio) {
      sourceWidth = memeFrame.videoHeight * targetRatio;
      sourceX = (memeFrame.videoWidth - sourceWidth) / 2;
    } else {
      sourceHeight = memeFrame.videoWidth / targetRatio;
      sourceY = (memeFrame.videoHeight - sourceHeight) / 2;
    }
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(frameX, frameY, frameWidth, frameHeight, 30);
    ctx.clip();
    ctx.drawImage(memeFrame, sourceX, sourceY, sourceWidth, sourceHeight, frameX, frameY, frameWidth, frameHeight);
    ctx.restore();
    ctx.textAlign = "right";
    ctx.fillStyle = campaignConfig.colors.accent;
    ctx.font = '700 28px "Lama Sans", Arial';
    ctx.fillText(`شخصية ${displayName}`, 900, 1145, 520);
    ctx.fillStyle = campaignConfig.colors.cream;
    ctx.font = '900 56px "Lama Sans", Arial';
    ctx.fillText(tier.name, 900, 1220, 520);
    ctx.font = '700 34px "Lama Sans", Arial';
    ctx.fillText(tier.message, 900, 1310, 520);
    ctx.fillStyle = campaignConfig.colors.orange;
    ctx.fillRect(450, 1360, 450, 9);

    const qrUrl = await QRCode.toDataURL(campaignConfig.shareUrl, { width: 210, margin: 1, color: { dark: "#171512", light: "#fff8ea" } });
    const qr = new Image();
    await new Promise<void>((resolve, reject) => {
      qr.onload = () => resolve();
      qr.onerror = () => reject(new Error("qr"));
      qr.src = qrUrl;
    });
    ctx.fillStyle = campaignConfig.colors.orange;
    ctx.roundRect(100, 1520, 880, 280, 42);
    ctx.fill();
    ctx.fillStyle = campaignConfig.colors.cream;
    ctx.roundRect(730, 1555, 210, 210, 18);
    ctx.fill();
    ctx.drawImage(qr, 745, 1570, 180, 180);
    ctx.textAlign = "right";
    ctx.fillStyle = "#ffffff";
    ctx.font = '900 46px "Lama Sans", Arial';
    ctx.fillText("احسب وقتك أنت بعد", 675, 1625);
    ctx.font = '700 31px "Lama Sans", Arial';
    ctx.fillText("صوّر الكود وجرّب اللعبة", 675, 1685);
    ctx.fillStyle = campaignConfig.colors.ink;
    ctx.font = '900 30px "Lama Sans", Arial';
    ctx.fillText(campaignConfig.brand.hashtag, 675, 1750);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png", 0.94));
    if (!blob) throw new Error("blob");
    return new File([blob], `نتيجة-${displayName}-تهمنا.png`, { type: "image/png" });
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
        text: `أنا ${displayName} وطلعت أقضي ${formatNumber(days)} يومًا من سنتي داخل السيارة 😅 احسب نتيجتك أنت بعد. ${campaignConfig.brand.hashtag}`,
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
    await navigator.clipboard.writeText(`أنا ${displayName} وطلعت أقضي ${formatNumber(days)} يومًا من سنتي داخل السيارة 😅 احسب نتيجتك أنت بعد. ${campaignConfig.brand.hashtag}`);
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
            <label htmlFor="player-name">أول شيء… وش اسمك؟</label>
            <div className="name-field">
              <input
                id="player-name"
                type="text"
                inputMode="text"
                autoComplete="given-name"
                maxLength={20}
                placeholder="مثلاً: أحمد"
                value={nameInput}
                aria-invalid={Boolean(nameError)}
                aria-describedby={nameError ? "name-error" : undefined}
                onFocus={markStarted}
                onChange={(event) => {
                  setNameInput(event.target.value.replace(/[^\p{L}\p{M}\s'-]/gu, ""));
                  setNameError("");
                }}
              />
            </div>
            {nameError && <p className="field-error name-error" id="name-error" role="alert">{nameError}</p>}
            {displayName && <p className="name-preview" aria-live="polite">{displayName}، جاهز تعرف الصدمة؟</p>}
            <div className="form-divider"><span>والحين نبدأ</span></div>
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
            <div className="range-labels" id="minutes-hint"><span>دقيقة واحدة</span><span>6 ساعات</span></div>
            {error && <p className="field-error" id="minutes-error" role="alert">{error}</p>}
            <button className="primary-button" onClick={calculate}>احسب وقتي <span aria-hidden="true">←</span></button>
          </div>
          <p className="privacy-note"><span>●</span> اسمك يبقى داخل التجربة وبطاقة المشاركة فقط</p>
        </section>
      )}

      {screen === "calculating" && (
        <section className="panel loading-panel" aria-live="polite" aria-busy="true">
          <div className="loading-orbit"><span className="loading-number">{englishDigits.format(minutes)}</span><small>دقيقة</small></div>
          <div className="road"><span className="car" aria-hidden="true">🚙</span><i /><i /><i /><i /></div>
          <h1>{displayName}، جالسين نحسب مشاويرك…</h1>
          <p>نجمع دقائقك، نعدّ ساعاتك، ونجهّز لك الصدمة.</p>
          <div className="calendar-flip" aria-hidden="true"><span>365</span><small>يوم</small></div>
        </section>
      )}

      {screen === "result" && (
        <section className="panel result-panel" aria-labelledby="result-title">
          <div className="eyebrow"><i /> نتيجتك</div>
          <h1 id="result-title">{displayName}… وش ذا كله!</h1>
            <div className="result-number"><strong>{formatNumber(days)}</strong><span>يوم</span></div>
            <p className="result-context">تقضيه من سنتك هذا الوقت داخل السيارة</p>

          <div className="tier-card" style={{ "--tier-accent": tier.accent } as React.CSSProperties}>
            <div className="tier-heading"><span>شخصية {displayName}</span><h2>{tier.name}</h2></div>
            <MemeMedia tier={tier} />
            <blockquote>«{displayName}، {tier.message}»</blockquote>
          </div>

          <div className="stat-strip">
            <span>يعني تقريبًا</span>
            <strong>{englishDigits.format(hours)} ساعة</strong>
            <span>في السنة</span>
          </div>

          <div className="share-card">
            <span className="share-sticker">جاهز للستوري ✦</span>
            <h2>شاركنا نتيجتك وخذ<br />كود خصم خاص.</h2>
            <p>جهزناها باسمك وبهويّة اللعبة، شاركها في الستوري وخل أصحابك يحسبون وقتهم.</p>
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
              <p>كفو {displayName}! هذا كودك الخاص من سويتر.</p>
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
