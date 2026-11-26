"use client";
import { useEffect, useState } from "react";
import { Wordmark } from "@/components/wordmark";
import { principleFor } from "@/lib/principles";

// Client-side so the date and principle follow the phone's timezone, online or not.
export function TodayHeader() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);

  const date = now?.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  return (
    <header>
      <Wordmark className="text-4xl" />
      <p className="mt-2 min-h-6 text-sm uppercase tracking-[0.2em] text-muted">{date ?? " "}</p>
      <section className="mt-12" aria-label="Your daily principle">
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Your daily principle</p>
        <p className="mt-3 min-h-24 font-serif text-[2rem] leading-tight">
          {now ? principleFor(now) : " "}
        </p>
      </section>
      <p className="mt-8 text-muted">One thought. One decision. One action at a time.</p>
    </header>
  );
}
