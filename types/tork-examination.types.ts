export interface TorkExaminationData {
  timestamp: string;
  value: number;
  jobId?: string;
  jobName?: string;
  signalId?: string;
  signalNumber?: string;
  signalState?: boolean;
  controllerId: string;
  S?: number;
  L?: number;
  U?: number;
  R?: number;
  B?: number;
  T?: number;
  B1?: number;
  S1?: number;
  S2?: number;
  sessionId?: string;
}

export interface UniversalOutputSignal {
  id: string;
  signalNumber: string;
  signalState: boolean;
}

export interface SignalData {
  id: string;
  name: string;
  type: "digitalOutput" | "digitalInput" | "analogOutput" | "analogInput";
  byte: number;
  bit?: number;
  value: boolean | number;
  timestamp: string;
}

export interface TorkExaminationFilter {
  startDate: string;
  endDate: string;
  duration: number;
  jobId?: string;
  signalIds?: string[];
  manualSignals?: string[];
  controllerId: string;
  startTime?: string;
  endTime?: string;
}

export interface TorkExaminationJob {
  id: string;
  name: string;
  job_content: string;
  controller_id: string;
  current_line?: number;
  created_at?: string;
  updated_at?: string;
}

export interface TorkExaminationSignal {
  id: string;
  signalNumber: string;
  signalState: boolean;
  controller_id?: string;
  created_at?: string;
  updated_at?: string;
  displayNumber?: number;
}

export interface TorkExaminationSession {
  id: string;
  start_date: string;
  start_time: string;
  duration: number;
  end_date: string;
  end_time: string;
  job_id?: string;
  controller_id: string;
  created_at?: string;
}

export enum SignalState {
  ACTIVE = 1,
  INACTIVE = 0,
}
