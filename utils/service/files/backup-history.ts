export interface BackupHistoryItem {
  id: string;
  controller_name: string;
  ip_address: string;
  file_name: string;
  file_count: number;
  file_size_mb: string;
  created_at: string;
}

export interface BackupHistoryResponse {
  success: boolean;
  data?: BackupHistoryItem[];
  error?: string;
}

const getBackupHistory = async (
  controllerId: string
): Promise<BackupHistoryResponse> => {
  try {
    const response = await fetch(
      `http://localhost:8082/api/backup-history/${controllerId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error fetching backup history:", error);
    return {
      success: false,
      error: "Failed to fetch backup history. Please try again.",
    };
  }
};

const downloadBackup = async (
  backupId: string,
  fileName: string
): Promise<void> => {
  try {
    const downloadUrl = `http://localhost:8082/api/backup-download/${backupId}`;

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = fileName;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error downloading backup:", error);
    throw new Error("Failed to download backup. Please try again.");
  }
};

const deleteBackup = async (
  backupId: string
): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const response = await fetch(
      `http://localhost:8082/api/backup-history/${backupId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error deleting backup:", error);
    return {
      success: false,
      error: "Failed to delete backup. Please try again.",
    };
  }
};

export { getBackupHistory, downloadBackup, deleteBackup };
