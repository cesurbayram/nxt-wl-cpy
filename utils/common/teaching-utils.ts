import {
  FilePreview,
  DiffResult,
  ComparisonStatistics,
  FileType,
  FSUSubType,
  FILE_TYPE_CONFIGS,
  FSU_SUBTYPE_CONFIGS,
} from "@/types/teaching.types";

export const getFileFormat = (fileName: string): string => {
  const extension = fileName.split(".").pop()?.toLowerCase() || "";
  return extension;
};

export const isValidFormat = (format: string): boolean => {
  const allowedFormats = ["jbi", "dat", "cnd", "prm", "sys", "lst", "log"];
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

export const isFileMatchingType = (
  fileName: string,
  fileType: FileType
): boolean => {
  const config = FILE_TYPE_CONFIGS.find((config) => config.type === fileType);
  if (!config) return false;

  if (config.specificFiles) {
    return config.specificFiles.some(
      (specificFile) => fileName.toLowerCase() === specificFile.toLowerCase()
    );
  }

  if (config.fileExtensions) {
    return config.fileExtensions.some((ext) =>
      fileName.toLowerCase().endsWith(ext.toLowerCase())
    );
  }

  return false;
};

export const isFileMatchingFSUSubType = (
  fileName: string,
  subType: FSUSubType
): boolean => {
  const config = FSU_SUBTYPE_CONFIGS.find((config) => config.type === subType);
  if (!config) return false;

  return (
    config.specificFiles?.some(
      (specificFile) => fileName.toLowerCase() === specificFile.toLowerCase()
    ) || false
  );
};

export const filterFilesByType = (
  files: File[],
  fileType: FileType
): File[] => {
  if (fileType === FileType.FSU) {
    return files.filter((file) =>
      FSU_SUBTYPE_CONFIGS.some((config) =>
        config.specificFiles?.some(
          (specificFile) =>
            file.name.toLowerCase() === specificFile.toLowerCase()
        )
      )
    );
  }

  return files.filter((file) => isFileMatchingType(file.name, fileType));
};

export const filterFilesByFSUSubType = (
  files: File[],
  subType: FSUSubType
): File[] => {
  return files.filter((file) => isFileMatchingFSUSubType(file.name, subType));
};
