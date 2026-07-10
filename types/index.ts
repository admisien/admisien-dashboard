// ---------- Entidades del Google Sheet ----------

export type Canal = "meta" | "google" | "linkedin" | "organico";

export type EstadoLead = "sin_contactar" | "contactado" | "postulante" | "matriculado";

export type Lead = {
  institucion: string;
  programa: string;
  proceso: string;
  canal: Canal;
  fecha_ingreso: Date;
  fecha_primer_contacto: Date | null;
  fecha_postulacion: Date | null;
  fecha_matricula: Date | null;
  estado: EstadoLead;
};

export type Cadencia = "Mensual" | "Trimestral" | "Semestral";

export type ProgramaConfig = {
  institucion: string;
  programa: string;
  cadencia: Cadencia;
  nombre_proceso: string;
  fecha_inicio: Date;
  fecha_fin: Date;
  cerrado: boolean;
};

export type CanalPago = "google" | "linkedin";

export type GastoManual = {
  institucion: string;
  canal: CanalPago;
  monto: number;
  fecha_carga: Date;
};

export type Usuario = {
  email: string;
  institucion: string;
};

// ---------- Contrato de datos agregados para el dashboard ----------

export type DashboardData = {
  leads: number;
  contacted: number;
  postulantes: number;
  matriculados: number;
  convGlobal: string; // porcentaje, ej "8.1"
  deltas: {
    leads: string;
    postulantes: string;
    matriculados: string;
    conv: string;
  };
  uncontacted48h: number;
  contactDrop: number;
  closeDays: number;
  benchClose: number;
  channelData: Array<{ name: string; key: Canal; leads: number }>;
  costData: Array<{
    name: string;
    key: CanalPago | "meta";
    leads: number;
    spend: number;
    cpl: number;
    source: string;
    updatedAt?: string; // "Hace 3h", "Hace 2 días", etc.
  }>;
  progConv: Array<{ name: string; value: number }>;
  weeks: string[];
  leadsSeries: number[];
  matSeries: number[];
  convSeries: number[];
  lowestProg: { name: string; value: number };
  topProg: { name: string; value: number };
};

// ---------- Filtros que arma el frontend y consume el backend ----------

export type DatePreset =
  | "Hoy"
  | "Últimos 3 días"
  | "Últimos 7 días"
  | "Procesos abiertos"
  | "Todos los procesos"
  | "Personalizado";

export type FilterParams = {
  institucion: string;
  programas: string[]; // ["Todos los programas"] o lista específica
  proceso?: string; // undefined si está oculto (multi-programa con cadencias distintas, o preset agregado)
  preset: DatePreset;
  dateFrom?: string; // ISO date, solo si preset === "Personalizado"
  dateTo?: string;
};
