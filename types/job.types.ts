export interface Job {
  id: string;
  controller_id: string;
  job_name: string;
  current_line: number;
  job_content: string;
  created_at: Date;
}
