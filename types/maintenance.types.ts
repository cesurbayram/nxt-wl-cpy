// types/maintenance.types.ts
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

// MaintenanceLog interface'i aynı kalabilir
export interface MaintenanceLog {
  id?: string; // id opsiyonel olmalı çünkü yeni log oluştururken id olmayacak
  maintenance_id: string;
  maintenance_time: string;
  technician: string;
  description?: string | null;
  created_at?: string; // created_at opsiyonel olmalı çünkü yeni log oluştururken olmayacak
}
