import { google } from "googleapis";

// Cliente genérico de Google Sheets vía Service Account.
// No conoce el modelo de negocio (Lead, ProgramaConfig, etc.) — eso vive en lib/data/*.
// Solo sabe leer y escribir rangos de una hoja, en filas de strings crudas.

function getAuth() {
  const email = process.env.GOOGLE_SHEETS_EMAIL;
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!email || !privateKey) {
    throw new Error(
      "Faltan GOOGLE_SHEETS_EMAIL o GOOGLE_SHEETS_PRIVATE_KEY en las variables de entorno."
    );
  }

  return new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

function getSheetsClient() {
  return google.sheets({ version: "v4", auth: getAuth() });
}

function getSheetId() {
  const id = process.env.GOOGLE_SHEETS_ID;
  if (!id) throw new Error("Falta GOOGLE_SHEETS_ID en las variables de entorno.");
  return id;
}

/**
 * Lee todas las filas de una pestaña (incluida la fila de encabezado).
 * `tabName` es el nombre exacto de la pestaña en el Sheet, ej. "Leads".
 */
export async function readSheetTab(tabName: string): Promise<string[][]> {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: getSheetId(),
    range: tabName,
  });
  return (res.data.values as string[][]) ?? [];
}

/**
 * Lee un rango explícito, ej. "Leads!A2:I".
 */
export async function readRange(range: string): Promise<string[][]> {
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: getSheetId(),
    range,
  });
  return (res.data.values as string[][]) ?? [];
}

/**
 * Agrega una o más filas al final de una pestaña, sin sobrescribir lo existente.
 * Se usa para "Gasto_manual", que necesita historial en vez de overwrite.
 */
export async function appendRows(tabName: string, rows: (string | number)[][]): Promise<void> {
  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: getSheetId(),
    range: tabName,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: rows },
  });
}

/**
 * Sobrescribe un rango explícito, ej. "Programas_config!G2:G5" para marcar procesos cerrados.
 * Uso puntual — la mayoría de las pestañas de este proyecto solo se leen o se les hace append.
 */
export async function writeRange(range: string, rows: (string | number)[][]): Promise<void> {
  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.update({
    spreadsheetId: getSheetId(),
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: rows },
  });
}

/**
 * Convierte filas crudas (primera fila = encabezado) en objetos { encabezado: valor }.
 * Sigue siendo genérico de spreadsheet, no conoce Lead/ProgramaConfig/etc.
 */
export function rowsToObjects(rows: string[][]): Record<string, string>[] {
  if (rows.length === 0) return [];
  const [header, ...body] = rows;
  const keys = header.map((h) => h.trim());
  return body.map((row) => {
    const record: Record<string, string> = {};
    keys.forEach((key, i) => {
      record[key] = row[i] ?? "";
    });
    return record;
  });
}
