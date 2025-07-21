import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";
import { collectReportData } from "@/utils/service/reports/data-collecter";
import { generateReportFile } from "@/utils/service/reports/report-genarator";
import { NotificationService } from "@/utils/service/notification";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const client = await dbPool.connect();

  try {
    const requestBody = await request.json();
    const { report_type_id, report_name, description, parameters, format } =
      requestBody;

    if (!report_type_id || !report_name || !format) {
      return NextResponse.json(
        { message: "Report type ID, name, and format are required" },
        { status: 400 }
      );
    }

    const normalizedFormat = format.toLowerCase();
    if (!["pdf", "excel", "csv"].includes(normalizedFormat)) {
      return NextResponse.json(
        { message: "Invalid format. Must be pdf, excel, or csv" },
        { status: 400 }
      );
    }

    const reportTypeResult = await client.query(
      `SELECT rt.*, c.name as category_name 
       FROM report_types rt
       LEFT JOIN report_categories c ON rt.category_id = c.id
       WHERE rt.id = $1`,
      [report_type_id]
    );

    if (reportTypeResult.rows.length === 0) {
      return NextResponse.json(
        { message: "Report type not found" },
        { status: 404 }
      );
    }

    const reportType = reportTypeResult.rows[0];

    const reportId = crypto.randomUUID();

    let serializedParameters = "{}";
    try {
      serializedParameters = JSON.stringify(parameters || {});
    } catch (serializeError) {
      console.error("Error serializing parameters:", serializeError);

      const safeParameters = {
        ...(parameters && typeof parameters === "object" ? parameters : {}),

        toString: undefined,
        valueOf: undefined,
      };
      serializedParameters = JSON.stringify(safeParameters);
    }

    await client.query(
      `INSERT INTO generated_reports (id, user_id, report_type_id, report_name, parameters, format, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        reportId,
        "system_user",
        report_type_id,
        report_name,
        serializedParameters,
        normalizedFormat,
        "processing",
      ]
    );

    processReportGeneration(
      reportId,
      reportType,
      parameters,
      normalizedFormat,
      description
    );

    try {
      await NotificationService.notifyReportGenerated(
        reportId,
        report_name,
        normalizedFormat
      );
    } catch (notificationError) {
      console.error("Failed to send notification:", notificationError);
    }

    return NextResponse.json(
      {
        report_id: reportId,
        status: "processing",
        message: "Report generation started",
      },
      { status: 202 }
    );
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("Error generating report:", error.message);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
async function processReportGeneration(
  reportId: string,
  reportType: any,
  parameters: any,
  format: string,
  description?: string
) {
  const client = await dbPool.connect();

  try {
    await client.query(
      `UPDATE generated_reports SET status = 'processing' WHERE id = $1`,
      [reportId]
    );

    const reportData = await collectReportData(
      reportType,
      parameters,
      description
    );

    const filePath = await generateReportFile(reportData, format, reportId);

    await client.query(
      `UPDATE generated_reports 
       SET file_path = $1, status = 'completed' 
       WHERE id = $2`,
      [filePath, reportId]
    );

    try {
      const fileName = filePath.split("/").pop() || "report";
      await NotificationService.notifyReportReady(
        reportId,
        reportType.name,
        format,
        fileName
      );
    } catch (notificationError) {
      console.error("Failed to send notification:", notificationError);
    }
  } catch (error: any) {
    console.error("Error in background report generation:", error);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    await client.query(
      `UPDATE generated_reports SET status = 'failed' WHERE id = $1`,
      [reportId]
    );

    try {
      await NotificationService.notifyReportFailed(
        reportId,
        reportType.name,
        error.message
      );
    } catch (notificationError) {
      console.error("Failed to send notification:", notificationError);
    }
  } finally {
    client.release();
  }
}
