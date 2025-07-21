export type NotificationType =
  | "mail_sent"
  | "mail_failed"
  | "report_generated"
  | "report_ready"
  | "report_failed"
  | "maintenance_scheduled"
  | "maintenance_completed"
  | "maintenance_overdue"
  | "employee_added"
  | "employee_updated"
  | "employee_deleted"
  | "controller_added"
  | "alarm_triggered"
  | "shift_changed"
  | "system_backup";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  user_id?: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationData {
  mail_job_id?: string;
  report_name?: string;
  recipient_email?: string;

  report_id?: string;
  report_format?: string;
  download_url?: string;
  file_name?: string;

  maintenance_id?: string;
  controller_id?: string;
  controller_name?: string;
  maintenance_type?: string;
  technician?: string;
  maintenance_date?: string;
  notes?: string;
  days_overdue?: number;
  last_maintenance_date?: string;

  employee_id?: string;
  employee_name?: string;
  employee_code?: string;
  department?: string;

  alarm_type?: string;
  alarm_message?: string;
  shift_name?: string;

  timestamp?: string;
  severity?: "info" | "warning" | "error" | "success";
}

export interface CreateNotificationRequest {
  type: NotificationType;
  title: string;
  message: string;
  data?: NotificationData;
  user_id?: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  unread_count: number;
  total_count: number;
  has_more: boolean;
}

export interface NotificationPreferences {
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  notification_types: NotificationType[];
  quiet_hours_start?: string;
  quiet_hours_end?: string;
}
