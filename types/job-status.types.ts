export interface JobStatus {
  id?: string;
  shiftId: string;
  jobId: string;
  controllerId?: string;
  currentLine: number;
  productCount: number;
  content: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductionComparison {
  jobId: string;
  jobName: string;
  manualCount: number;
  systemCount: number;
  difference: number;
  status: "equal" | "manual_higher" | "system_higher";
}
