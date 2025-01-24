import { mkdir, access } from "fs/promises";
import { join } from "path";

const BASE_BACKUP_DIR = "C:\\Yaskawa\\Watchlog\\Backup";

export async function createBackupDirectory(
  controllerId: string,
  fileType: string
): Promise<string> {
  const date = new Date();
  const datePath = `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

  const dirPath = join(
    BASE_BACKUP_DIR,
    controllerId,
    fileType.toUpperCase(),
    datePath
  );

  try {
    await access(dirPath);
  } catch {
    await mkdir(dirPath, { recursive: true });
  }

  return dirPath;
}
