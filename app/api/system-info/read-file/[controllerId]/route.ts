import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";
import fs from "fs";
import path from "path";
import os from "os";

export async function GET(
  request: NextRequest,
  { params }: { params: { controllerId: string } }
) {
  try {
    const { controllerId } = params;

    if (!controllerId) {
      return NextResponse.json(
        { error: "Controller ID is required" },
        { status: 400 }
      );
    }

    const controllerQuery = `SELECT ip_address FROM controller WHERE id = $1`;
    const controllerResult = await dbPool.query(controllerQuery, [
      controllerId,
    ]);

    if (!controllerResult || controllerResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Controller not found" },
        { status: 404 }
      );
    }

    const ipAddress = controllerResult.rows[0].ip_address;

    // Platform-agnostic base path
    const baseDir = process.env.WATCHLOG_BASE_DIR || 
                    (process.platform === "win32" 
                      ? path.join("C:", "Watchlog", "UI")
                      : path.join(os.homedir(), "Watchlog", "UI"));
    
    const systemInfoDir = path.join(baseDir, `${ipAddress}_SYSTEM`);

    if (!fs.existsSync(systemInfoDir)) {
      return NextResponse.json({
        content: null,
        message: "No system files found",
      });
    }

    const files = fs.readdirSync(systemInfoDir);
    const systemFiles = files.filter(
      (file) =>
        file.toUpperCase().includes("SYSTEM") &&
        (file.endsWith(".SYS") || file.endsWith(".sys"))
    );

    if (systemFiles.length === 0) {
      return NextResponse.json({
        content: null,
        message: "No SYSTEM.SYS files found",
      });
    }

    const latestFile = systemFiles
      .map((fileName) => {
        const filePath = path.join(systemInfoDir, fileName);
        const stats = fs.statSync(filePath);
        return { fileName, filePath, mtime: stats.mtime };
      })
      .sort((a, b) => b.mtime.getTime() - a.mtime.getTime())[0];

    const content = fs.readFileSync(latestFile.filePath, "utf8");

    return NextResponse.json({
      content,
      fileName: latestFile.fileName,
      lastModified: latestFile.mtime,
      message: "File read successfully",
    });
  } catch (error) {
    console.error("Error reading system info file:", error);
    return NextResponse.json(
      { error: "Internal server error", content: null },
      { status: 500 }
    );
  }
}
