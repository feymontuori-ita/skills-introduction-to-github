import { Wordmark } from "@/components/wordmark";
import { isSupabaseConfigured } from "@/lib/env";
import { redirect } from "next/navigation";

export const metadata = { title: "Setup" };

// Shown only when Supabase env vars are missing. Points at the README.
export default function SetupPage() {
  if (isSupabaseConfigured) redirect("/");
  return (
    <main className="screen justify-center">
      <Wordmark className="text-5xl" />
      <p className="mt-8 text-lg">Almost there. Supabase isn&apos;t connected yet.</p>
      <p className="mt-2 text-muted">
        Add the env vars from <code>.env.example</code>, then redeploy. The README has the steps.
      </p>
    </main>
  );
}
