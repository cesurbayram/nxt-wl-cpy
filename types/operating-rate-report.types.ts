export interface OperatingRateReportData {
    metadata: {
      title: string;
      generated_at: string;
      period: string;
      total_controllers: number;
    };
    controllers: ControllerOperatingData[];
    summary: {
      overall_operating_rate: number;
      total_log_entries: number;
      total_critical_events: number;
      most_efficient_controller: string;
      least_efficient_controller: string;
      average_daily_operating_rate: number;
    };
  }
  
  export interface ControllerOperatingData {
    id: string;
    name: string;
    ip_address: string;
    operating_analysis: {
      total_log_entries: number;
      operating_rate_percentage: number;
      daily_breakdown: DailyOperatingData[];
      system_states: SystemStateAnalysis;
      critical_events: CriticalEventSummary;
      performance_trend: number; // Positive/negative trend over time
    };
  }
  
  export interface DailyOperatingData {
    date: string;
    total_entries: number;
    operating_entries: number;
    operating_rate: number;
    teach_time_percentage: number;
    play_time_percentage: number;
    error_time_percentage: number;
    idle_time_percentage: number;
    critical_events_count: number;
  }
  
  export interface SystemStateAnalysis {
    teach_mode: {
      count: number;
      percentage: number;
      average_duration_minutes: number;
    };
    play_mode: {
      count: number;
      percentage: number;
      average_duration_minutes: number;
    };
    error_state: {
      count: number;
      percentage: number;
      most_common_errors: string[];
    };
    idle_state: {
      count: number;
      percentage: number;
    };
  }
  
  export interface CriticalEventSummary {
    total_count: number;
    events_per_day: number;
    top_critical_events: {
      event_type: string;
      count: number;
      impact_on_operating_rate: number;
    }[];
    recent_critical_events: {
      date: string;
      event: string;
      impact: "High" | "Medium" | "Low";
    }[];
  }
  