export interface ReportData {
  metadata: ReportMetadata;
  data: ReportDataSet[];
  summary?: ReportSummary;
}

export interface ReportMetadata {
  report_id: string;
  report_name: string;
  description?: string;
  generated_at: string;
  generated_by: string;
  parameters: any;
  total_records: number;
  data_sources: string[];
  date_range?: {
    start_date: string;
    end_date: string;
  };
  selected_controllers?: string[];
  controller_count?: number;
  report_type?: string;
}

export interface ReportDataSet {
  source: string;
  headers: string[];
  rows: any[][];
  total_count: number;
}

export interface ReportSummary {
  total_records: number;
  date_range: {
    start: string;
    end: string;
  };
  key_metrics: KeyMetric[];
  charts?: ChartData[];
}

export interface KeyMetric {
  name: string;
  value: string | number;
  change?: number;
  format: "number" | "percentage" | "currency" | "text";
}

export interface ChartData {
  type: "line" | "bar" | "pie" | "area";
  title: string;
  data: ChartDataPoint[];
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface AlarmReportData {
  controller_name: string;
  alarm_code: string;
  alarm_text: string;
  detected_at: string;
  resolved_at?: string;
  duration: number;
  status: "active" | "resolved";
}

export interface BackupReportData {
  controller_name: string;
  backup_type: string;
  last_backup_date: string;
  backup_size: number;
  status: "success" | "failed" | "pending";
  file_path: string;
}

export interface MaintenanceReportData {
  controller_name: string;
  maintenance_type: string;
  scheduled_date: string;
  completed_date?: string;
  technician: string;
  status: "scheduled" | "in_progress" | "completed" | "overdue";
  notes?: string;
}

export interface ProductionReportData {
  controller_name: string;
  shift_name: string;
  job_name: string;
  production_count: number;
  target_count: number;
  efficiency: number;
  date: string;
}

export interface UtilizationReportData {
  controller_name: string;
  date: string;
  runtime_hours: number;
  total_hours: number;
  utilization_percentage: number;
  servo_hours: number;
}

export interface SystemHealthReportData {
  controller_name: string;
  status: "online" | "offline" | "error";
  last_seen: string;
  uptime: number;
  memory_usage: number;
  cpu_usage: number;
  temperature: number;
  active_alarms: number;
}
