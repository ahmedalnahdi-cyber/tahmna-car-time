import { cookies } from "next/headers";
import { campaignConfig } from "../../lib/campaign-config";
import { COOKIE_NAME, verifyDashboardToken } from "../../lib/dashboard-auth";
import { getAdminFirestore } from "../../lib/firebase-admin";
import "./dashboard.css";

export const dynamic = "force-dynamic";

type Stats = Record<string, number>;

async function loadStats(): Promise<Stats> {
  try {
    const snapshot = await getAdminFirestore().doc("stats/summary").get();
    return (snapshot.data() || {}) as Stats;
  } catch {
    return {};
  }
}

const number = new Intl.NumberFormat("en-US");

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const cookieStore = await cookies();
  const authenticated = verifyDashboardToken(cookieStore.get(COOKIE_NAME)?.value);
  const params = await searchParams;

  if (!authenticated) {
    return (
      <main className="dashboard-login" dir="rtl">
        <section>
          <span>لوحة خاصة</span>
          <h1>إحصائيات حملة تهمنا</h1>
          <p>أدخل كلمة المرور لمشاهدة الأرقام.</p>
          <form action="/api/dashboard/login" method="post">
            <input name="password" type="password" placeholder="كلمة المرور" autoComplete="current-password" required />
            {params.error && <small>كلمة المرور غير صحيحة.</small>}
            <button type="submit">دخول</button>
          </form>
        </section>
      </main>
    );
  }

  const stats = await loadStats();
  const cards = [
    ["إجمالي الزيارات", stats.visits],
    ["الزوار بدون تكرار", stats.uniqueVisitors],
    ["بدأوا الحاسبة", stats.calculatorStarts],
    ["أكملوا النتيجة", stats.results],
    ["إجمالي المشاركات", stats.shares],
    ["حفظوا الصورة", stats.imageDownloads],
    ["ظهر لهم الخصم", stats.discountReveals],
    ["ضغطوا احجز الآن", stats.bookingClicks],
  ] as const;
  const platforms = [
    ["سناب", stats.share_snapchat_sticker],
    ["إنستقرام", stats.share_instagram],
    ["واتساب", stats.share_whatsapp],
    ["مشاركة عامة", stats.share_general],
  ] as const;

  return (
    <main className="stats-dashboard" dir="rtl">
      <header><div><span>تهمنا × سويتر</span><h1>لوحة أداء الحملة</h1><p>أرقام مباشرة من قاعدة Firebase الخلفية.</p></div><a href="/dashboard">تحديث الأرقام</a></header>
      <section className="metric-grid">
        {cards.map(([label, value], index) => <article key={label} className={index < 2 ? "featured" : ""}><span>{label}</span><strong>{number.format(value || 0)}</strong></article>)}
      </section>
      <section className="dashboard-section"><div><span>تفصيل المشاركات</span><h2>أداء المنصات</h2></div><div className="platform-grid">{platforms.map(([label, value]) => <article key={label}><span>{label}</span><strong>{number.format(value || 0)}</strong></article>)}</div></section>
      <section className="dashboard-section"><div><span>الشخصيات</span><h2>أكثر النتائج ظهورًا</h2></div><div className="tier-list">{campaignConfig.tiers.map((tier) => { const value = stats[`tier_${tier.id}`] || 0; const max = Math.max(1, ...campaignConfig.tiers.map((item) => stats[`tier_${item.id}`] || 0)); return <article key={tier.id}><div><strong>{tier.name}</strong><span>{number.format(value)}</span></div><i><b style={{ width: `${(value / max) * 100}%`, background: tier.accent }} /></i></article>; })}</div></section>
      <footer>هذه العدادات مستقلة عن تشغيل اللعبة؛ تعطلها لا يوقف الموقع.</footer>
    </main>
  );
}
