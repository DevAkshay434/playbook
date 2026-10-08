import { NextResponse } from "next/server";
import { runRichpanelSync } from "@/lib/integrations/richpanel/sync";

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const isManual = searchParams.get('manual') === '1';
    
    // Explicit hard limit of 10 for the controlled sync test
    const result = await runRichpanelSync({ limit: isManual ? 10 : 30 });
    
    if (result.success) {
      return NextResponse.json({ success: true, result });
    } else {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
