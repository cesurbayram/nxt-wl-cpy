import { NextRequest, NextResponse } from "next/server";
import { dbPool } from "@/utils/dbUtil";
import archiver from "archiver";
import fs from "fs";
import path from "path";
import os from "os";

export async function POST(
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

    const sessionQuery = `
      SELECT bs.*, c.ip_address 
      FROM backup_sessions bs
      JOIN controller c ON bs.controller_id = c.id
      WHERE bs.id = $1
    `;
    

    const sessionResult = await dbPool.query(sessionQuery, [sessionId]);

    if (sessionResult.rows.length === 0) {
      return NextResponse.json(
        { error: "Backup session not found" },
        { status: 404 }
      );
    }

    const session = sessionResult.rows[0];
    const controllerIp = session.ip_address;

    const filesQuery = `
      SELECT file_name, file_type, backup_status
      FROM backup_file_details
      WHERE session_id = $1 AND backup_status = true
      ORDER BY backup_time ASC
    `;

    const filesResult = await dbPool.query(filesQuery, [sessionId]);

    if (filesResult.rows.length === 0) {
      return NextResponse.json(
        { error: "No successful backup files found for this session" },
        { status: 404 }
      );
    }

    // Platform-agnostic backup directory
    const backupBaseDir = process.env.WATCHLOG_BACKUP_DIR || 
                          (process.platform === "win32" 
                            ? path.join("C:", "Watchlog", "Backup")
                            : path.join(os.homedir(), "Watchlog", "Backup"));
    
    const controllerBackupDir = path.join(backupBaseDir, controllerIp);

    const zipDir = path.join(backupBaseDir, "zips");
    if (!fs.existsSync(zipDir)) {
      fs.mkdirSync(zipDir, { recursive: true });
    }

    const zipFileName = `backup_${sessionId.substring(0, 8)}_${
      new Date().toISOString().split("T")[0]
    }.zip`;
    const zipFilePath = path.join(zipDir, zipFileName);

    if (fs.existsSync(zipFilePath)) {
      return NextResponse.json({
        success: true,
        message: "ZIP file already exists",
        zipFileName,
        fileCount: filesResult.rows.length,
      });
    }

    // ZIP oluşturma
    let filesAdded = 0;
    let errors: string[] = [];

    await new Promise<void>((resolve, reject) => {
      const output = fs.createWriteStream(zipFilePath);
      const archive = archiver("zip", { zlib: { level: 9 } });

      output.on("close", resolve);
      archive.on("error", reject);

      archive.pipe(output);

      filesResult.rows.forEach((file) => {
        const sourceFilePath = path.join(controllerBackupDir, file.file_name);

        if (fs.existsSync(sourceFilePath)) {
          try {
            archive.file(sourceFilePath, { name: file.file_name });
            filesAdded++;
          } catch (error) {
            errors.push(`Failed to add ${file.file_name}: ${error}`);
          }
        } else {
          errors.push(`File not found: ${file.file_name}`);
        }
      });

      archive.finalize();
    });

    const stats = fs.statSync(zipFilePath);
    return NextResponse.json({
      success: true,
      message: "ZIP file created successfully",
      zipFileName,
      fileCount: filesAdded,
      totalFiles: filesResult.rows.length,
      zipSizeBytes: stats.size,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Error creating ZIP:", error);
    return NextResponse.json(
      { error: "Failed to create ZIP file" },
      { status: 500 }
    );
  }
}
