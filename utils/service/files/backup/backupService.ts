import { writeFile } from "fs/promises";
import { join } from "path";
import { dbPool } from "@/utils/dbUtil";
import { createBackupDirectory } from "@/utils/common/fileSystem";
import { v4 as uuidv4 } from "uuid";
import { BackupStatus, BackupFile, BackupPlan } from "@/types/files.types";
import { getBackupFiles, downloadBackupFile } from "@/utils/service/files";

async function backupFileType(
  controllerId: string,
  fileType: string
): Promise<void> {
  try {
    const files = await getBackupFiles(controllerId);
    const filteredFiles = files.filter((file) => file.file_type === fileType);

    for (const file of filteredFiles) {
      const backupDir = await createBackupDirectory(controllerId, fileType);
      const fileName = `${Date.now()}_${file.file_name}`;
      const filePath = join(backupDir, fileName);

      try {
        const fileContent = await downloadBackupFile(controllerId, file.id);

        const buffer = Buffer.from(await fileContent.arrayBuffer());
        await writeFile(filePath, new Uint8Array(buffer));

        await dbPool.query(
          `INSERT INTO backup_files (
            id, controller_id, file_name, file_type, size, hash, path, 
            backup_date, status
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [
            uuidv4(),
            controllerId,
            fileName,
            fileType,
            file.size,
            file.hash,
            filePath,
            new Date(),
            "SUCCESS" as BackupStatus,
          ]
        );
      } catch (error) {
        console.error(`Error backing up file ${file.file_name}:`, error);
        throw error;
      }
    }
  } catch (error) {
    console.error(`Error in backupFileType:`, error);
    throw error;
  }
}

async function updateBackupHistory(
  historyId: string,
  successCount: number,
  errorCount: number,
  totalFiles: number
): Promise<void> {
  try {
    const status: BackupStatus =
      errorCount === 0 ? "SUCCESS" : successCount === 0 ? "ERROR" : "PARTIAL";

    await dbPool.query(
      `UPDATE backup_history 
       SET 
         status = $1,
         success_files = $2,
         error_files = $3,
         total_files = $4,
         end_date = $5
       WHERE id = $6`,
      [status, successCount, errorCount, totalFiles, new Date(), historyId]
    );
  } catch (error) {
    console.error(`Error in updateBackupHistory:`, error);
    throw error;
  }
}

export async function performBackup(plan: BackupPlan) {
  const historyId = uuidv4();
  let successCount = 0;
  let errorCount = 0;

  try {
    await dbPool.query(
      `INSERT INTO backup_history (
        id, controller_id, plan_id, start_date, status, 
        total_files, success_files, error_files
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        historyId,
        plan.controller_id,
        plan.id,
        new Date(),
        "IN_PROGRESS",
        plan.file_types.length,
        0,
        0,
      ]
    );

    for (const fileType of plan.file_types) {
      try {
        await backupFileType(plan.controller_id, fileType);
        successCount++;
      } catch (error) {
        errorCount++;
        console.error(`Error backing up ${fileType}:`, error);
      }
    }

    await updateBackupHistory(
      historyId,
      successCount,
      errorCount,
      plan.file_types.length
    );
  } catch (error) {
    await updateBackupHistory(
      historyId,
      successCount,
      errorCount,
      plan.file_types.length
    );
    throw error;
  }
}
