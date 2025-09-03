export type BackupSessionStatus = "in_progress" | "completed" | "failed";

export type BackupFileType =
  | ".jbi"
  | ".dat"
  | ".sys"
  | ".lst"
  | ".cnd"
  | ".prm"
  | "cmos";

export interface BackupSession {
  id: string;
  controller_id: string;
  controller_ip: string;
  session_start_time: string;
  session_end_time: string | null;
  total_files: number;
  successful_files: number;
  failed_files: number;
  status: BackupSessionStatus;
  created_at: string;
}

export interface BackupFileDetail {
  id: string;
  session_id: string;
  file_name: string;
  file_type: BackupFileType | null;
  backup_status: boolean;
  backup_time: string;
  file_size_bytes: number | null;
  created_at: string;
}

export interface BackupSessionWithController extends BackupSession {
  controller_name: string;
}

export interface BackupHistoryResponse
  extends Array<BackupSessionWithController> {}

export interface BackupSessionDetailsResponse extends Array<BackupFileDetail> {}

export interface BackupHistoryProps {
  controllerId: string;
  isVisible: boolean;
  refreshTrigger?: number;
}

export interface BackupSessionsApiResponse {
  success: boolean;
  data?: BackupSessionWithController[];
  error?: string;
}

export interface BackupFileDetailsApiResponse {
  success: boolean;
  data?: BackupFileDetail[];
  error?: string;
}
