import { BackupFile, BackupPlan, BackupHistory } from "@/types/files.types";

const getBackupFiles = async (
  controllerId: string,
  date?: Date
): Promise<BackupFile[]> => {
  const dateParam = date ? `?date=${date.toISOString()}` : "";
  const res = await fetch(`/api/controller/${controllerId}/files${dateParam}`);
  if (!res.ok) throw new Error("Backup dosyaları alınamadı");
  return res.json();
};

const downloadBackupFile = async (
  controllerId: string,
  fileId: string
): Promise<Blob> => {
  const res = await fetch(
    `/api/controller/${controllerId}/files/${fileId}/download`
  );
  if (!res.ok) throw new Error("Dosya indirilemedi");
  return res.blob();
};

const deleteBackupFile = async (
  controllerId: string,
  fileId: string,
  fileType: string
): Promise<void> => {
  if (fileType !== ".jbi") {
    throw new Error("Sadece .jbi dosyaları silinebilir");
  }
  const res = await fetch(
    `/api/controller/${controllerId}/files?fileId=${fileId}`,
    {
      method: "DELETE",
    }
  );
  if (!res.ok) throw new Error("Dosya silinemedi");
};

const getBackupPlans = async (controllerId: string): Promise<BackupPlan[]> => {
  const res = await fetch(`/api/controller/${controllerId}/files/backup/plans`);
  if (!res.ok) throw new Error("Backup planları alınamadı");
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
  if (!res.ok) throw new Error("Backup planı oluşturulamadı");
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
  if (!res.ok) throw new Error("Backup planı güncellenemedi");
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
  if (!res.ok) throw new Error("Backup planı silinemedi");
};

const getBackupHistory = async (
  controllerId: string,
  date?: Date
): Promise<BackupHistory[]> => {
  const dateParam = date ? `?date=${date.toISOString()}` : "";
  const res = await fetch(
    `/api/controller/${controllerId}/files/backup/history${dateParam}`
  );
  if (!res.ok) throw new Error("Backup geçmişi alınamadı");
  return res.json();
};

const editJbiFile = async (
  controllerId: string,
  fileId: string,
  content: string
): Promise<void> => {
  const res = await fetch(
    `/api/controller/${controllerId}/files/${fileId}/edit`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    }
  );
  if (!res.ok) throw new Error("Dosya düzenlenemedi");
};

export {
  getBackupFiles,
  downloadBackupFile,
  deleteBackupFile,
  getBackupPlans,
  createBackupPlan,
  updateBackupPlan,
  deleteBackupPlan,
  getBackupHistory,
  editJbiFile,
};
