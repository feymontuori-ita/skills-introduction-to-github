import "server-only";

/** The one email allowed in. Server-only, never shipped to the browser. */
export function allowedEmail(): string {
  return (process.env.ALLOWED_EMAIL ?? "").trim().toLowerCase();
}

export function isAllowedEmail(email: string | null | undefined): boolean {
  const allowed = allowedEmail();
  // Fail closed: if ALLOWED_EMAIL isn't set, nobody gets in.
  return Boolean(allowed && email && email.trim().toLowerCase() === allowed);
}
