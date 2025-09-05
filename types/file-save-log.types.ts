export interface FileSaveLogEntry {
  id: string;
  controller_id: string;
  ip_address: string;
  file_name: string;
  status: boolean;
  created_at: string;
  controller_name?: string;
  controller_model?: string;
  status_text: "Success" | "Failed";
  status_icon: "OK" | "NOT OK";
}

export interface FileSaveHistoryProps {
  controllerId: string;
  isVisible: boolean;
  refreshTrigger?: number;
}
