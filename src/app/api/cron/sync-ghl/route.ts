import { NextResponse } from "next/server";
import { runGhlSync } from "@/lib/integrations/ghl/sync";

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const isCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;

    const { searchParams } = new URL(req.url);
    const isManual = searchParams.get("manual") === "1";

    if (!isCron && !isManual) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Run GHL sync. Controlled limit to avoid timeout or backfill.
    const result = await runGhlSync({
      limit: isCron ? 100 : 10,
      triggeredBy: isCron ? "CRON" : "MANUAL",
    });

    if (result.success) {
      return NextResponse.json({ success: true, result });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || "GHL sync failed." },
        { status: 500 }
      );
    }
  } catch {
    console.error("Critical Route Error during GHL Sync.");
    return NextResponse.json(
      { success: false, error: "GHL sync failed." },
      { status: 500 }
    );
  }
}
