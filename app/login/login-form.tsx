"use client";
import { useActionState } from "react";
import { sendCode, verifyCode, type LoginState } from "./actions";

export function LoginForm({ notice }: { notice?: string }) {
  const [sent, send, sending] = useActionState<LoginState, FormData>(sendCode, {
    step: "email",
    message: notice,
  });
  const [checked, verify, verifying] = useActionState<LoginState, FormData>(verifyCode, {
    step: "code",
  });

  if (sent.step === "code") {
    const message = checked.message ?? sent.message;
    return (
      <form action={verify} className="flex flex-col gap-4">
        <input type="hidden" name="email" value={sent.email ?? ""} />
        <label htmlFor="code" className="text-sm text-muted">
          Code from the email
        </label>
        <input
          id="code"
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9 ]*"
          required
          autoFocus
          className="field text-center font-serif text-4xl tracking-[0.3em]"
        />
        {message && <p className="text-sm" role="status">{message}</p>}
        <button className="btn-primary" disabled={verifying}>
          {verifying ? "Checking…" : "Come in"}
        </button>
      </form>
    );
  }

  return (
    <form action={send} className="flex flex-col gap-4">
      <label htmlFor="email" className="text-sm text-muted">
        Email
      </label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        required
        autoFocus
        defaultValue={sent.email}
        className="field"
      />
      {sent.message && <p className="text-sm" role="status">{sent.message}</p>}
      <button className="btn-primary" disabled={sending}>
        {sending ? "Sending…" : "Send my link"}
      </button>
    </form>
  );
}
