import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { fetchLeads } from "@/lib/data/fetchLeads";
import { fetchProgramsConfig } from "@/lib/data/fetchProgramsConfig";
import { fetchGasto } from "@/lib/data/fetchGasto";
import { buildDashboardData } from "@/lib/data/aggregate";
import type { DatePreset, FilterParams } from "@/types";

const VALID_PRESETS: DatePreset[] = [
  "Hoy",
  "Últimos 3 días",
  "Últimos 7 días",
  "Procesos abiertos",
  "Todos los procesos",
  "Personalizado",
];

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.institucion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  const programasParam = searchParams.get("programas");
  const programas = programasParam ? programasParam.split(",").map((p) => p.trim()).filter(Boolean) : ["Todos los programas"];

  const proceso = searchParams.get("proceso") ?? undefined;

  const presetParam = searchParams.get("preset") ?? "Procesos abiertos";
  if (!VALID_PRESETS.includes(presetParam as DatePreset)) {
    return NextResponse.json({ error: `preset inválido: ${presetParam}` }, { status: 400 });
  }
  const preset = presetParam as DatePreset;

  const dateFrom = searchParams.get("dateFrom") ?? undefined;
  const dateTo = searchParams.get("dateTo") ?? undefined;

  if (preset === "Personalizado" && (!dateFrom || !dateTo)) {
    return NextResponse.json(
      { error: "preset 'Personalizado' requiere dateFrom y dateTo" },
      { status: 400 }
    );
  }

  const filters: FilterParams = {
    // La institución viene de la sesión, no del query param — un usuario no
    // puede pedir datos de otra institución solo cambiando la URL.
    institucion: session.user.institucion,
    programas,
    proceso,
    preset,
    dateFrom,
    dateTo,
  };

  try {
    const [leads, programsConfig, gasto] = await Promise.all([
      fetchLeads(),
      fetchProgramsConfig(),
      fetchGasto(),
    ]);

    const data = buildDashboardData(filters, leads, programsConfig, gasto);
    return NextResponse.json(data);
  } catch (err) {
    console.error("[/api/dashboard] error al construir el dataset:", err);
    return NextResponse.json({ error: "Error al leer datos de Google Sheets" }, { status: 502 });
  }
}
