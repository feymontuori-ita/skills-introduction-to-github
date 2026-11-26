"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAllowedEmail } from "@/lib/env.server";

export type LoginState = { step: "email" | "code"; email?: string; message?: string };

export async function sendCode(_prev: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (!email) return { step: "email", message: "Your email, please." };

  // Not you? Same answer, no email sent. Nothing to learn here.
  if (!isAllowedEmail(email)) {
    return { step: "code", email, message: "If that's you, a link and code are on the way." };
  }

  const h = await headers();
  const origin = h.get("origin") ?? `https://${h.get("host")}`;
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}/auth/confirm` },
  });
  if (error) return { step: "email", email, message: "That didn't send. Try again in a minute." };

  return { step: "code", email, message: "Check your email. Tap the link, or type the code here." };
}

export async function verifyCode(_prev: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const token = String(form.get("code") ?? "").replace(/\s/g, "");
  if (!isAllowedEmail(email) || !/^\d{6,10}$/.test(token)) {
    return { step: "code", email, message: "That code didn't work. Check it and try again." };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
  if (error) return { step: "code", email, message: "That code didn't work. Check it and try again." };
  redirect("/");
}
