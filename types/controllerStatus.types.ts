export interface ControllerStatus {
  teach: "TEACH" | "PLAY" | "REMOTE";
  servo: boolean;
  operating: boolean;
  cycle: "CYCLE" | "STEP" | "AUTO";
  hold: boolean;
  alarm: boolean;
  error: boolean;
  stop: boolean;
  doorOpen: boolean;
  safeSpeed: boolean;
  maintenance: number;
  cBackup: boolean;
  connection: boolean;
}
