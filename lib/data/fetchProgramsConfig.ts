import { readSheetTab, rowsToObjects } from "@/lib/google-sheets";
import { parseSheetBoolean, parseSheetDate } from "@/lib/data/parseSheetValue";
import type { Cadencia, ProgramaConfig } from "@/types";

const VALID_CADENCIAS: Cadencia[] = ["Mensual", "Trimestral", "Semestral"];

export async function fetchProgramsConfig(): Promise<ProgramaConfig[]> {
  const rows = await readSheetTab("Programas_config");
  const records = rowsToObjects(rows);

  return records
    .map((r): ProgramaConfig | null => {
      const institucion = r.institucion?.trim();
      const programa = r.programa?.trim();
      const cadencia = r.cadencia?.trim() as Cadencia;
      const nombre_proceso = r.nombre_proceso?.trim();

      if (!institucion || !programa || !nombre_proceso) return null;
      if (!VALID_CADENCIAS.includes(cadencia)) return null;

      return {
        institucion,
        programa,
        cadencia,
        nombre_proceso,
        fecha_inicio: parseSheetDate(r.fecha_inicio) ?? new Date(0),
        fecha_fin: parseSheetDate(r.fecha_fin) ?? new Date(0),
        cerrado: parseSheetBoolean(r.cerrado),
      };
    })
    .filter((p): p is ProgramaConfig => p !== null);
}
