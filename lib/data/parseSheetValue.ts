// Helpers de parseo de valores crudos (strings) que vienen de Google Sheets.
// El API devuelve por defecto el valor formateado tal como se ve en la celda,
// así que hay que tolerar tanto ISO (2026-07-08) como el formato es-CL
// (08-07-2026 / 08/07/2026) que Sheets suele mostrar por defecto en Chile.

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}/;
const DMY_RE = /^(\d{1,2})[/-](\d{1,2})[/-](\d{4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/;

export function parseSheetDate(value: string | undefined | null): Date | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (ISO_DATE_RE.test(trimmed)) {
    const d = new Date(trimmed);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const dmy = trimmed.match(DMY_RE);
  if (dmy) {
    const [, day, month, year, hour = "0", minute = "0", second = "0"] = dmy;
    const d = new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
      Number(hour),
      Number(minute),
      Number(second)
    );
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const fallback = new Date(trimmed);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

export function parseSheetNumber(value: string | undefined | null): number {
  if (!value) return 0;
  const cleaned = value.replace(/[^\d.-]/g, "");
  if (!cleaned) return 0;
  const n = Number(cleaned);
  return Number.isNaN(n) ? 0 : n;
}

export function parseSheetBoolean(value: string | undefined | null): boolean {
  if (!value) return false;
  return /^(true|si|sí|1|verdadero)$/i.test(value.trim());
}
