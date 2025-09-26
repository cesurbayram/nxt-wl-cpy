export type GeneralVariableType = "byte" | "int" | "double" | "real" | "string";

export interface JobSystemCountConfig {
  id?: string;
  jobId: string;
  controllerId: string;
  generalNo: string;
  variableType: GeneralVariableType;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Join fields
  jobName?: string;
  controllerName?: string;
}

export interface SystemCountValue {
  jobId: string;
  controllerId: string;
  value: number;
  generalNo: string;
  variableType: GeneralVariableType;
  lastUpdated?: string;
}

export interface ProductionComparisonWithSystemCount {
  jobId: string;
  jobName: string;
  manualCount: number;
  systemCount: number;
  difference: number;
  status: "equal" | "manual_higher" | "system_higher";
  generalNo?: string;
  variableType?: GeneralVariableType;
  lastUpdated?: string;
}
