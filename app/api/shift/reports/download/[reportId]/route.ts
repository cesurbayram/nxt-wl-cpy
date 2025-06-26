import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { reportId: string } }
) {
  try {
    const { reportId } = params;

    if (!reportId) {
      return NextResponse.json(
        { message: "Report ID is required" },
        { status: 400 }
      );
    }

    const result = await dbPool.query(
      `SELECT 
        gr.id,
        gr.report_name,
        gr.file_path,
        gr.format,
        gr.status
      FROM generated_reports gr
      WHERE gr.id = $1`,
      [reportId]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "Report not found" },
        { status: 404 }
      );
    }

    const report = result.rows[0];

    if (report.status !== "completed") {
      return NextResponse.json(
        { message: "Report is not ready for download" },
        { status: 400 }
      );
    }

    if (!report.file_path) {
      return NextResponse.json(
        { message: "Report file not found" },
        { status: 404 }
      );
    }

    const filePath = path.resolve(report.file_path);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { message: "Report file not found on server" },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(filePath);

    let contentType = "application/octet-stream";
    let fileExtension = ".txt";

    switch (report.format.toLowerCase()) {
      case "pdf":
        contentType = "application/pdf";
        fileExtension = ".pdf";
        break;
      case "excel":
        contentType =
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        fileExtension = ".xlsx";
        break;
      case "csv":
        contentType = "text/csv";
        fileExtension = ".csv";
        break;
      case "json":
        contentType = "application/json";
        fileExtension = ".json";
        break;
    }

    const fileName = path.basename(report.file_path);

    const filename =
      fileName.includes("_") && fileName.includes("-")
        ? fileName
        : `${report.report_name
            .replace(/[^a-zA-Z0-9\s]/g, "_")
            .replace(/\s+/g, "_")
            .toLowerCase()}_${
            new Date().toISOString().split("T")[0]
          }_${new Date()
            .toTimeString()
            .split(" ")[0]
            .replace(/:/g, "-")}${fileExtension}`;

    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": fileBuffer.length.toString(),
      },
    });
  } catch (error: any) {
    console.error("Error downloading report:", error.message);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
