import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";
import fs from "fs";
import path from "path";
import os from "os";
import { LogEntry, LogFileContentResponse } from "@/types/log-content.types";

function parseLogContent(content: string): LogEntry[] {
  const entries: LogEntry[] = [];
  const lines = content.split("\n");

  let currentEntry: Partial<LogEntry> = {};
  let entryLines: string[] = [];
  let isMultiLineValue = false;
  let multiLineKey = "";
  let multiLineContent: string[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith("///INDEX")) {
      if (currentEntry.index !== undefined) {
        if (isMultiLineValue && multiLineContent.length > 0) {
          currentEntry.fields![multiLineKey] = multiLineContent.join("\n");
        }

        entries.push({
          index: currentEntry.index,
          date: currentEntry.date,
          event: currentEntry.event,
          loginName: currentEntry.loginName,
          fields: currentEntry.fields || {},
          rawData: entryLines.join("\n"),
        });

        if (entries.length >= 600) {
          break;
        }
      }

      currentEntry = { fields: {} };
      entryLines = [line];
      isMultiLineValue = false;
      multiLineContent = [];

      const indexMatch = trimmedLine.match(/\/\/\/INDEX\s+(\d+)/);
      if (indexMatch) {
        currentEntry.index = parseInt(indexMatch[1]);
      }
    } else if (trimmedLine.includes(":") && !isMultiLineValue) {
      const colonIndex = trimmedLine.indexOf(":");
      const key = trimmedLine.substring(0, colonIndex).trim();
      const value = trimmedLine.substring(colonIndex + 1).trim();

      if (key === "DATE") {
        currentEntry.date = value;
      } else if (key === "EVENT") {
        currentEntry.event = value;
      } else if (key === "LOGIN NAME") {
        currentEntry.loginName = value;
      } else if (key === "CURR VALUE") {
        isMultiLineValue = true;
        multiLineKey = key;
        multiLineContent = [value];
      } else {
        currentEntry.fields![key] = value;
      }
      entryLines.push(line);
    } else if (isMultiLineValue) {
      if (trimmedLine.length > 0 && !trimmedLine.startsWith("///")) {
        multiLineContent.push(trimmedLine);
      } else if (trimmedLine.length === 0) {
        currentEntry.fields![multiLineKey] = multiLineContent.join("\n");
        isMultiLineValue = false;
        multiLineContent = [];
      }
      entryLines.push(line);
    } else if (trimmedLine.length > 0) {
      entryLines.push(line);
    }
  }

  if (currentEntry.index !== undefined) {
    if (isMultiLineValue && multiLineContent.length > 0) {
      currentEntry.fields![multiLineKey] = multiLineContent.join("\n");
    }

    entries.push({
      index: currentEntry.index,
      date: currentEntry.date,
      event: currentEntry.event,
      loginName: currentEntry.loginName,
      fields: currentEntry.fields || {},
      rawData: entryLines.join("\n"),
    });
  }

  return entries;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { controllerId: string } }
): Promise<NextResponse<LogFileContentResponse>> {
  try {
    const controllerId = params.controllerId;

    if (!controllerId) {
      return NextResponse.json(
        { success: false, error: "Controller ID is required" },
        { status: 400 }
      );
    }

    const controllerQuery = `SELECT ip_address FROM controller WHERE id = $1`;
    const controllerResult = await dbPool.query(controllerQuery, [
      controllerId,
    ]);

    if (controllerResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Controller not found" },
        { status: 404 }
      );
    }

    const ipAddress = controllerResult.rows[0].ip_address;

    const fileName = "LOGDATA.DAT";
    const folderName = `${ipAddress}_LOGDATA`;
    
    // Platform-agnostic base path
    // Windows: C:\Watchlog\UI\
    // Mac/Linux: ~/Watchlog/UI/ (e.g., /Users/username/Watchlog/UI/)
    const baseDir = process.env.WATCHLOG_BASE_DIR || 
                    (process.platform === "win32" 
                      ? path.join("C:", "Watchlog", "UI")
                      : path.join(os.homedir(), "Watchlog", "UI"));
    
    const filePath = path.join(baseDir, folderName, fileName);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({
        success: false,
        error: "Log file not found. Please fetch log data first.",
        filePath,
      });
    }

    const fileContent = fs.readFileSync(filePath, "utf-8");

    const stats = fs.statSync(filePath);

    const logEntries = parseLogContent(fileContent);

    return NextResponse.json({
      success: true,
      data: logEntries,
      filePath,
      lastModified: stats.mtime.toISOString(),
    });
  } catch (error) {
    console.error("Error reading log file content:", error);
    return NextResponse.json(
      {
        success: false,
        error: `Failed to read log file content: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}
