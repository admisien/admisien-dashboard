"use client";

import { useState } from "react";

type Props = { onSaved: () => void };

export function ManualSpendPanel({ onSaved }: Props) {
  const [open, setOpen] = useState(false);
  const [googleSpend, setGoogleSpend] = useState("");
  const [linkedinSpend, setLinkedinSpend] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function postSpend(canal: "google" | "linkedin", monto: number) {
    const res = await fetch("/api/spend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ canal, monto }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error ?? `Error ${res.status}`);
    }
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const calls: Promise<void>[] = [];
      if (googleSpend) calls.push(postSpend("google", Number(googleSpend)));
      if (linkedinSpend) calls.push(postSpend("linkedin", Number(linkedinSpend)));
      await Promise.all(calls);
      setGoogleSpend("");
      setLinkedinSpend("");
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <button type="button" className="config-toggle" onClick={() => setOpen((o) => !o)}>
        ⚙ Cargar gasto manual (Google Ads / LinkedIn)
      </button>
      {open && (
        <div className="config-panel mb-3.5">
          <div className="config-row">
            <label>Gasto Google Ads (semana)</label>
            <input
              type="number"
              className="field-input !w-40"
              placeholder="$ 0"
              value={googleSpend}
              onChange={(e) => setGoogleSpend(e.target.value)}
            />
          </div>
          <div className="config-row">
            <label>Gasto LinkedIn (semana)</label>
            <input
              type="number"
              className="field-input !w-40"
              placeholder="$ 0"
              value={linkedinSpend}
              onChange={(e) => setLinkedinSpend(e.target.value)}
            />
          </div>
          {error && (
            <p className="text-sm mb-2" style={{ color: "var(--color-red)" }}>
              {error}
            </p>
          )}
          <button
            className="btn-analyze"
            onClick={save}
            disabled={saving || (!googleSpend && !linkedinSpend)}
          >
            {saving ? "Guardando…" : "Guardar"}
          </button>
          <div className="config-note">
            Meta se sincroniza automático desde el Business Manager de Admisien. Este panel lo
            administra el propio equipo del cliente — no depende de que Admisien lo actualice cada
            semana.
          </div>
        </div>
      )}
    </>
  );
}
