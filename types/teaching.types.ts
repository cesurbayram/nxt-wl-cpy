// types/teaching.types.ts
export interface ComparisonResult {
  id?: string;
  file1Name: string;
  file2Name: string;
  file1Format: string;
  file2Format: string;
  comparisonDate: string;
  differences: DiffResult[];
  statistics: ComparisonStatistics;
}

export interface DiffResult {
  value: string;
  added?: boolean;
  removed?: boolean;
  lineNumber?: number;
}

export interface ComparisonStatistics {
  totalLines: number;
  addedLines: number;
  removedLines: number;
  modifiedLines: number;
  unchangedLines: number;
  similarityPercentage: number;
}

export interface FilePreview {
  name: string;
  format: string;
  size: number;
  lastModified: string;
  preview: string;
}

export interface ComparisonHistoryItem {
  id: string;
  file1Name: string;
  file2Name: string;
  comparisonDate: string;
  statistics: ComparisonStatistics;
}

export interface DirectoryHandle {
  name: string;
  files: File[];
}

export enum FileType {
  JOB = "job",
  LADDER = "ladder",
  CUBE = "cube",
  FSU = "fsu",
  TOOL = "tool",
  C_INFO = "c_info",
  SHOCK_LEVEL = "shock_level",
  CALIBRATION = "calibration",
  VARIABLE = "variable",
}

export enum FSUSubType {
  AXIS_RANGE_LIMIT = "axis_range_limit",
  ROBOT_RANGE_LIMIT = "robot_range_limit",
  SPEED_LIMIT = "speed_limit",
}

export interface FileTypeConfig {
  type: FileType;
  label: string;
  fileExtensions?: string[];
  specificFiles?: string[];
  description?: string;
}

export const FILE_TYPE_CONFIGS: FileTypeConfig[] = [
  {
    type: FileType.JOB,
    label: "Job",
    fileExtensions: [".jbi"],
    description: "Job files with .jbi extension",
  },
  {
    type: FileType.LADDER,
    label: "Ladder",
    specificFiles: ["CIOPRG.LST"],
    description: "CIOPRG.LST files",
  },
  {
    type: FileType.CUBE,
    label: "Cube",
    specificFiles: ["CUBEINTF.CND"],
    description: "CUBEINTF.CND file",
  },
  {
    type: FileType.FSU,
    label: "FSU",
    description: "FSU related files with three subcategories",
  },
  {
    type: FileType.TOOL,
    label: "Tool",
    specificFiles: ["tool.cnd"],
    description: "tool.cnd file",
  },
  {
    type: FileType.C_INFO,
    label: "Controller Info",
    specificFiles: ["panelbox.log"],
    description: "panelbox.log file",
  },
  {
    type: FileType.SHOCK_LEVEL,
    label: "Schock Level",
    specificFiles: ["shocklvl.cnd"],
    description: "shocklvl.cnd file",
  },
  {
    type: FileType.CALIBRATION,
    label: "Calibration",
    specificFiles: ["abso.dat"],
    description: "abso.dat files",
  },
  {
    type: FileType.VARIABLE,
    label: "Variable",
    specificFiles: ["var.dat"],
    description: "var.dat file",
  },
];

export const FSU_SUBTYPE_CONFIGS = [
  {
    type: FSUSubType.AXIS_RANGE_LIMIT,
    label: "Axis Range Limit",
    specificFiles: ["axrnglmt.dat"],
    description: "axrnglmt.dat file",
  },
  {
    type: FSUSubType.ROBOT_RANGE_LIMIT,
    label: "Robot Range Limit",
    specificFiles: ["rbrnglmt.dat"],
    description: "rbrnglmt.dat file",
  },
  {
    type: FSUSubType.SPEED_LIMIT,
    label: "Speed Limit",
    specificFiles: ["spdlmt.dat"],
    description: "spdlmt.dat file",
  },
];

declare global {
  interface Window {
    showDirectoryPicker(): Promise<any>;
  }
}

export type FileSystemHandle = {
  kind: "file" | "directory";
  name: string;
};

export type FileSystemFileHandle = FileSystemHandle & {
  kind: "file";
  getFile(): Promise<File>;
};

export type FileSystemDirectoryHandle = FileSystemHandle & {
  kind: "directory";
  values(): AsyncIterable<FileSystemHandle>;
  getDirectoryHandle(
    name: string,
    options?: { create?: boolean }
  ): Promise<FileSystemDirectoryHandle>;
  getFileHandle(
    name: string,
    options?: { create?: boolean }
  ): Promise<FileSystemFileHandle>;
  removeEntry(name: string, options?: { recursive?: boolean }): Promise<void>;
  resolve(possibleDescendant: FileSystemHandle): Promise<string[] | null>;
  isSameEntry(other: FileSystemHandle): Promise<boolean>;
};
