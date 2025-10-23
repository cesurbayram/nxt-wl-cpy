import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const sessionId = params.sessionId;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    // Platform-agnostic backup directory
    const backupBaseDir = process.env.WATCHLOG_BACKUP_DIR || 
                          (process.platform === "win32" 
                            ? path.join("C:", "Watchlog", "Backup")
                            : path.join(os.homedir(), "Watchlog", "Backup"));
    
    const zipDir = path.join(backupBaseDir, "zips");

    const today = new Date().toISOString().split("T")[0];
    const zipFileName = `backup_${sessionId.substring(0, 8)}_${today}.zip`;
    const zipFilePath = path.join(zipDir, zipFileName);

    let finalZipPath = zipFilePath;
    if (!fs.existsSync(zipFilePath)) {
      if (fs.existsSync(zipDir)) {
        const zipFiles = fs.readdirSync(zipDir);
        const sessionZipFiles = zipFiles.filter(
          (file) =>
            file.startsWith(`backup_${sessionId.substring(0, 8)}_`) &&
            file.endsWith(".zip")
        );

        if (sessionZipFiles.length > 0) {
          // En son oluşturulmuş ZIP'i al
          sessionZipFiles.sort((a, b) => {
            const aPath = path.join(zipDir, a);
            const bPath = path.join(zipDir, b);
            return (
              fs.statSync(bPath).mtime.getTime() -
              fs.statSync(aPath).mtime.getTime()
            );
          });
          finalZipPath = path.join(zipDir, sessionZipFiles[0]);
        } else {
          return NextResponse.json(
            { error: "ZIP file not found. Please create ZIP first." },
            { status: 404 }
          );
        }
      } else {
        return NextResponse.json(
          { error: "ZIP directory not found" },
          { status: 404 }
        );
      }
    }

    if (!fs.existsSync(finalZipPath)) {
      return NextResponse.json(
        { error: "ZIP file not found" },
        { status: 404 }
      );
    }

    const stats = fs.statSync(finalZipPath);
    const fileName = path.basename(finalZipPath);

    const fileBuffer = fs.readFileSync(finalZipPath);

    const headers = new Headers();
    headers.set("Content-Type", "application/zip");
    headers.set("Content-Disposition", `attachment; filename="${fileName}"`);
    headers.set("Content-Length", stats.size.toString());
    headers.set("Cache-Control", "no-cache");

    return new NextResponse(fileBuffer as any, {
      status: 200,
      headers: headers,
    });
  } catch (error) {
    console.error("Error downloading ZIP:", error);
    return NextResponse.json(
      { error: "Failed to download ZIP file" },
      { status: 500 }
    );
  }
}
