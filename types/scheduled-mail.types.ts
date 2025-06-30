export interface ScheduledMailJob {
  id: string;
  report_type_id: string;
  report_name: string;
  email_recipient: string;
  schedule_date: string;
  schedule_time: string;
  report_parameters: ReportParameters;
  report_format: "pdf" | "excel" | "csv";
  status: "scheduled" | "completed" | "failed";
  is_recurring: boolean;
  recurrence_pattern?: "daily" | "weekly" | "monthly";
  created_at?: string;
}

export interface ReportParameters {
  date_range?: {
    start_date: string;
    end_date: string;
  };
  controller_ids?: string[];
  shift_ids?: string[];
  status_filter?: string;
  custom_filters?: { [key: string]: any };
}

export interface MailJobConfig {
  report_type_id: string;
  report_name: string;
  email_recipient: string;
  schedule_date: string;
  schedule_time: string;
  report_parameters: ReportParameters;
  report_format: "pdf" | "excel" | "csv";
  is_recurring?: boolean;
  recurrence_pattern?: "daily" | "weekly" | "monthly";
}

export interface MailJobResponse {
  job_id: string;
  status: string;
  message: string;
  next_run?: string;
}
