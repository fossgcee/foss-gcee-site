"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createSessionToken } from "@/lib/session";

export async function loginAction(formData: FormData) {
  const password = formData.get("password");
  const adminPassword = process.env.ADMIN_PASSWORD;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  if (password === adminPassword && sessionSecret) {
    const cookieStore = await cookies();
    const token = await createSessionToken(sessionSecret, 1000 * 60 * 60 * 24);
    cookieStore.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });
    
    redirect("/admin");
  }

  if (!sessionSecret) {
    return { error: "SERVER_CONFIG_ERROR" };
  }

  return { error: "INVALID_PASSWORD" };
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  redirect("/");
}
