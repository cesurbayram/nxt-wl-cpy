export interface UtilizationReportData {
    metadata: {
      title: string;
      generated_at: string;
      period: string;
      total_controllers: number;
    };
    controllers: ControllerUtilizationData[];
    summary: {
      total_operating_hours: number;
      average_daily_hours: number;
      most_efficient_controller: string;
      least_efficient_controller: string;
      total_efficiency_percentage: number;
    };
  }
  
  export interface ControllerUtilizationData {
    id: string;
    name: string;
    ip_address: string;
    daily_data: DailyUtilizationData[];
    totals: {
      total_operating_hours: number;
      average_daily_hours: number;
      efficiency_trend: number; 
      best_day: DailyUtilizationData;
      worst_day: DailyUtilizationData;
    };
  }
  
  export interface DailyUtilizationData {
    date: string;
    operating_hours: number;
    servo_power_hours: number;
    playback_hours: number;
    moving_hours: number;
    efficiency_percentage: number;
    day_over_day_change: number; 
    day_over_day_percentage: number; 
  }
  