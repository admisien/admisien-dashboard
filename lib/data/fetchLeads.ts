import { readSheetTab, rowsToObjects } from "@/lib/google-sheets";
import { parseSheetDate } from "@/lib/data/parseSheetValue";
import type { Canal, EstadoLead, Lead } from "@/types";

const VALID_CANALES: Canal[] = ["meta", "google", "linkedin", "organico"];
const VALID_ESTADOS: EstadoLead[] = ["sin_contactar", "contactado", "postulante", "matriculado"];

/**
 * Lee la pestaña "Leads" completa. El filtrado por institución/programa/proceso/
 * fecha se hace después, en lib/data/aggregate.ts — este fetcher solo mapea y
 * descarta filas inválidas (canal o estado fuera del enum, campos clave vacíos).
 */
export async function fetchLeads(): Promise<Lead[]> {
  const rows = await readSheetTab("Leads");
  const records = rowsToObjects(rows);

  return records
    .map((r): Lead | null => {
      const institucion = r.institucion?.trim();
      const programa = r.programa?.trim();
      const proceso = r.proceso?.trim();
      const canal = r.canal?.trim().toLowerCase() as Canal;
      const estado = r.estado?.trim().toLowerCase() as EstadoLead;

      if (!institucion || !programa || !proceso) return null;
      if (!VALID_CANALES.includes(canal)) return null;
      if (!VALID_ESTADOS.includes(estado)) return null;

      const fecha_ingreso = parseSheetDate(r.fecha_ingreso);
      if (!fecha_ingreso) return null;

      return {
        institucion,
        programa,
        proceso,
        canal,
        fecha_ingreso,
        fecha_primer_contacto: parseSheetDate(r.fecha_primer_contacto),
        fecha_postulacion: parseSheetDate(r.fecha_postulacion),
        fecha_matricula: parseSheetDate(r.fecha_matricula),
        estado,
      };
    })
    .filter((lead): lead is Lead => lead !== null);
}
