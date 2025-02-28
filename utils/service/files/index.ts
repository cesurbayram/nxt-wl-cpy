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

export { getBackupPlans, createBackupPlan, updateBackupPlan, deleteBackupPlan };
