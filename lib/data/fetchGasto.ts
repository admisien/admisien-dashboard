import { readSheetTab, rowsToObjects } from "@/lib/google-sheets";
import { parseSheetDate, parseSheetNumber } from "@/lib/data/parseSheetValue";
import type { CanalPago, GastoManual } from "@/types";

const VALID_CANALES_PAGO: CanalPago[] = ["google", "linkedin"];

/**
 * Lee "Gasto_manual" completa. Es un historial (append-only) — cada fila es una
 * carga puntual, no un acumulado. lib/data/aggregate.ts decide cuál usar (la más
 * reciente por institución+canal) al armar el costo por canal.
 */
export async function fetchGasto(): Promise<GastoManual[]> {
  const rows = await readSheetTab("Gasto_manual");
  const records = rowsToObjects(rows);

  return records
    .map((r): GastoManual | null => {
      const institucion = r.institucion?.trim();
      const canal = r.canal?.trim().toLowerCase() as CanalPago;
      const fecha_carga = parseSheetDate(r.fecha_carga);

      if (!institucion || !VALID_CANALES_PAGO.includes(canal) || !fecha_carga) return null;

      return {
        institucion,
        canal,
        monto: parseSheetNumber(r.monto),
        fecha_carga,
      };
    })
    .filter((g): g is GastoManual => g !== null);
}
