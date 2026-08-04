import { campaignConfig } from "../../../lib/campaign-config";

const hashSession = (value: string) => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36).toUpperCase().padStart(6, "0").slice(0, 6);
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      result?: number;
      tier?: string;
      sessionId?: string;
    };

    if (!body.sessionId || !body.tier || typeof body.result !== "number") {
      return Response.json({ error: "بيانات الطلب غير مكتملة" }, { status: 400 });
    }

    // رمز حتمي للجلسة: الطلبات المتكررة للجلسة نفسها تعيد الرمز ذاته.
    // قبل الإطلاق، اربط هذا المسار بمخزن دائم أو نظام أكواد سويتر الفعلي.
    const suffix = hashSession(`${body.sessionId}:${body.tier}`);
    return Response.json({
      code: `TAHMNA-${suffix}`,
      value: campaignConfig.fallbackDiscount.value,
      expiresAt: campaignConfig.fallbackDiscount.expiresAt,
      terms: campaignConfig.fallbackDiscount.terms,
    });
  } catch {
    return Response.json({ error: "تعذر إصدار الكود" }, { status: 500 });
  }
}

