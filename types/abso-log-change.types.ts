export interface AbsoluteDataEntry {
  index: number;
  date: string;
  groupNumber: string;
  axisNumber: string;
  setValue: string;
  currValue: {
    R1: {
      S?: number;
      L?: number;
      U?: number;
      R?: number;
      B?: number;
      T?: number;
    };
  };
  rawEntry: string;
}

export interface AxisComparison {
  axis: string;
  oldValue: number;
  newValue: number;
  change: number;
  changePercent: number;
}

export interface AbsoluteDataAnalysisProps {
  controllerId?: string;
  isVisible?: boolean;
  refreshTrigger?: number;
}
