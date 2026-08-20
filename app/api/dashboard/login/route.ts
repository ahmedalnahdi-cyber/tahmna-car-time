import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { COOKIE_NAME, createDashboardToken } from "../../../../lib/dashboard-auth";

export async function POST(request: Request) {
  const formData = await request.formData();
  const supplied = String(formData.get("password") || "");
  const expected = process.env.DASHBOARD_PASSWORD || "";
  const valid = supplied.length === expected.length && expected.length > 0 && timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
  if (!valid) return NextResponse.redirect(new URL("/dashboard?error=1", request.url), 303);

  const response = NextResponse.redirect(new URL("/dashboard", request.url), 303);
  response.cookies.set(COOKIE_NAME, createDashboardToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 12,
    path: "/dashboard",
  });
  return response;
}
