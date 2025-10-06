export interface ShiftMaintenance {
  id: string;
  controller_id: string;
  maintenance_type: string;
  current_hours: number;
  target_hours: number;
  status: string;
  last_date?: string;
  next_date?: string;
}

export interface ShiftMaintenanceHistory {
  id: string;
  controller_id: string;
  maintenance_type: string;
  maintenance_date: string;
  servo_hours: number;
  technician: string;
  notes?: string;
}

export interface ControllerForMaintenance {
  id: string;
  name: string;
  model: string;
  robot_model?: string;
  servo_power_time?: number;
}
