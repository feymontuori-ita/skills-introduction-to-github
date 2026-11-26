# T O D A Y.

**Less thinking. More living.** A personal self-coaching PWA for one user.
It catches a spiral, turns it into one believable reframe and one small action, reminds me to do it, and keeps the evidence that I did.

> Tap → speak → reframe + one next move → commit to a time → reminder → Done → evidence saved.

Stack: Next.js 16 (App Router) · TypeScript · Tailwind v4 · Supabase (Postgres + Auth + RLS) · installable PWA · Vercel.
Build progress lives in [`ROADMAP.md`](./ROADMAP.md). The next instruction lives in [`NEXT_PROMPT.md`](./NEXT_PROMPT.md).

---

## Setup (one time, ~15 minutes)

### 1. Supabase
1. Create a project at supabase.com (free tier is fine). Pick the region closest to you.
2. **SQL Editor →** paste and run `supabase/migrations/20261126000000_init.sql`.
3. Still in the SQL Editor, lock sign-ups to your email (this runs once, and never lives in git):
   ```sql
   insert into private.allowed_email (email) values ('YOUR-EMAIL-HERE');
   ```
   Any other email that tries to sign up is rejected by the database itself.
4. **Authentication → Emails → Magic Link template:** add the code so you can sign in *inside* the installed iPhone app
   (iOS opens email links in Safari, which doesn't share a login with the home-screen app):
   ```html
   <h2>Your TODAY. sign-in</h2>
   <p>Code: <strong>{{ .Token }}</strong></p>
   <p><a href="{{ .ConfirmationURL }}">Or tap to sign in</a></p>
   ```
5. **Authentication → URL Configuration:** set *Site URL* to your Vercel URL (e.g. `https://today-xyz.vercel.app`)
   and add `https://today-xyz.vercel.app/auth/confirm` and `http://localhost:3000/auth/confirm` to *Redirect URLs*.
6. **Project Settings → API:** copy the Project URL and the `anon` public key.

### 2. Local
```bash
cp .env.example .env.local     # fill in the Supabase URL, anon key, ALLOWED_EMAIL
cp data/personal-context.example.json data/personal-context.local.json   # git-ignored; add real names
npm install
npm run dev                    # http://localhost:3000
```

### 3. Deploy (Vercel)
1. Import the repo at vercel.com → New Project. Framework: Next.js (auto-detected).
2. Add the env vars from `.env.example` (Settings → Environment Variables). Only `NEXT_PUBLIC_*` values reach the browser.
3. Deploy. Put the URL back into Supabase (step 1.5).

### 4. Install on iPhone
Open the Vercel URL in **Safari** → Share → **Add to Home Screen**. Open TODAY. from the home screen,
enter your email, then type the **code** from the email (don't tap the link: that signs in Safari, not the app).

---

## Environment variables

| Name | Where | Needed from |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | browser + server | step 1 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | browser + server (safe: RLS protects data) | step 1 |
| `ALLOWED_EMAIL` | server only | step 1 |
| `SUPABASE_SERVICE_ROLE_KEY` | server only (reminder cron) | step 5 |
| `AI_PROVIDER`, `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, `OPENAI_API_KEY`, `OPENAI_MODEL` | server only | step 3–4 |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `CRON_SECRET` | server (public key: browser) | step 5 |

## Security model
- **Three locks on the door:** the server refuses to send a sign-in email to anyone but `ALLOWED_EMAIL`;
  the database trigger rejects any other sign-up; the proxy signs out any session whose email doesn't match.
- **Row Level Security** is on for every table, owner-only.
- No API keys in the client bundle. No analytics, trackers or third-party scripts. Fonts are self-hosted.

## Migrations
SQL lives in `supabase/migrations/`, applied in filename order (SQL Editor, or `supabase db push` with the Supabase CLI).

## Scripts
- `npm run dev` / `npm run build` / `npm start`
- `npm run lint`: type-check
- `npm run icons`: re-render the PWA icons (needs Playwright)

*A personal self-coaching tool. Not therapy or medical care.*
