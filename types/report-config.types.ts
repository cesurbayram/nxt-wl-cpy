import { ReportCategory, ReportType } from "@/types/report.types";

export interface ReportSystemConfig {
  categories: ReportCategory[];
  default_formats: string[];
  max_file_size: number;
  temp_folder: string;
  cleanup_interval: number;
}

export interface ReportUIConfig {
  items_per_page: number;
  supported_formats: string[];
  auto_refresh_interval: number;
}

export interface CategoryConfig {
  id: string;
  name: string;
  description: string;
  icon: string;
  report_types: ReportType[];
}
