"use client";

import { useEffect, useRef, useState } from "react";
import type { Cadencia } from "@/types";

const ALL = "Todos los programas";

type Props = {
  programs: string[];
  cadenceByProgram: Record<string, Cadencia>;
  selected: string[];
  onChange: (next: string[]) => void;
};

export function ProgramMultiSelect({ programs, cadenceByProgram, selected, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  function toggle(p: string) {
    if (p === ALL) {
      onChange([ALL]);
      setOpen(true);
      return;
    }
    let next = selected.filter((x) => x !== ALL);
    if (next.includes(p)) {
      next = next.filter((x) => x !== p);
      if (next.length === 0) next = [ALL];
    } else {
      next = [...next, p];
    }
    onChange(next);
  }

  const allChecked = selected.includes(ALL);
  const label = allChecked
    ? ALL
    : selected.length === 1
      ? selected[0]
      : `${selected.length} programas seleccionados`;

  return (
    <div className="relative" ref={ref}>
      <button type="button" className="multi-select-btn" onClick={() => setOpen((o) => !o)}>
        {label} <span className="text-[10px] text-[var(--color-text-dimmer)]">▾</span>
      </button>
      {open && (
        <div className="multi-select-panel">
          <div className={`ms-option ${allChecked ? "checked" : ""}`} onClick={() => toggle(ALL)}>
            <div className="ms-check">{allChecked ? "✓" : ""}</div> {ALL}
          </div>
          <div className="ms-divider" />
          {programs.map((p) => {
            const checked = selected.includes(p);
            return (
              <div key={p} className={`ms-option ${checked ? "checked" : ""}`} onClick={() => toggle(p)}>
                <div className="ms-check">{checked ? "✓" : ""}</div>
                <span>{p}</span>
                <span className="ml-auto text-[10.5px] text-[var(--color-text-dimmer)]">
                  {cadenceByProgram[p]}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
