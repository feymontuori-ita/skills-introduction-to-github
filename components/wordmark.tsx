export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <h1 className={`font-serif tracking-[0.18em] text-ink ${className}`} aria-label="TODAY.">
      T O D A Y<span className="text-brand">.</span>
    </h1>
  );
}
