export interface ReportCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface ReportType {
  id: string;
  category_id: string;
  name: string;
  description: string;
}

export interface ReportTemplate {
  id: string;
  report_type_id: string;
  template_name: string;
  template_config: {
    layout?: "standard" | "compact" | "detailed";
    colors?: {
      primary?: string;
      secondary?: string;
      accent?: string;
    };
    logo?: string;
    header_format?: string;
    footer_format?: string;
    table_style?: "simple" | "striped" | "bordered";
    date_format?: string;
    page_size?: "A4" | "A3" | "Letter";
    orientation?: "portrait" | "landscape";
  };
  created_at: string;
}

export interface ReportHistory {
  id: string;
  report_name: string;
  report_category: string;
  report_type: string;
  report_format: string;
  file_path: string;
  file_size: number;
  generated_at: string;
  generated_by: string;
  parameters: any;
}

export interface ReportConfig {
  categoryId?: string;
  typeId?: string;
  name?: string;
  description?: string;
  filters?: { [key: string]: any };
  exportFormat?: "pdf" | "excel" | "csv";
  category?: string;
  type?: string;
  template_id?: string;
  format?: "pdf" | "excel" | "csv";
  controller_ids?: string[];
  startDate?: string;
  endDate?: string;
  sections?: string[];
}

export interface DataSource {
  id: string;
  name: string;
  table: string;
  required: boolean;
  fields: string[];
}

export interface FilterConfig {
  id: string;
  name: string;
  type:
    | "date_range"
    | "controller_select"
    | "shift_select"
    | "status_select"
    | "text_input";
  required: boolean;
  options?: FilterOption[];
  defaultValue?: any;
}

export interface FilterOption {
  label: string;
  value: string;
}

export interface GeneratedReport {
  id: string;
  user_id: string;
  report_type_id: string;
  report_name: string;
  parameters: ReportParameters;
  file_path?: string;
  format: string;
  status: string;
  created_at?: string;
  category_name?: string;
  type_name?: string;
  category_description?: string;
  type_description?: string;
  report_type?: ReportType;
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

export type ExportFormat = "PDF" | "Excel" | "CSV" | "JSON";

export type ReportStatus = "pending" | "processing" | "completed" | "failed";

export interface ReportPreviewData {
  headers: string[];
  rows: any[][];
  total_records: number;
  preview_limit: number;
}

export interface ReportGenerationRequest {
  report_type_id: string;
  report_name: string;
  description?: string;
  parameters: ReportParameters;
  format: ExportFormat;
}
