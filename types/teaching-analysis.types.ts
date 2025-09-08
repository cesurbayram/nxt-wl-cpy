export interface TeachingEvent {
  index: number;
  date: string;
  type:
    | "POINT_MODIFICATION"
    | "INSTRUCTION_INSERT"
    | "INSTRUCTION_DELETE"
    | "TEACH_MODE"
    | "OTHER";
  fileName?: string;
  lineNumber?: string;
  details: string;
  rawEntry: string;
}

export interface TeachingStatistics {
  totalTeachingEvents: number;
  pointModifications: number;
  instructionInserts: number;
  instructionDeletes: number;
  teachModeActivations: number;
  lastTeachingDate?: string;
  mostModifiedFiles: {
    fileName: string;
    count: number;
    lastTeachingDate: string;
    lastEvent: TeachingEvent;
  }[];
}

export interface TeachingAnalysisProps {
  controllerId: string;
  isVisible: boolean;
  refreshTrigger?: number;
}
