import { NextRequest, NextResponse } from "next/server";
import { collectOperatingRateReportData } from "@/utils/service/home/operating-rate-collector";
import { generateOperatingRatePDF } from "@/utils/common/reports/operating-rate-pdf-generator";

export const dynamic = "force-dynamic";
export const maxDuration = 300; 


export async function GET(request: NextRequest) {
  try {
    
    const reportData = await collectOperatingRateReportData();

   
    const doc = await generateOperatingRatePDF(reportData);

   
    const pdfBuffer = doc.output("arraybuffer");

   
    const now = new Date();
    const dateStr = now
      .toISOString()
      .replace(/[:.]/g, "-")
      .substring(0, 19);
    const fileName = `operating_rate_report_${dateStr}.pdf`;

    
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
    console.error("Error generating operating rate report:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate operating rate report",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
