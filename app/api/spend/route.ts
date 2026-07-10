import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { appendRows } from "@/lib/google-sheets";
import type { CanalPago } from "@/types";

const VALID_CANALES: CanalPago[] = ["google", "linkedin"];

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.institucion) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const canal = body?.canal;
  const monto = Number(body?.monto);

  if (!VALID_CANALES.includes(canal)) {
    return NextResponse.json({ error: `canal inválido: ${canal}` }, { status: 400 });
  }
  if (!Number.isFinite(monto) || monto <= 0) {
    return NextResponse.json({ error: "monto debe ser un número positivo" }, { status: 400 });
  }

  // Append-only: cada carga queda como una fila nueva, nunca sobrescribe la anterior.
  await appendRows("Gasto_manual", [[session.user.institucion, canal, monto, new Date().toISOString()]]);

  return NextResponse.json({ ok: true });
}
