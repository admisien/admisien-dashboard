import Link from "next/link";

export default function Home() {
  return (
    <main className="shell">
      <div className="panel">
        <div className="panel-title">Admisien</div>
        <p className="text-[var(--color-text-dim)] text-sm">
          Setup base en curso. El dashboard vive en{" "}
          <Link href="/dashboard" className="text-[var(--color-accent)] underline">
            /dashboard
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
