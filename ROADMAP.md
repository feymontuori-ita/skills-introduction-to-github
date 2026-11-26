# TODAY. — Roadmap

☐ not started · ◐ in progress · ☑ done

## Phase 1 (build order — one step at a time, verify at each checkpoint)

- ☑ **1. Skeleton:** Next.js + Tailwind + design tokens + PWA manifest + Supabase auth locked to my email.
  *Checkpoint: I can install it to my home screen and log in.* — verified on a mock Supabase in an iPhone viewport; ⏳ waiting on Fey's real-phone install + login.
- ☐ **2. Today screen + Library + 60-second reset** with seeded loops and reframes. No AI. *Checkpoint: works fully offline after first load.*
- ☐ **3. Text → coach → reframe card → commitment.** *Checkpoint: typed thought to scheduled commitment < 90s; Zod fallback tested.*
- ☐ **4. Voice capture + transcription.** *Checkpoint: iOS Safari + installed PWA; mic denial handled.*
- ☐ **5. Reminders (Web Push + cron) + Done / Smaller / Reschedule + miss flow.** *Checkpoint: locked phone notified discreetly.*
- ☐ **6. Evidence numbers + completion moments + repeat-loop rule.**
- ☐ **7. Safety flow.** *Checkpoint: test inputs trigger it; normal flow fully skipped.*

Then: **pause the build. Use TODAY. for 7 days.**

## Phase 2 (only after 7 days of use — one feature at a time, chosen from what I actually used)
- ☐ Growth tab with editable weekly self-trust targets (starting targets, never grades)
- ☐ Act tab for all commitments
- ☐ Morning + evening check-ins (2 min, voice)
- ☐ Weekly "what changed" recap
- ☐ Loop insights (observations, not conclusions)
- ☐ Editable personal principles

## Phase 3
- ☐ Decision log
- ☐ "Should I say this now?" conversation check
- ☐ Optional streaks
- ☐ Import insights from FEY OS / ChatGPT exports

## Later (requests parked to protect scope)
- (none yet)

## Session log
- **2026-11-26:** Step 1 built. Auth = email magic link + 6-digit code (code needed because iOS opens links in Safari, not the installed app). Sign-ups locked in 3 places. Full Phase 1 schema + RLS migrated up front.
