import { NextRequest, NextResponse } from "next/server";
import { syncKnowledgeBase } from "@/lib/integrations/wordpress/sync";

/**
 * Vercel Cron endpoint for automatic WordPress KB synchronization.
 * Protected by CRON_SECRET header check.
 * Schedule configured in vercel.json: daily at 06:00 UTC.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await syncKnowledgeBase("CRON");
    return NextResponse.json({
      success: true,
      totalFetched: result.totalFetched,
      added: result.added,
      updated: result.updated,
      deactivated: result.deactivated,
    });
  } catch (error: any) {
    console.error("Cron KB sync failed:", error);
    return NextResponse.json(
      { success: false, error: "Sync failed" },
      { status: 500 }
    );
  }
}
