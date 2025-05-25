import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { diffLines } from "diff";
import { FilePreview } from "./file-preview";
import { Statistics } from "./comparison-statistics";
import { ComparisonHistory } from "./comparison-history";
import {
  getFileFormat,
  isValidFormat,
  generateFilePreview,
  calculateStatistics,
  filterFilesByType,
  isFileMatchingType,
} from "@/utils/common/teaching-utils";
import { generateAndDownloadReport } from "@/utils/common/pdf-utils";
import { saveComparisonResult } from "@/utils/service/teaching";
import {
  ComparisonResult,
  FilePreview as FilePreviewInterface,
  ComparisonStatistics,
  FileType,
  FILE_TYPE_CONFIGS,
} from "@/types/teaching.types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileDown } from "lucide-react";

interface ProcessedDiffLine {
  content: string;
  type: "added" | "removed" | "normal";
  lineNumber: number;
}

interface FileComparisonProps {
  controllerId: string;
  fileType: FileType;
  folder1Files?: File[];
  folder2Files?: File[];
  folder1Name?: string;
  folder2Name?: string;
}

const FileComparison: React.FC<FileComparisonProps> = ({
  controllerId,
  fileType,
  folder1Files = [],
  folder2Files = [],
  folder1Name,
  folder2Name,
}) => {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [filePreview1, setFilePreview1] = useState<FilePreviewInterface | null>(
    null
  );
  const [filePreview2, setFilePreview2] = useState<FilePreviewInterface | null>(
    null
  );
  const [differences, setDifferences] = useState<ProcessedDiffLine[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const [statistics, setStatistics] = useState<ComparisonStatistics | null>(
    null
  );
  const [showHistory, setShowHistory] = useState(false);
  const [comparisonResult, setComparisonResult] =
    useState<ComparisonResult | null>(null);

  const [filteredFiles1, setFilteredFiles1] = useState<File[]>([]);
  const [filteredFiles2, setFilteredFiles2] = useState<File[]>([]);

  const leftPanelRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setFile1(null);
    setFile2(null);
    setFilePreview1(null);
    setFilePreview2(null);
    setDifferences([]);
    setStatistics(null);
    setComparisonResult(null);
  }, [fileType]);

  useEffect(() => {
    if (folder1Files.length > 0) {
      const filtered = folder1Files.filter((file) =>
        isFileMatchingType(file.name, fileType)
      );
      setFilteredFiles1(filtered);

      if (filtered.length === 1) {
        handleFileChange(filtered[0], true);
      }
    } else {
      setFilteredFiles1([]);
    }

    if (folder2Files.length > 0) {
      const filtered = folder2Files.filter((file) =>
        isFileMatchingType(file.name, fileType)
      );
      setFilteredFiles2(filtered);

      if (filtered.length === 1) {
        handleFileChange(filtered[0], false);
      }
    } else {
      setFilteredFiles2([]);
    }
  }, [folder1Files, folder2Files, fileType]);

  useEffect(() => {
    const leftPanel = leftPanelRef.current;
    const rightPanel = rightPanelRef.current;

    if (!leftPanel || !rightPanel) return;

    const syncScroll = (e: Event) => {
      const source = e.target as HTMLDivElement;
      const target = source === leftPanel ? rightPanel : leftPanel;

      target.scrollTop = source.scrollTop;
    };

    leftPanel.addEventListener("scroll", syncScroll);
    rightPanel.addEventListener("scroll", syncScroll);

    return () => {
      leftPanel.removeEventListener("scroll", syncScroll);
      rightPanel.removeEventListener("scroll", syncScroll);
    };
  }, [differences]);

  const handleFileChange = async (file: File | null, isFirstFile: boolean) => {
    if (!file) return;

    const format = getFileFormat(file.name);
    if (!isValidFormat(format)) {
      toast.error(`Invalid file format.`);
      return;
    }

    const preview = await generateFilePreview(file);

    if (isFirstFile) {
      setFile1(file);
      setFilePreview1(preview);
    } else {
      setFile2(file);
      setFilePreview2(preview);
    }
  };

  const handleFileSelect = (fileId: string, isFirstFile: boolean) => {
    const files = isFirstFile ? filteredFiles1 : filteredFiles2;
    const selectedFile = files.find((f) => f.name === fileId);

    if (selectedFile) {
      handleFileChange(selectedFile, isFirstFile);
    }
  };

  const handleCompare = async () => {
    if (!file1 || !file2) return;
    setIsComparing(true);

    try {
      const text1 = await file1.text();
      const text2 = await file2.text();

      const diff = diffLines(text1, text2);

      let lineNumber = 1;
      const processedDiff: ProcessedDiffLine[] = [];

      const file1Lines = text1.split("\n");
      const file2Lines = text2.split("\n");
      const maxLines = Math.max(file1Lines.length, file2Lines.length);

      for (let i = 0; i < maxLines; i++) {
        const line1 = file1Lines[i] || "";
        const line2 = file2Lines[i] || "";

        if (line1 === line2) {
          processedDiff.push({
            content: line1,
            type: "normal",
            lineNumber: i + 1,
          });
        } else {
          processedDiff.push({
            content: line1,
            type: "removed",
            lineNumber: i + 1,
          });
          processedDiff.push({
            content: line2,
            type: "added",
            lineNumber: i + 1,
          });
        }
      }

      setDifferences(processedDiff);

      const stats = calculateStatistics(diff);
      setStatistics(stats);

      const result: ComparisonResult = {
        file1Name: file1.name,
        file2Name: file2.name,
        file1Format: getFileFormat(file1.name),
        file2Format: getFileFormat(file2.name),
        comparisonDate: new Date().toISOString(),
        differences: diff,
        statistics: stats,
      };

      setComparisonResult(result);
      await saveComparisonResult(controllerId, result);
      toast.success("Comparison saved successfully");
    } catch (error) {
      console.error("Error comparing files:", error);
      toast.error("Error comparing files");
    } finally {
      setIsComparing(false);
    }
  };

  const handleHistorySelect = async (id: string) => {
    toast.info("Loading historical comparisons...");
  };

  const handleGenerateReport = () => {
    if (!comparisonResult) {
      toast.error("You should compare the files first");
      return;
    }

    try {
      const fileTypeConfig = FILE_TYPE_CONFIGS.find(
        (config) => config.type === fileType
      );
      const typeName = fileTypeConfig?.label || "Folder";

      generateAndDownloadReport(
        comparisonResult,
        fileType,
        typeName,
        folder1Name,
        folder2Name
      );
      toast.success("PDF report created successfully");
    } catch (error) {
      console.error("PDF creation error:", error);
      toast.error("An error occurred while generating the PDF report");
    }
  };

  const selectedFileTypeConfig = FILE_TYPE_CONFIGS.find(
    (config) => config.type === fileType
  );

  const renderFileSelectors = () => {
    const config = FILE_TYPE_CONFIGS.find((config) => config.type === fileType);

    if (config?.specificFiles && config.specificFiles.length > 0) {
      return (
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              Folder 1 - {config.label}
            </label>
            {filteredFiles1.length > 0 ? (
              <Select
                value={file1?.name}
                onValueChange={(value) => handleFileSelect(value, true)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select File" />
                </SelectTrigger>
                <SelectContent>
                  {filteredFiles1.map((file) => (
                    <SelectItem key={file.name} value={file.name}>
                      {file.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-gray-500">
                In this folder {config.specificFiles.join(", ")} file not found
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Folder 2 - {config.label}
            </label>
            {filteredFiles2.length > 0 ? (
              <Select
                value={file2?.name}
                onValueChange={(value) => handleFileSelect(value, false)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select folder" />
                </SelectTrigger>
                <SelectContent>
                  {filteredFiles2.map((file) => (
                    <SelectItem key={file.name} value={file.name}>
                      {file.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-gray-500">
                In this folder {config.specificFiles.join(", ")} file not found
              </p>
            )}
          </div>
        </div>
      );
    }

    if (config?.fileExtensions && config.fileExtensions.length > 0) {
      return (
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              Folder 1 - {config.label}
            </label>
            {filteredFiles1.length > 0 ? (
              <Select
                value={file1?.name}
                onValueChange={(value) => handleFileSelect(value, true)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select File" />
                </SelectTrigger>
                <SelectContent>
                  {filteredFiles1.map((file) => (
                    <SelectItem key={file.name} value={file.name}>
                      {file.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-gray-500">
                In this folder {config.fileExtensions.join(", ")} file not found
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Folder 2 - {config.label}
            </label>
            {filteredFiles2.length > 0 ? (
              <Select
                value={file2?.name}
                onValueChange={(value) => handleFileSelect(value, false)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select File" />
                </SelectTrigger>
                <SelectContent>
                  {filteredFiles2.map((file) => (
                    <SelectItem key={file.name} value={file.name}>
                      {file.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-gray-500">
                In this folder {config.fileExtensions.join(", ")} file not found
              </p>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">File 1</label>
          <input
            type="file"
            onChange={(e) =>
              handleFileChange(e.target.files?.[0] || null, true)
            }
            className="w-full"
            accept={
              selectedFileTypeConfig?.fileExtensions?.join(",") || undefined
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">File 2</label>
          <input
            type="file"
            onChange={(e) =>
              handleFileChange(e.target.files?.[0] || null, false)
            }
            className="w-full"
            accept={
              selectedFileTypeConfig?.fileExtensions?.join(",") || undefined
            }
          />
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-bold">
          {selectedFileTypeConfig?.label || "File"} Analysis
        </h2>
        {selectedFileTypeConfig?.description && (
          <p className="text-sm text-gray-500">
            {selectedFileTypeConfig.description}
          </p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {(filePreview1 || filePreview2) && (
            <div className="grid grid-cols-2 gap-6">
              {filePreview1 && <FilePreview preview={filePreview1} />}
              {filePreview2 && <FilePreview preview={filePreview2} />}
            </div>
          )}

          {renderFileSelectors()}

          <Button
            onClick={handleCompare}
            disabled={!file1 || !file2 || isComparing}
            className="w-full"
          >
            {isComparing ? "Comparing..." : "Analysis Files"}
          </Button>

          {statistics && (
            <>
              <Statistics statistics={statistics} />

              <Button
                onClick={handleGenerateReport}
                variant="outline"
                className="w-full flex items-center justify-center"
              >
                <FileDown className="mr-2 h-4 w-4" />
                Download PDF Report
              </Button>
            </>
          )}

          <Button
            variant="outline"
            onClick={() => setShowHistory(!showHistory)}
            className="w-full"
          >
            {showHistory ? "Hide History" : "Show Analysis History"}
          </Button>

          {showHistory && (
            <ComparisonHistory
              controllerId={controllerId}
              onSelect={handleHistorySelect}
            />
          )}

          {differences.length > 0 && (
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Analysis Results</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded">
                  <div className="font-medium p-2 border-b text-sm">
                    {file1?.name}
                  </div>
                  <div
                    className="p-2 max-h-[500px] overflow-auto"
                    ref={leftPanelRef}
                  >
                    {differences.map(
                      (line, index) =>
                        line.type !== "added" && (
                          <div
                            key={`left-${index}`}
                            className={`text-xs font-mono whitespace-pre ${
                              line.type === "removed"
                                ? "bg-red-100 text-red-800"
                                : ""
                            }`}
                          >
                            <span className="text-gray-500 mr-2">
                              {line.lineNumber}
                            </span>
                            {line.content}
                          </div>
                        )
                    )}
                  </div>
                </div>

                <div className="border rounded">
                  <div className="font-medium p-2 border-b text-sm">
                    {file2?.name}
                  </div>
                  <div
                    className="p-2 max-h-[500px] overflow-auto"
                    ref={rightPanelRef}
                  >
                    {differences.map(
                      (line, index) =>
                        line.type !== "removed" && (
                          <div
                            key={`right-${index}`}
                            className={`text-xs font-mono whitespace-pre ${
                              line.type === "added"
                                ? "bg-green-100 text-green-800"
                                : ""
                            }`}
                          >
                            <span className="text-gray-500 mr-2">
                              {line.lineNumber}
                            </span>
                            {line.content}
                          </div>
                        )
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FileComparison;
