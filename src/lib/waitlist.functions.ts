import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const SPREADSHEET_ID = "1WDvXCLaiDJoeZVozqJ8Iwon0KLnuNE2rHbvkUC769H4";
const RANGE = "Waitlist!A:C";
const GATEWAY_URL = "https://connector-gateway.lovable.dev/google_sheets/v4";

const inputSchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(120),
});

export const appendWaitlistToSheet = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const lovableKey = process.env.LOVABLE_API_KEY;
    const sheetsKey = process.env.GOOGLE_SHEETS_API_KEY;
    if (!lovableKey || !sheetsKey) {
      throw new Error("Google Sheets connector is not configured");
    }

    const url = `${GATEWAY_URL}/spreadsheets/${SPREADSHEET_ID}/values/${RANGE}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": sheetsKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        values: [[new Date().toISOString(), data.name, data.email]],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("Sheets append failed", res.status, body);
      throw new Error(`Sheets append failed: ${res.status}`);
    }

    return { ok: true };
  });
