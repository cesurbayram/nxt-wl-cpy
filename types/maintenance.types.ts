export interface MaintenancePlan {
  id?: string;
  controllerId: string;
  name: string;
  operationTime: string;
  maxOperationTime: string;
  overallTime?: string;
  lastMaintenance?: string;
  totalElapsedTime?: string;
  nextMaintenance?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MaintenanceLog {
  id?: string;
  maintenanceId: string;
  maintenanceTime: string;
  technician: string;
  description?: string;
  createdAt?: string;
  plan_name?: string;
}
