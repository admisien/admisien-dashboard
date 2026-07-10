import type { DatePreset } from "@/types";

export type ResolvedRange = { from: Date | null; to: Date | null };

const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function endOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

/**
 * "Procesos abiertos" y "Todos los procesos" no acotan por fecha_ingreso — acotan
 * por el estado del proceso (abierto/cerrado en Programas_config), eso se resuelve
 * en aggregate.ts. El resto de los presets sí filtran leads por fecha_ingreso.
 */
export function resolveDateRange(
  preset: DatePreset,
  dateFrom?: string,
  dateTo?: string,
  now: Date = new Date()
): ResolvedRange {
  switch (preset) {
    case "Hoy":
      return { from: startOfDay(now), to: endOfDay(now) };
    case "Últimos 3 días":
      return { from: startOfDay(new Date(now.getTime() - 3 * DAY_MS)), to: endOfDay(now) };
    case "Últimos 7 días":
      return { from: startOfDay(new Date(now.getTime() - 7 * DAY_MS)), to: endOfDay(now) };
    case "Personalizado":
      return {
        from: dateFrom ? startOfDay(new Date(dateFrom)) : null,
        to: dateTo ? endOfDay(new Date(dateTo)) : null,
      };
    case "Procesos abiertos":
    case "Todos los procesos":
    default:
      return { from: null, to: null };
  }
}

/**
 * Rango inmediatamente anterior, de la misma duración, para calcular deltas.
 * Si el preset no tiene rango explícito (Procesos abiertos / Todos los procesos),
 * usamos los últimos 7 días vs. los 7 días previos como ventana de comparación
 * por defecto — no hay un "período anterior" natural para esos scopes.
 */
export function previousEquivalentRange(range: ResolvedRange, now: Date = new Date()): ResolvedRange {
  if (!range.from || !range.to) {
    const from = startOfDay(new Date(now.getTime() - 7 * DAY_MS));
    const prevTo = new Date(from.getTime() - 1);
    const prevFrom = new Date(from.getTime() - 7 * DAY_MS);
    return { from: prevFrom, to: prevTo };
  }
  const durationMs = range.to.getTime() - range.from.getTime();
  const prevTo = new Date(range.from.getTime() - 1);
  const prevFrom = new Date(prevTo.getTime() - durationMs);
  return { from: prevFrom, to: prevTo };
}
