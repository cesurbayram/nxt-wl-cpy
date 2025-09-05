export interface GeneralFileSaveRequest {
  controllerId: string;
  fileName?: string;
}

export interface GeneralFileSaveResult {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}
