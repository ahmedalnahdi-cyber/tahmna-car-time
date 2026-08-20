"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import { FaInstagram, FaSnapchat, FaTiktok, FaWhatsapp, FaXTwitter } from "react-icons/fa6";
import { campaignConfig, getTier, type ResultTier } from "../lib/campaign-config";

type Screen = "input" | "calculating" | "result";
type Discount = { code: string; value: string; expiresAt: string };

const englishDigits = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });
const formatNumber = (value: number) => englishDigits.format(Math.abs(value - Math.round(value)) < 0.05 ? Math.round(value) : value);
const getDayUnit = (value: number) => {
  const displayedValue = Math.abs(value - Math.round(value)) < 0.05 ? Math.round(value) : Number(value.toFixed(1));
  if (displayedValue === 2) return "يومين";
  if (displayedValue >= 3 && displayedValue <= 10) return "أيام";
  return "يوم";
};
const getMemeVideo = (tier: ResultTier) => `/memes/${tier.id}.mp4`;
const socialLinks = [
  { label: "إنستقرام", icon: FaInstagram, href: "https://www.instagram.com/sweater_sa/" },
  { label: "تيك توك", icon: FaTiktok, href: "https://www.tiktok.com/@sweater_sa" },
  { label: "إكس", icon: FaXTwitter, href: "https://x.com/sweater_sa" },
  { label: "سناب شات", icon: FaSnapchat, href: "https://www.snapchat.com/add/sweater_sa" },
];
const track = (name: string, detail: Record<string, unknown> = {}) => {
  window.dispatchEvent(new CustomEvent("tahmna-analytics", { detail: { name, ...detail } }));
  const analyticsWindow = window as typeof window & {
    gtag?: (command: "event", eventName: string, parameters?: Record<string, unknown>) => void;
    dataLayer?: unknown[];
  };
  analyticsWindow.dataLayer ??= [];
  analyticsWindow.gtag ??= (...args) => analyticsWindow.dataLayer?.push(args);
  analyticsWindow.gtag?.("event", name, detail);
};

const initializeSnapButtons = () => {
  const snapWindow = window as typeof window & {
    snap?: { creativekit?: { initalizeShareButtons?: (elements: HTMLCollectionOf<Element>) => void } };
    snapKitInit?: () => void;
  };
  snapWindow.snap?.creativekit?.initalizeShareButtons?.(document.getElementsByClassName("snapchat-share-button"));
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
      <span className="brand-divider" aria-hidden="true" />
      <img className="sweater-logo sweater-logo-orange" src="/sweater-logo-orange.svg" alt="شعار سويتر" width="518" height="213" />
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
        id="result-meme-video"
        className="meme-video"
        src={getMemeVideo(tier)}
        autoPlay
        loop
        playsInline
        preload="auto"
        aria-label={`ميم شخصية ${tier.name}`}
      />
      {needsSoundTap && <button className="sound-button" type="button" onClick={enableSound}>شغّل الميم بالصوت 🔊</button>}
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
  const [siteOrigin, setSiteOrigin] = useState("");
  const started = useRef(false);

  const days = useMemo(() => (minutes * 365) / 1440, [minutes]);
  const hours = useMemo(() => Math.round((minutes * 365) / 60), [minutes]);
  const tier = useMemo(() => getTier(minutes), [minutes]);
  const displayName = useMemo(() => nameInput.trim().replace(/\s+/g, " "), [nameInput]);
  const snapShareUrl = useMemo(() => {
    const params = new URLSearchParams({ name: displayName, days: formatNumber(days), unit: getDayUnit(days), minutes: String(minutes), tier: tier.name, v: "7" });
    return `${siteOrigin}/snap?${params.toString()}`;
  }, [days, displayName, minutes, siteOrigin, tier.name]);

  useEffect(() => track("calculator_opened"), []);
  useEffect(() => setSiteOrigin(window.location.origin), []);

  useEffect(() => {
    const snapWindow = window as typeof window & { snapKitInit?: () => void };
    snapWindow.snapKitInit = initializeSnapButtons;
    if (document.getElementById("snapkit-creative-kit-sdk")) {
      initializeSnapButtons();
      return;
    }
    const script = document.createElement("script");
    script.id = "snapkit-creative-kit-sdk";
    script.src = "https://sdk.snapkit.com/js/v1/create.js";
    script.async = true;
    document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (screen !== "result") return;
    const frame = window.requestAnimationFrame(initializeSnapButtons);
    return () => window.cancelAnimationFrame(frame);
  }, [screen, snapShareUrl]);

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
    if (value > campaignConfig.calculator.max) return "الحد الأعلى للحاسبة 240 دقيقة.";
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
    const sweaterLogo = new Image();
    await Promise.all([
      new Promise<void>((resolve, reject) => {
        brandLogo.onload = () => resolve();
        brandLogo.onerror = () => reject(new Error("logo"));
        brandLogo.src = "/tahmna-logo.svg";
      }),
      new Promise<void>((resolve, reject) => {
        sweaterLogo.onload = () => resolve();
        sweaterLogo.onerror = () => reject(new Error("sweater-logo"));
        sweaterLogo.src = "/sweater-logo-white.svg";
      }),
    ]);
    // التقاط الفيديو الظاهر نفسه أكثر موثوقية على Safari من إنشاء فيديو جديد وقت المشاركة.
    let memeFrame = document.querySelector<HTMLVideoElement>("#result-meme-video");
    if (!memeFrame || memeFrame.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || !memeFrame.videoWidth) {
      memeFrame = document.createElement("video");
      memeFrame.src = getMemeVideo(tier);
      memeFrame.muted = true;
      memeFrame.playsInline = true;
      memeFrame.preload = "auto";
      memeFrame.style.cssText = "position:fixed;width:2px;height:2px;opacity:.01;pointer-events:none;left:0;bottom:0";
      document.body.appendChild(memeFrame);
      await new Promise<void>((resolve, reject) => {
        memeFrame!.onloadeddata = () => resolve();
        memeFrame!.onerror = () => reject(new Error("meme"));
        memeFrame!.load();
      });
      const captureTime = Math.min(Math.max(memeFrame.duration * 0.35, 0.4), Math.max(memeFrame.duration - 0.1, 0));
      if (captureTime > 0) {
        await new Promise<void>((resolve) => {
          memeFrame!.onseeked = () => resolve();
          memeFrame!.currentTime = captureTime;
        });
      }
      await new Promise<void>((resolve) => {
        if ("requestVideoFrameCallback" in memeFrame!) memeFrame!.requestVideoFrameCallback(() => resolve());
        else window.setTimeout(resolve, 350);
      });
    }
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("canvas");
    const fillRoundRect = (x: number, y: number, width: number, height: number, radius: number) => {
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, radius);
      ctx.fill();
    };
    const strokeRoundRect = (x: number, y: number, width: number, height: number, radius: number) => {
      ctx.beginPath();
      ctx.roundRect(x, y, width, height, radius);
      ctx.stroke();
    };

    const accent = tier.accent || campaignConfig.colors.accent;
    const cardGradient = ctx.createLinearGradient(0, 0, 1080, 1920);
    cardGradient.addColorStop(0, "#0e0d0b");
    cardGradient.addColorStop(.58, campaignConfig.colors.ink);
    cardGradient.addColorStop(1, "#080807");
    ctx.fillStyle = cardGradient;
    ctx.fillRect(0, 0, 1080, 1920);
    const glow = ctx.createRadialGradient(900, 240, 20, 900, 240, 760);
    glow.addColorStop(0, `${accent}88`);
    glow.addColorStop(1, "rgba(19,137,255,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 1080, 1000);
    ctx.strokeStyle = campaignConfig.colors.orange;
    ctx.lineWidth = 10;
    strokeRoundRect(34, 34, 1012, 1852, 58);
    ctx.strokeStyle = "rgba(255,248,234,.28)";
    ctx.lineWidth = 2;
    strokeRoundRect(54, 54, 972, 1812, 45);
    ctx.fillStyle = "rgba(255,255,255,.07)";
    for (let y = 90; y < 1840; y += 38) for (let x = 80; x < 1020; x += 38) ctx.fillRect(x, y, 2, 2);

    // شعارا الحملة وسويتر بجانب بعض دون عبارات إضافية.
    ctx.fillStyle = campaignConfig.colors.cream;
    fillRoundRect(554, 76, 205, 142, 28);
    ctx.direction = "rtl";
    ctx.drawImage(brandLogo, 596, 88, 120, 86);
    ctx.fillStyle = "rgba(255,248,234,.36)";
    fillRoundRect(520, 90, 2, 112, 1);
    ctx.drawImage(sweaterLogo, 250, 91, 245, 101);

    // الرياكشن هو الواجهة الأساسية للبطاقة.
    const frameX = 80;
    const frameY = 260;
    const frameWidth = 920;
    const frameHeight = 620;
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
    ctx.shadowColor = `${accent}aa`;
    ctx.shadowBlur = 45;
    ctx.beginPath();
    ctx.roundRect(frameX, frameY, frameWidth, frameHeight, 46);
    ctx.clip();
    ctx.drawImage(memeFrame, sourceX, sourceY, sourceWidth, sourceHeight, frameX, frameY, frameWidth, frameHeight);
    const imageShade = ctx.createLinearGradient(0, frameY + 300, 0, frameY + frameHeight);
    imageShade.addColorStop(0, "rgba(0,0,0,0)");
    imageShade.addColorStop(1, "rgba(0,0,0,.86)");
    ctx.fillStyle = imageShade;
    ctx.fillRect(frameX, frameY, frameWidth, frameHeight);
    ctx.restore();
    ctx.strokeStyle = campaignConfig.colors.cream;
    ctx.lineWidth = 8;
    strokeRoundRect(frameX, frameY, frameWidth, frameHeight, 46);
    ctx.textAlign = "center";
    ctx.fillStyle = "#fff";
    ctx.font = '900 64px "Lama Sans", Arial';
    ctx.fillText(tier.name, 540, 820, 820);

    // النتيجة والاسم بتسلسل قوي ومختصر.
    ctx.fillStyle = campaignConfig.colors.cream;
    ctx.textAlign = "right";
    ctx.font = '900 55px "Lama Sans", Arial';
    ctx.fillText(`${displayName}… وش ذا كله!`, 960, 1010, 880);
    ctx.fillStyle = campaignConfig.colors.orange;
    ctx.textAlign = "center";
    ctx.font = '900 230px "Lama Sans", Arial';
    ctx.fillText(formatNumber(days), 540, 1240);
    ctx.fillStyle = campaignConfig.colors.cream;
    ctx.font = '900 43px "Lama Sans", Arial';
    ctx.fillText(`${getDayUnit(days)} في السنة داخل السيارة`, 540, 1320, 880);
    ctx.fillStyle = accent;
    fillRoundRect(160, 1360, 760, 76, 38);
    ctx.fillStyle = "#fff";
    ctx.font = '800 27px "Lama Sans", Arial';
    ctx.fillText(`${englishDigits.format(minutes)} دقيقة يوميًا  •  ${englishDigits.format(hours)} ساعة سنويًا`, 540, 1408, 700);
    ctx.fillStyle = "rgba(255,248,234,.72)";
    ctx.font = '700 27px "Lama Sans", Arial';
    ctx.fillText(tier.message, 540, 1490, 860);

    const qrUrl = await QRCode.toDataURL(campaignConfig.shareUrl, { width: 210, margin: 1, color: { dark: "#171512", light: "#fff8ea" } });
    const qr = new Image();
    await new Promise<void>((resolve, reject) => {
      qr.onload = () => resolve();
      qr.onerror = () => reject(new Error("qr"));
      qr.src = qrUrl;
    });
    ctx.fillStyle = campaignConfig.colors.cream;
    fillRoundRect(80, 1570, 920, 230, 42);
    ctx.fillStyle = "#fff";
    fillRoundRect(770, 1592, 186, 186, 20);
    ctx.drawImage(qr, 783, 1605, 160, 160);
    ctx.textAlign = "right";
    ctx.fillStyle = campaignConfig.colors.ink;
    ctx.font = '900 42px "Lama Sans", Arial';
    ctx.fillText("اكتشف بطاقتك", 710, 1642);
    ctx.font = '700 27px "Lama Sans", Arial';
    ctx.fillText("امسح الكود واحسب وقتك", 710, 1692);
    ctx.fillStyle = campaignConfig.colors.orange;
    ctx.font = '900 27px "Lama Sans", Arial';
    ctx.fillText(campaignConfig.brand.hashtag, 710, 1748);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
    if (!blob) throw new Error("blob");
    return new File([blob], `نتيجة-${displayName}-تهمنا.jpg`, { type: "image/jpeg" });
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

  const share = async (platform: "instagram" | "whatsapp" | "general" = "general") => {
    setSharing(true);
    setShareError("");
    track("share_clicked", { platform });
    let file: File | null = null;
    try {
      file = await generateStory();
      const shareData = {
        files: [file],
        title: "شارك نتيجتك",
        text: platform === "whatsapp"
          ? "تتوقع نتيجتك أعلى مني؟👀\nاحسب كم يوم تقضيه بسيارتك مع سويتر\n#سيارتك_تهمنا\ngame.sweater.sa"
          : `أنا ${displayName} وطلعت أقضي ${formatNumber(days)} ${getDayUnit(days)} من سنتي داخل السيارة 😅 احسب نتيجتك أنت بعد. ${campaignConfig.brand.hashtag}`,
      };
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        track("share_invoked", { platform });
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
      if (file) {
        downloadFile(file);
        setFallbackOpen(true);
        track("share_fallback_downloaded", { reason: "native_share_failed" });
        await revealDiscount();
      } else {
        setShareError("تعذر تجهيز الصورة هذه المرة. جرّب مرة ثانية.");
      }
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
    await navigator.clipboard.writeText(`أنا ${displayName} وطلعت أقضي ${formatNumber(days)} ${getDayUnit(days)} من سنتي داخل السيارة 😅 احسب نتيجتك أنت بعد. ${campaignConfig.brand.hashtag}`);
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
      <header><Brand /></header>

      {screen === "input" && (
        <section className="panel input-panel" aria-labelledby="calculator-title">
          <div className="eyebrow"><i /> حاسبة وقتك في السيارة</div>
          <h1 id="calculator-title">كم يوم في السنة<br />تقضيه <em>داخل سيارتك؟</em></h1>
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
              style={{ "--range-progress": `${((Math.min(campaignConfig.calculator.max, Math.max(campaignConfig.calculator.min, Number(minutesInput) || campaignConfig.calculator.min)) - campaignConfig.calculator.min) / (campaignConfig.calculator.max - campaignConfig.calculator.min)) * 100}%` } as React.CSSProperties}
            />
            <div className="range-labels" id="minutes-hint"><span>دقيقة واحدة</span><span>240 دقيقة</span></div>
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
          <div className="result-card" style={{ "--tier-accent": tier.accent } as React.CSSProperties}>
            <div className="result-card-topline">
              <span><i /> نتيجة {displayName}</span>
            </div>
            <div className="result-card-score">
              <span>تقضي من سنتك داخل السيارة</span>
              <div className="result-card-days"><strong>{formatNumber(days)}</strong><em>{getDayUnit(days)}</em></div>
            </div>
            <div className="result-card-persona">
              <small>شخصيتك</small>
              <h1 id="result-title">{tier.name}</h1>
              <p>«{tier.message}»</p>
            </div>
            <MemeMedia tier={tier} />
            <div className="result-card-stat"><span>يعني تقريبًا</span><strong>{englishDigits.format(hours)} ساعة</strong><span>في السنة</span></div>
          </div>

          <div className="share-card" style={{ "--share-accent": tier.accent } as React.CSSProperties}>
            <div className="share-card-topline"><span>بطاقتك صارت جاهزة</span></div>
            <div className="share-card-copy">
              <span className="share-card-mark" aria-hidden="true">✦</span>
              <div><h2>شارك واربح!</h2><p>شارك نتيجتك مع أصدقائك واستمتع بخصم 30%!</p></div>
            </div>
            <div className="share-platform-grid">
              <button type="button" className="share-platform share-platform-snap snapchat-share-button" data-share-url={snapShareUrl} onClick={() => { track("share_invoked", { platform: "snapchat_sticker" }); void revealDiscount(); }}>
                <FaSnapchat aria-hidden="true" /><span>سناب</span>
              </button>
              <button type="button" className="share-platform share-platform-instagram" onClick={() => void share("instagram")} disabled={sharing} aria-busy={sharing}>
                <FaInstagram aria-hidden="true" /><span>إنستقرام</span>
              </button>
              <button type="button" className="share-platform share-platform-whatsapp" onClick={() => void share("whatsapp")} disabled={sharing} aria-busy={sharing}>
                <FaWhatsapp aria-hidden="true" /><span>واتساب</span>
              </button>
              <button type="button" className="share-platform share-platform-save" onClick={downloadAgain} disabled={sharing}>
                <b aria-hidden="true">↓</b><span>حفظ</span>
              </button>
            </div>
            {shareError && <div className="share-error" role="alert"><span>{shareError}</span><button onClick={() => void share()}>إعادة المحاولة</button></div>}
          </div>

          {fallbackOpen && (
            <div className="fallback-box" role="status">
              <h3>حفظنا لك النتيجة 🎉</h3>
              <p>إذا ما ظهرت المشاركة المباشرة، افتح سناب أو إنستقرام وارفع الصورة من ألبوم الصور.</p>
              <div><button onClick={downloadAgain}>حفظ الصورة مرة ثانية</button><button onClick={copyShareText}>نسخ نص المشاركة</button></div>
            </div>
          )}

          {discount && (
            <div className="discount-card">
              <div className="confetti" aria-hidden="true">✦　●　✦　●</div>
              <p>كفو {displayName}! هذا كودك الخاص من سويتر.</p>
              <button className="code" onClick={copyCode} aria-label="نسخ كود الخصم"><span>{discount.code}</span><small>{copied ? "تم النسخ ✓" : "نسخ الكود"}</small></button>
              <a className="primary-button" href={campaignConfig.bookingUrl} target="_blank" rel="noreferrer" onClick={() => track("booking_clicked")}>استخدم الخصم واحجز الآن <span aria-hidden="true">←</span></a>
              <ul><li>{discount.value}</li><li>صالح حتى تاريخ {discount.expiresAt}</li><li>يستخدم مرة واحدة فقط</li></ul>
            </div>
          )}

          <button className="secondary-button" onClick={recalculate}>احسبها مرة ثانية</button>
        </section>
      )}

      <footer>
        <div className="footer-inner">
          <div className="footer-brand">
            <span className="footer-logos" aria-label="تهمنا من سويتر">
              <span className="footer-logo"><img src="/tahmna-logo.svg" alt="شعار تهمنا" /></span>
              <span className="footer-brand-divider" aria-hidden="true" />
              <img className="footer-sweater-logo" src="/sweater-logo-white.svg" alt="شعار سويتر" />
            </span>
            <div><strong>تابعنا على منصاتنا</strong><small>تابع حسابات سويتر لكل جديد.</small></div>
          </div>
          <nav className="footer-socials" aria-label="حسابات سويتر">
            {socialLinks.map((social) => (
              <a key={social.label} href={social.href} target="_blank" rel="noreferrer" aria-label={`سويتر على ${social.label}`} onClick={() => track("social_clicked", { platform: social.label })}>
                <b aria-hidden="true"><social.icon /></b><span>{social.label}</span>
              </a>
            ))}
          </nav>
          <a className="footer-app" href="https://sweater.go.link/?adj_t=239i9e5n" target="_blank" rel="noreferrer" onClick={() => track("app_download_clicked")}>
            <span><small>متوفر على iOS وAndroid</small><strong>حمّل تطبيق سويتر</strong></span><b aria-hidden="true">↗</b>
          </a>
        </div>
      </footer>
    </main>
  );
}
