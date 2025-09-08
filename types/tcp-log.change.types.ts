export interface TCPDataEntry {
  index: number;
  date: string;
  event: string;
  fileName: string;
  elementNumber: string;
  elementValue: string;
  parsedElement: {
    toolNumber: number;
    parameterGroup: number;
    parameterGroupName: string;
    parameterIndex: number;
    parameterName: string;
    actualToolNumber: number;
  };
  rawEntry: string;
}

export interface TCPComparison {
  toolNumber: number;
  parameterName: string;
  parameterGroupName: string;
  elementNumber: string;
  oldValue: number;
  newValue: number;
  change: number;
  changePercent: number;
}

export interface TCPAnalysisProps {
  controllerId?: string;
  isVisible?: boolean;
  refreshTrigger?: number;
}

export interface TCPToolData {
  toolNumber: number;
  parameters: {
    X: { value: number; elementNumber: string };
    Y: { value: number; elementNumber: string };
    Z: { value: number; elementNumber: string };
    Rx: { value: number; elementNumber: string };
    Ry: { value: number; elementNumber: string };
    Rz: { value: number; elementNumber: string };
  };
}
