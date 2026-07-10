import { readSheetTab, rowsToObjects } from "@/lib/google-sheets";
import type { Usuario } from "@/types";

/**
 * Lee "Usuarios" (email -> institución). Todavía no valida contraseña contra
 * nada real: la pestaña no tiene columna de password. Cualquier password no
 * vacío pasa mientras el email exista en esta pestaña — ver nota en lib/auth.ts.
 */
export async function fetchUsuarios(): Promise<Usuario[]> {
  const rows = await readSheetTab("Usuarios");
  const records = rowsToObjects(rows);

  return records
    .map((r): Usuario | null => {
      const email = r.email?.trim().toLowerCase();
      const institucion = r.institucion?.trim();
      if (!email || !institucion) return null;
      return { email, institucion };
    })
    .filter((u): u is Usuario => u !== null);
}
