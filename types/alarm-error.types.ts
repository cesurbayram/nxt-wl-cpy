export interface SystemAlarmHistoryItem {
  code: string;
  name: string;
  originDate: string;
  mode: string;
  type: "MAJOR" | "MINOR" | "USER" | "SYSTEM";
}

export interface SystemAlarmDetail {
  code: string;
  name: string;
  description: string;
  solution: string;
  causes: string[];
  preventiveActions: string[];
  relatedDocuments: string[];
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  robotBrand: string;
}

export interface SystemWorkOrder {
  id: string;
  controllerId: string;
  alarmCode: string;
  description: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  type: "PREVENTIVE" | "CORRECTIVE" | "INSPECTION";
  status: "OPEN" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
  createdDate: string;
  assignedTo?: string;
  estimatedDuration?: number;
}
