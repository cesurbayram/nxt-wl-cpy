export interface SystemInfoResponse {
  success: boolean;
  content: string | null;
  fileName?: string;
  lastModified?: Date;
  message?: string;
  error?: string;
  debug?: {
    controllerId?: string;
    ipAddress?: string;
    searchDir?: string;
    availableFiles?: string[];
  };
}

export interface SystemInfoStats {
  lines: number;
  size: number;
}

export interface SystemInfoState {
  content: string;
  isLoading: boolean;
  lastUpdated?: Date;
  stats?: SystemInfoStats;
}
