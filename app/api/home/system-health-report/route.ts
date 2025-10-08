import { NextRequest, NextResponse } from "next/server";
import { collectSystemHealthData } from "@/utils/service/home/system-health-collector";
import { generateSystemHealthPDF } from "@/utils/common/reports/system-health-pdf-generator-simple";

export const dynamic = "force-dynamic";
export const maxDuration = 300;


export async function GET(request: NextRequest) {
  try {

    const reportData = await collectSystemHealthData();


    const doc = await generateSystemHealthPDF(reportData);


    const pdfBuffer = doc.output("arraybuffer");


    const now = new Date();
    const dateStr = now
      .toISOString()
      .replace(/[:.]/g, "-")
      .substring(0, 19);
    const fileName = `system_health_report_${dateStr}.pdf`;


    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": pdfBuffer.byteLength.toString(),
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
      },
    });
  } catch (error: any) {
    console.error("Error generating system health report:", error);


    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate system health report",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

