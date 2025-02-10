// types/files.types.ts
export interface BackupPlan {
  id: string;
  controller_id: string;
  name: string;
  days: number[];
  time: string;
  file_types: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
