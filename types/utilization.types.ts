export interface UtilizationData {
  id: string;
  controller_id: string;
  control_power_time: number;
  servo_power_time: number;
  playback_time: number;
  moving_time: number;
  operating_time: number;
  timestamp: string;
  created_at: string;
}
