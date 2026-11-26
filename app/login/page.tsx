import { Wordmark } from "@/components/wordmark";
import { LoginForm } from "./login-form";

export const metadata = { title: "Come in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ e?: string }>;
}) {
  const { e } = await searchParams;
  const notice =
    e === "closed"
      ? "This one's private. Sign-ups are closed."
      : e === "link"
        ? "That link expired or opened in another browser. Use the code instead."
        : undefined;

  return (
    <main className="screen justify-center">
      <Wordmark className="text-5xl" />
      <p className="mt-3 font-serif text-2xl italic text-muted">Less thinking. More living.</p>
      <div className="mt-12">
        <LoginForm notice={notice} />
      </div>
    </main>
  );
}
