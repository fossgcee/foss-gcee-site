"use server";

import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSessionToken } from "@/lib/session";
import { rateLimit } from "@/lib/rateLimit";

/**
 * Constant-time string comparison using Node's crypto.timingSafeEqual.
 * Prevents timing-based side-channel attacks on the admin password.
 */
function timingSafeEqual(a: string, b: string): boolean {
  // Hash both strings to a constant length using SHA-256.
  // This ensures timingSafeEqual compares equal-length buffers and does not leak the secret length.
  const hashA = crypto.createHmac("sha256", "constant-salt").update(a).digest();
  const hashB = crypto.createHmac("sha256", "constant-salt").update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

export async function loginAction(formData: FormData) {
  // Rate-limit login attempts per a fixed key so brute-force is blocked
  // regardless of serverless cold-starts (5 attempts per 15 minutes server-wide).
  if (process.env.NODE_ENV === "production") {
    const loginLimit = rateLimit("admin:login", 5, 15 * 60 * 1000);
    if (!loginLimit.allowed) {
      return { error: "RATE_LIMITED" };
    }
  }

  const password = String(formData.get("password") ?? "");
  const adminPassword = process.env.ADMIN_PASSWORD ?? "";
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  if (!sessionSecret) {
    return { error: "SERVER_CONFIG_ERROR" };
  }

  // Use constant-time comparison — never === for secrets.
  if (adminPassword && timingSafeEqual(password, adminPassword)) {
    const cookieStore = await cookies();
    const token = await createSessionToken(sessionSecret, 1000 * 60 * 60 * 24);
    cookieStore.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return { success: true };
  }

  return { error: "INVALID_PASSWORD" };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  redirect("/");
}
