export interface MaintenancePlan {
  id?: string;
  controllerId: string;
  name: string;
  operationTime: string;
  companyName: string;
  maintenanceDate: string;
  servoPowerTime: string;
  nextMaintenanceTime?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MaintenanceLog {
  id?: string;
  maintenance_id: string;
  maintenance_time: string;
  technician: string;
  description?: string | null;
  created_at?: string;
}
