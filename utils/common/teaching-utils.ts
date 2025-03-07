import {
  FilePreview,
  DiffResult,
  ComparisonStatistics,
} from "@/types/teaching.types";

export const getFileFormat = (fileName: string): string => {
  const extension = fileName.split(".").pop()?.toLowerCase() || "";
  return extension;
};

export const isValidFormat = (format: string): boolean => {
  const allowedFormats = [
    // "txt",
    // "js",
    // "ts",
    // "json",
    // "html",
    // "css",
    // "md",
    "jbi",
    "dat",
    "cnd",
    "prm",
    "sys",
    "lst",
    "log",
  ];
  return allowedFormats.includes(format);
};

export const generateFilePreview = async (file: File): Promise<FilePreview> => {
  const text = await file.text();
  const preview = text.slice(0, 500);

  return {
    name: file.name,
    format: getFileFormat(file.name),
    size: file.size,
    lastModified: new Date(file.lastModified).toLocaleString(),
    preview,
  };
};

export const calculateStatistics = (
  differences: DiffResult[]
): ComparisonStatistics => {
  let totalLines = 0;
  let addedLines = 0;
  let removedLines = 0;
  let unchangedLines = 0;

  differences.forEach((diff) => {
    const lines = diff.value.split("\n").length - 1;
    totalLines += lines;

    if (diff.added) addedLines += lines;
    else if (diff.removed) removedLines += lines;
    else unchangedLines += lines;
  });

  const modifiedLines = addedLines + removedLines;
  const similarityPercentage = Math.round(
    ((totalLines - modifiedLines) / totalLines) * 100
  );

  return {
    totalLines,
    addedLines,
    removedLines,
    modifiedLines,
    unchangedLines,
    similarityPercentage,
  };
};
