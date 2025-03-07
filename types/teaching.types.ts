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
