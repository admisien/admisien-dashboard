import { auth } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <main className="shell">
      <header className="flex items-center justify-between gap-4 pb-5 mb-5 border-b border-[var(--color-panel-border-soft)]">
        <div className="flex items-center gap-2.5 font-bold text-base">
          <div className="w-[30px] h-[30px] rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-sm font-extrabold">
            A
          </div>
          Admisien
        </div>
        <div className="institution-fixed">{session?.user?.institucion ?? "—"}</div>
        <div className="status-live">
          <span className="dot" /> En vivo
        </div>
      </header>
      {children}
    </main>
  );
}
