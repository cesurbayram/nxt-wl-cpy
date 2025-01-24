// types/files.types.ts
export type BackupStatus = "SUCCESS" | "ERROR" | "IN_PROGRESS" | "PARTIAL";

export interface BackupPlan {
  id: string; // UUID kullandığımız için string yapıyoruz
  controller_id: string;
  name: string;
  days: number[];
  time: string;
  file_types: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BackupFile {
  id: string; // UUID için string
  controller_id: string;
  plan_id: string | null; // UUID için string
  file_name: string;
  file_type: string;
  size: number;
  hash: string;
  path: string;
  backup_date: string;
  status: BackupStatus;
  error_message?: string;
  created_at: string;
}

export interface BackupHistory {
  id: string; // UUID için string
  controller_id: string;
  plan_id: string | null; // UUID için string
  start_date: string;
  end_date: string | null;
  status: BackupStatus;
  total_files: number;
  success_files: number;
  error_files: number;
  created_at: string;
}
