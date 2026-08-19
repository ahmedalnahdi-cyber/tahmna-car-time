import { campaignConfig } from "../../../lib/campaign-config";

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

    return Response.json({
      code: campaignConfig.fallbackDiscount.code,
      value: campaignConfig.fallbackDiscount.value,
      expiresAt: campaignConfig.fallbackDiscount.expiresAt,
    });
  } catch {
    return Response.json({ error: "تعذر إصدار الكود" }, { status: 500 });
  }
}
