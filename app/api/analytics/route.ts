import { createHash } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { getAdminFirestore } from "../../../lib/firebase-admin";

const EVENT_FIELDS: Record<string, string> = {
  calculator_opened: "visits",
  calculator_started: "calculatorStarts",
  result_generated: "results",
  discount_revealed: "discountReveals",
  discount_code_copied: "discountCopies",
  booking_clicked: "bookingClicks",
  recalculate_clicked: "recalculations",
  app_download_clicked: "appDownloadClicks",
  social_clicked: "socialClicks",
};

const SAFE_EVENTS = new Set([
  ...Object.keys(EVENT_FIELDS),
  "result_tier",
  "share_clicked",
  "share_invoked",
  "share_fallback_downloaded",
]);

const safeKey = (value: unknown) => String(value || "unknown").toLowerCase().replace(/[^a-z0-9_-]/g, "_").slice(0, 40);

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      visitorId?: string;
      sessionId?: string;
      platform?: string;
      tier?: string;
    };
    if (!body.name || !SAFE_EVENTS.has(body.name)) return NextResponse.json({ ok: false }, { status: 400 });

    const db = getAdminFirestore();
    const summary = db.doc("stats/summary");
    const updates: Record<string, FieldValue> = {
      totalEvents: FieldValue.increment(1),
      updatedAt: FieldValue.serverTimestamp(),
    };
    const field = EVENT_FIELDS[body.name];
    if (field) updates[field] = FieldValue.increment(1);
    if (body.name === "result_tier") updates[`tier_${safeKey(body.tier)}`] = FieldValue.increment(1);
    if (body.name === "share_invoked") {
      updates.shares = FieldValue.increment(1);
      updates[`share_${safeKey(body.platform)}`] = FieldValue.increment(1);
    }
    if (body.name === "share_fallback_downloaded") updates.imageDownloads = FieldValue.increment(1);

    await summary.set(updates, { merge: true });

    if (body.name === "calculator_opened" && body.visitorId) {
      const visitorHash = createHash("sha256").update(body.visitorId).digest("hex");
      const visitor = db.doc(`visitors/${visitorHash}`);
      await db.runTransaction(async (transaction) => {
        const existing = await transaction.get(visitor);
        if (!existing.exists) {
          transaction.set(visitor, { firstSeenAt: FieldValue.serverTimestamp() });
          transaction.set(summary, { uniqueVisitors: FieldValue.increment(1) }, { merge: true });
        }
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    // الإحصائيات اختيارية: فشلها لا يجب أن ينعكس على تجربة اللعبة.
    return NextResponse.json({ ok: false }, { status: 202 });
  }
}
