"use client";

export type ProcessOption = { name: string; closed: boolean };

type Props = {
  processes: ProcessOption[];
  value: string;
  onChange: (value: string) => void;
};

export function ProcessSelect({ processes, value, onChange }: Props) {
  return (
    <select className="select-native" value={value} onChange={(e) => onChange(e.target.value)}>
      {processes.map((p) => (
        <option key={p.name} value={p.name}>
          {p.name}
          {p.closed ? " (cerrado)" : ""}
        </option>
      ))}
    </select>
  );
}
