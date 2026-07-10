"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (!res || res.error) {
      setError("Email o contraseña inválidos.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={handleSubmit} className="panel w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-[30px] h-[30px] rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-accent)] flex items-center justify-center text-sm font-extrabold">
            A
          </div>
          <span className="font-bold text-base">Admisien</span>
        </div>

        <div className="panel-title">Iniciar sesión</div>

        <div className="flex flex-col gap-3 mb-4">
          <label className="flex flex-col gap-1.5 text-[13px] text-[var(--color-text-dim)]">
            Email
            <input
              type="email"
              required
              autoComplete="email"
              className="field-input"
              placeholder="nombre@institucion.cl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-[13px] text-[var(--color-text-dim)]">
            Contraseña
            <input
              type="password"
              required
              autoComplete="current-password"
              className="field-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
        </div>

        {error && (
          <p className="text-[var(--color-red)] text-xs mb-3">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-analyze w-full justify-center"
        >
          {loading ? "Ingresando…" : "Ingresar"}
        </button>
      </form>
    </main>
  );
}
