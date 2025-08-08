import { BackupPlan } from "@/types/files.types";

const getBackupPlans = async (controllerId: string): Promise<BackupPlan[]> => {
  const res = await fetch(`/api/controller/${controllerId}/files/backup/plans`);
  if (!res.ok) throw new Error("Backup plan dont get");
  return res.json();
};

const createBackupPlan = async (
  controllerId: string,
  plan: {
    name: string;
    days: number[];
    time: string;
    file_types: string[];
  }
): Promise<BackupPlan> => {
  const res = await fetch(
    `/api/controller/${controllerId}/files/backup/plans`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(plan),
    }
  );
  if (!res.ok) throw new Error("Backup plan dont post");
  return res.json();
};

const updateBackupPlan = async (
  controllerId: string,
  planId: string,
  plan: Partial<{
    name: string;
    days: number[];
    time: string;
    file_types: string[];
    is_active: boolean;
  }>
): Promise<BackupPlan> => {
  const res = await fetch(
    `/api/controller/${controllerId}/files/backup/plans/${planId}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(plan),
    }
  );
  if (!res.ok) throw new Error("Backup plan dont edit");
  return res.json();
};

const deleteBackupPlan = async (
  controllerId: string,
  planId: string
): Promise<void> => {
  const res = await fetch(
    `/api/controller/${controllerId}/files/backup/plans/${planId}`,
    {
      method: "DELETE",
    }
  );
  if (!res.ok) throw new Error("Backup plan dont edit");
};

const manualBackup = async (
  controllerId: string,
  fileTypes: string[]
): Promise<{
  success: boolean;
  fileName?: string;
  fileData?: string;
  fileCount?: number;
  error?: string;
}> => {
  try {
    const response = await fetch("http://10.0.110.3:8082/api/manual-backup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        controllerId,
        fileTypes,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to initiate backup");
    }

    const result = await response.json();
    const requestId = result.requestId;

    let attempts = 0;
    const maxAttempts = 60;

    return new Promise((resolve) => {
      const pollForResult = async () => {
        try {
          const resultResponse = await fetch(
            `http://10.0.110.3:8082/api/manual-backup-result/${requestId}`
          );

          if (resultResponse.status === 200) {
            const backupResult = await resultResponse.json();
            resolve(backupResult);
          } else if (resultResponse.status === 202) {
            attempts++;
            if (attempts < maxAttempts) {
              setTimeout(pollForResult, 3000);
            } else {
              resolve({
                success: false,
                error:
                  "Backup is taking longer than expected. Please try again.",
              });
            }
          } else {
            resolve({
              success: false,
              error: "Failed to get backup result",
            });
          }
        } catch (error) {
          resolve({
            success: false,
            error: "Error checking backup status. Please try again.",
          });
        }
      };

      setTimeout(pollForResult, 5000);
    });
  } catch (error) {
    return {
      success: false,
      error: "Failed to start backup. Please try again.",
    };
  }
};

export {
  getBackupPlans,
  createBackupPlan,
  updateBackupPlan,
  deleteBackupPlan,
  manualBackup,
};
