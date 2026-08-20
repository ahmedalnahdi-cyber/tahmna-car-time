import { createHmac, timingSafeEqual } from "node:crypto";

const COOKIE_NAME = "tahmna_dashboard";

function secret() {
  return process.env.DASHBOARD_SESSION_SECRET || process.env.DASHBOARD_PASSWORD || "";
}

export function createDashboardToken() {
  const expires = Date.now() + 1000 * 60 * 60 * 12;
  const payload = String(expires);
  const signature = createHmac("sha256", secret()).update(payload).digest("hex");
  return `${payload}.${signature}`;
}

export function verifyDashboardToken(token?: string) {
  if (!token || !secret()) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || Number(payload) < Date.now()) return false;
  const expected = createHmac("sha256", secret()).update(payload).digest("hex");
  if (signature.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export { COOKIE_NAME };
