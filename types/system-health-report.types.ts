// System Health Report Types

export interface SystemHealthReportData {
  metadata: ReportMetadata;
  summary: SystemSummary;
  controllers: ControllerStatusData[];
  performance: PerformanceAnalysis;
  alarms: AlarmAnalysis;
  backups: BackupStatus;
  production: ProductionSummary;
  maintenance: MaintenanceData;
  logs: LogAnalysis;
}

export interface ReportMetadata {
  reportId: string;
  generatedAt: string;
  dateRange: {
    from: string;
    to: string;
  };
  totalControllers: number;
}

export interface SystemSummary {
  totalRobots: number;
  onlineCount: number;
  offlineCount: number;
  avgServoTime: number;
  totalAlarmsLast24h: number;
  topPerformingRobot: string;
  mostAlarmsRobot: string;
}

export interface ControllerStatusData {
  id: string;
  name: string;
  model: string;
  ipAddress: string;
  location: string;
  application: string;
  status: string;
  isOnline: boolean;
  servo: boolean;
  operating: boolean;
  teach: string;
  alarm: boolean;
  error: boolean;
  hold: boolean;
  doorOpen: boolean;
  connection: boolean;
  lastUpdate: string;
}

export interface PerformanceAnalysis {
  currentPeriod: PerformanceMetrics;
  previousPeriod: PerformanceMetrics;
  comparison: PerformanceComparison;
  weeklyTrend: WeeklyTrendData[];
  robotPerformances: RobotPerformance[];
}

export interface PerformanceMetrics {
  avgServoTime: number;
  avgControlPowerTime: number;
  avgPlaybackTime: number;
  avgMovingTime: number;
  avgOperatingTime: number;
  totalRecords: number;
}

export interface PerformanceComparison {
  servoTimeDiff: number;
  servoTimeDiffPercent: number;
  operatingTimeDiff: number;
  operatingTimeDiffPercent: number;
}

export interface WeeklyTrendData {
  date: string;
  avgServoTime: number;
  avgOperatingTime: number;
}

export interface RobotPerformance {
  controllerName: string;
  servoTime: number;
  efficiency: number;
  operatingTime: number;
}

export interface AlarmAnalysis {
  totalLast24h: number;
  activeAlarms: number;
  topAlarmCodes: TopAlarmCode[];
  severityDistribution: {
    major: number;
    minor: number;
  };
  recentAlarms: RecentAlarm[];
  alarmsByController: AlarmByController[];
}

export interface TopAlarmCode {
  code: string;
  text: string;
  count: number;
  severity: string;
}

export interface RecentAlarm {
  controllerName: string;
  code: string;
  text: string;
  detected: string;
  removed: string | null;
  severity: string;
}

export interface AlarmByController {
  controllerName: string;
  alarmCount: number;
}

export interface BackupStatus {
  controllersWithBackup: number;
  controllersWithoutBackup: number;
  totalBackupSessions: number;
  successRate: number;
  backupDetails: BackupDetail[];
  missingBackups: string[];
}

export interface BackupDetail {
  controllerName: string;
  lastBackupDate: string | null;
  totalFiles: number;
  successfulFiles: number;
  failedFiles: number;
  status: string;
  daysSinceLastBackup: number | null;
}

export interface ProductionSummary {
  totalProductionToday: number;
  totalProductionYesterday: number;
  productionDiff: number;
  productionDiffPercent: number;
  topJob: string | null;
  topJobCount: number;
  shiftProduction: ShiftProduction[];
  productionByController: ProductionByController[];
}

export interface ShiftProduction {
  shiftName: string;
  totalProduction: number;
  controllerCount: number;
}

export interface ProductionByController {
  controllerName: string;
  totalProduction: number;
  jobCount: number;
}

export interface MaintenanceData {
  recentMaintenance: RecentMaintenance[];
  upcomingMaintenance: UpcomingMaintenance[];
  totalMaintenanceRecords: number;
  controllersNeedingMaintenance: number;
}

export interface RecentMaintenance {
  controllerName: string;
  maintenanceType: string;
  maintenanceDate: string;
  servoHours: number;
  technician: string;
  notes: string;
}

export interface UpcomingMaintenance {
  controllerName: string;
  estimatedDate: string;
  currentServoHours: number;
  maintenanceThreshold: number;
  daysUntilMaintenance: number;
}

export interface LogAnalysis {
  totalLogEntries: number;
  logsByController: LogByController[];
  topEvents: TopEvent[];
  criticalEvents: CriticalEvent[];
  eventTypeDistribution: EventTypeDistribution;
}

export interface LogByController {
  controllerName: string;
  totalEntries: number;
  lastLogDate: string | null;
  criticalCount: number;
}

export interface TopEvent {
  eventType: string;
  count: number;
  percentage: number;
}

export interface CriticalEvent {
  controllerName: string;
  event: string;
  date: string;
  loginName: string;
}

export interface EventTypeDistribution {
  [key: string]: number;
}

// Chart Data Types
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

// Log Entry from LOGDATA.DAT
export interface ParsedLogEntry {
  index: number;
  date: string | undefined;
  event: string | undefined;
  loginName: string | undefined;
  fields: Record<string, string>;
  rawData: string;
}

