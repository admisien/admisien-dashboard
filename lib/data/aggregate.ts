import { previousEquivalentRange, resolveDateRange, type ResolvedRange } from "@/lib/data/dateFilters";
import type {
  Canal,
  CanalPago,
  DashboardData,
  FilterParams,
  GastoManual,
  Lead,
  ProgramaConfig,
} from "@/types";

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;

// Referencia interna de tiempo de cierre (días). Editable a futuro por programa/institución.
const BENCH_CLOSE_DAYS = 12;

const CHANNEL_META: { key: Canal; name: string }[] = [
  { key: "meta", name: "Meta" },
  { key: "google", name: "Google Ads" },
  { key: "linkedin", name: "LinkedIn" },
  { key: "organico", name: "Orgánico / IA" },
];

function processKey(programa: string, proceso: string): string {
  return `${programa}|||${proceso}`;
}

function inRange(date: Date, range: ResolvedRange): boolean {
  if (range.from && date < range.from) return false;
  if (range.to && date > range.to) return false;
  return true;
}

function daysBetween(a: Date, b: Date): number {
  return (b.getTime() - a.getTime()) / DAY_MS;
}

type Snapshot = {
  leads: number;
  contacted: number;
  postulantes: number;
  matriculados: number;
  convGlobal: number;
};

function snapshot(list: Lead[]): Snapshot {
  const leads = list.length;
  const contacted = list.filter((l) => l.estado !== "sin_contactar").length;
  const postulantes = list.filter((l) => l.estado === "postulante" || l.estado === "matriculado").length;
  const matriculados = list.filter((l) => l.estado === "matriculado").length;
  const convGlobal = leads > 0 ? (matriculados / leads) * 100 : 0;
  return { leads, contacted, postulantes, matriculados, convGlobal };
}

function pctChange(current: number, previous: number): string {
  if (previous === 0) return (current > 0 ? 100 : 0).toFixed(1);
  return (((current - previous) / previous) * 100).toFixed(1);
}

function resolveScopePrograms(filters: FilterParams, programsConfig: ProgramaConfig[]): string[] {
  if (filters.programas.length === 0 || filters.programas.includes("Todos los programas")) {
    const set = new Set(
      programsConfig.filter((p) => p.institucion === filters.institucion).map((p) => p.programa)
    );
    return [...set];
  }
  return filters.programas;
}

/**
 * Reemplaza buildDataset/buildAggregate del prototipo HTML, con datos reales del Sheet
 * en vez de números seedeados. Mantiene la misma forma de salida (DashboardData) para
 * que los componentes de UI no tengan que cambiar de contrato.
 */
export function buildDashboardData(
  filters: FilterParams,
  leads: Lead[],
  programsConfig: ProgramaConfig[],
  gasto: GastoManual[],
  now: Date = new Date()
): DashboardData {
  const scopePrograms = resolveScopePrograms(filters, programsConfig);

  const openProcessKeys = new Set(
    programsConfig
      .filter((p) => p.institucion === filters.institucion && !p.cerrado)
      .map((p) => processKey(p.programa, p.nombre_proceso))
  );

  // Leads del scope institución+programas+proceso, SIN acotar todavía por fecha.
  // Se usa tal cual para: alertas en vivo (48h, caída de contacto) y la serie
  // semanal de tendencia, que siempre muestra las últimas 7 semanas del scope
  // independiente del preset de fecha elegido para las KPIs.
  let scopeLeads = leads.filter(
    (l) => l.institucion === filters.institucion && scopePrograms.includes(l.programa)
  );

  if (filters.proceso) {
    scopeLeads = scopeLeads.filter((l) => l.proceso === filters.proceso);
  } else if (filters.preset === "Procesos abiertos") {
    scopeLeads = scopeLeads.filter((l) => openProcessKeys.has(processKey(l.programa, l.proceso)));
  }
  // "Todos los procesos", o presets de fecha explícita sin proceso puntual: sin
  // restricción adicional — el rango de fecha es lo que agrupa (ver Fase 1).

  const range = resolveDateRange(filters.preset, filters.dateFrom, filters.dateTo, now);
  const currentLeads = range.from || range.to ? scopeLeads.filter((l) => inRange(l.fecha_ingreso, range)) : scopeLeads;

  const prevRange = previousEquivalentRange(range, now);
  const previousLeads = scopeLeads.filter((l) => inRange(l.fecha_ingreso, prevRange));

  const current = snapshot(currentLeads);
  const previous = snapshot(previousLeads);

  const deltas = {
    leads: pctChange(current.leads, previous.leads),
    postulantes: pctChange(current.postulantes, previous.postulantes),
    matriculados: pctChange(current.matriculados, previous.matriculados),
    conv: pctChange(current.convGlobal, previous.convGlobal),
  };

  // Alertas en vivo: no dependen del rango de fecha de las KPIs, reflejan el
  // estado actual del scope (institución+programas+proceso).
  const cutoff48h = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  const uncontacted48h = scopeLeads.filter(
    (l) => l.estado === "sin_contactar" && l.fecha_ingreso <= cutoff48h
  ).length;

  const last7Range: ResolvedRange = { from: new Date(now.getTime() - WEEK_MS), to: now };
  const prev7Range: ResolvedRange = {
    from: new Date(now.getTime() - 2 * WEEK_MS),
    to: new Date(now.getTime() - WEEK_MS),
  };
  const last7 = scopeLeads.filter((l) => inRange(l.fecha_ingreso, last7Range));
  const prev7 = scopeLeads.filter((l) => inRange(l.fecha_ingreso, prev7Range));
  const rateLast7 = last7.length > 0 ? snapshot(last7).contacted / last7.length : 0;
  const ratePrev7 = prev7.length > 0 ? snapshot(prev7).contacted / prev7.length : 0;
  const contactDrop = Math.max(0, Math.round((ratePrev7 - rateLast7) * 100));

  // Tiempo de cierre: primer contacto -> matrícula, sobre los matriculados del rango actual.
  const closedLeads = currentLeads.filter((l) => l.fecha_primer_contacto && l.fecha_matricula);
  const closeDays =
    closedLeads.length > 0
      ? closedLeads.reduce((sum, l) => sum + daysBetween(l.fecha_primer_contacto as Date, l.fecha_matricula as Date), 0) /
        closedLeads.length
      : 0;

  // Conversión por programa, sobre el mismo rango que las KPIs principales.
  const progConv = scopePrograms
    .map((programa) => {
      const programLeads = currentLeads.filter((l) => l.programa === programa);
      const s = snapshot(programLeads);
      return { name: programa, value: Math.round(s.convGlobal) };
    })
    .sort((a, b) => b.value - a.value);

  // Canales: sobre el rango actual de las KPIs.
  const channelData = CHANNEL_META.map((c) => ({
    name: c.name,
    key: c.key,
    leads: currentLeads.filter((l) => l.canal === c.key).length,
  }));

  const costData = CHANNEL_META.filter((c) => c.key !== "organico").map((c) => {
    const leadsForChannel = channelData.find((ch) => ch.key === c.key)?.leads ?? 0;

    if (c.key === "meta") {
      return {
        name: c.name,
        key: "meta" as const,
        leads: leadsForChannel,
        spend: 0,
        cpl: 0,
        source: "Pendiente integración Meta (Business Manager)",
      };
    }

    const canalPago = c.key as CanalPago;
    const entries = gasto.filter((g) => g.institucion === filters.institucion && g.canal === canalPago);
    const latest = entries.sort((a, b) => b.fecha_carga.getTime() - a.fecha_carga.getTime())[0];
    const spend = latest?.monto ?? 0;
    const cpl = leadsForChannel > 0 ? Math.round(spend / leadsForChannel) : 0;
    const source = latest
      ? `Manual (cargado por cliente, ${latest.fecha_carga.toLocaleDateString("es-CL")})`
      : "Manual (sin cargar)";

    return { name: c.name, key: canalPago, leads: leadsForChannel, spend, cpl, source };
  });

  // Serie semanal de tendencia: últimas 7 semanas del scope, sin acotar por el
  // preset de fecha de las KPIs (siempre muestra la tendencia reciente).
  const weekBuckets = Array.from({ length: 7 }, (_, i) => {
    const end = new Date(now.getTime() - (6 - i) * WEEK_MS);
    const start = new Date(end.getTime() - WEEK_MS);
    return { start, end, label: `S${i + 1}` };
  });

  const weeks = weekBuckets.map((w) => w.label);
  const leadsSeries = weekBuckets.map(
    (w) => scopeLeads.filter((l) => l.fecha_ingreso >= w.start && l.fecha_ingreso < w.end).length
  );
  const matSeries = weekBuckets.map(
    (w) =>
      scopeLeads.filter((l) => l.fecha_matricula && l.fecha_matricula >= w.start && l.fecha_matricula < w.end)
        .length
  );
  const convSeries = weekBuckets.map((_, i) => (leadsSeries[i] > 0 ? Number(((matSeries[i] / leadsSeries[i]) * 100).toFixed(1)) : 0));

  const lowestProg = progConv[progConv.length - 1] ?? { name: "—", value: 0 };
  const topProg = progConv[0] ?? { name: "—", value: 0 };

  return {
    leads: current.leads,
    contacted: current.contacted,
    postulantes: current.postulantes,
    matriculados: current.matriculados,
    convGlobal: current.convGlobal.toFixed(1),
    deltas,
    uncontacted48h,
    contactDrop,
    closeDays,
    benchClose: BENCH_CLOSE_DAYS,
    channelData,
    costData,
    progConv,
    weeks,
    leadsSeries,
    matSeries,
    convSeries,
    lowestProg,
    topProg,
  };
}
