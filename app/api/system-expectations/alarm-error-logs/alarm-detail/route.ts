import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";
import { SystemAlarmDetail } from "@/types/alarm-error.types";
import * as fs from "fs";
import * as path from "path";
import { parse } from "csv-parse/sync";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const controllerId = searchParams.get("controllerId");
  const alarmCode = searchParams.get("code");

  if (!controllerId || !alarmCode) {
    return NextResponse.json(
      { message: "Missing controllerId or code parameter" },
      { status: 400 }
    );
  }

  try {
    const controllerRes = await dbPool.query(
      `SELECT model FROM controller WHERE id = $1`,
      [controllerId]
    );

    if (controllerRes.rowCount === 0) {
      return NextResponse.json(
        { message: "Controller not found" },
        { status: 404 }
      );
    }

    const robotModel = controllerRes.rows[0].model;

    const alarmDetail = await getSystemAlarmDetailFromCSV(
      robotModel,
      alarmCode
    );

    if (!alarmDetail) {
      return NextResponse.json(
        { message: "System alarm detail not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(alarmDetail);
  } catch (error) {
    console.error("Error fetching system alarm detail:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

async function getSystemAlarmDetailFromCSV(
  robotModel: string,
  alarmCode: string
): Promise<SystemAlarmDetail | null> {
  try {
    const csvFileName = getSystemCsvFileName(alarmCode);
    const csvPath = path.join(
      process.cwd(),
      "data",
      "alarm-details",
      robotModel.toUpperCase(),
      csvFileName
    );

    if (!fs.existsSync(csvPath)) {
      console.warn(`System CSV file not found: ${csvPath}`);
      return null;
    }

    let csvContent = fs.readFileSync(csvPath, "utf-8");

    const lines = csvContent.split("\n");

    let headerIndex = -1;
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      if (lines[i].includes("Alarm Number")) {
        headerIndex = i;
        break;
      }
    }

    if (headerIndex === -1) {
      return null;
    }

    const cleanLines = lines.slice(headerIndex);
    csvContent = cleanLines.join("\n");

    const records = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });

    const alarmRecord = records.find(
      (record: any) =>
        record["Alarm Number"] === alarmCode ||
        record.code === alarmCode ||
        record.Code === alarmCode
    );

    if (!alarmRecord) {
      return null;
    }

    const alarmDetail: SystemAlarmDetail = {
      code: alarmCode,
      name: alarmRecord["Alarm Name/Message"] || alarmRecord.name || "",
      description: alarmRecord["Contents"] || alarmRecord.description || "",
      solution: alarmRecord["Remedy"] || alarmRecord.solution || "",
      causes: parseSystemCsvArray(
        alarmRecord["Cause"] || alarmRecord.causes || ""
      ),
      preventiveActions: parseSystemCsvArray(
        alarmRecord["Meaning"] || alarmRecord.preventive_actions || ""
      ),
      relatedDocuments: parseSystemCsvArray(
        alarmRecord["Notes"] || alarmRecord.documents || ""
      ),
      severity: mapSystemAlarmNumberToSeverity(alarmCode),
      robotBrand: robotModel,
    };

    return alarmDetail;
  } catch (error) {
    console.error("Error reading system CSV file:", error);
    return null;
  }
}

function getSystemCsvFileName(alarmCode: string): string {
  const code = parseInt(alarmCode);

  if (code >= 0 && code <= 999) return "ALARM0000.csv";
  if (code >= 1000 && code <= 1999) return "ALARM1000.csv";
  if (code >= 2000 && code <= 2999) return "ALARM2000.csv";
  if (code >= 3000 && code <= 3999) return "ALARM3000.csv";
  if (code >= 4000 && code <= 4999) return "ALARM4000.csv";
  if (code >= 5000 && code <= 5999) return "ALARM5000.csv";
  if (code >= 6000 && code <= 6999) return "ALARM6000.csv";
  if (code >= 7000 && code <= 7999) return "ALARM7000.csv";
  if (code >= 8000 && code <= 8999) return "ALARM8000.csv";
  if (code >= 9000 && code <= 9999) return "ALARM9000.csv";

  return "ALARM0000.csv";
}

function parseSystemCsvArray(value: string): string[] {
  if (!value || value.trim() === "") {
    return [];
  }

  return value
    .split(/[;|]/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

function mapSystemAlarmNumberToSeverity(
  alarmCode: string
): "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" {
  const code = parseInt(alarmCode);

  if (code >= 1000 && code <= 1099) return "CRITICAL";
  if (code >= 1100 && code <= 1199) return "HIGH";
  if (code >= 1200 && code <= 1299) return "HIGH";
  if (code >= 1300 && code <= 1399) return "MEDIUM";
  if (code >= 1400 && code <= 1499) return "LOW";
  if (code < 1100) return "CRITICAL";
  if (code < 1300) return "HIGH";
  if (code < 1500) return "MEDIUM";

  return "LOW";
}
