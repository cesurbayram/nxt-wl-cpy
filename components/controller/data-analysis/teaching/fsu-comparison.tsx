import React, { useState, useEffect } from "react";
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
  filterFilesByFSUSubType,
  isFileMatchingFSUSubType,
} from "@/utils/common/teaching-utils";
import { generateAndDownloadReport } from "@/utils/common/pdf-utils";
import { saveComparisonResult } from "@/utils/service/teaching";
import {
  ComparisonResult,
  FilePreview as FilePreviewInterface,
  ComparisonStatistics,
  FSUSubType,
  FSU_SUBTYPE_CONFIGS,
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

interface FSUComparisonProps {
  controllerId: string;
  selectedSubType: FSUSubType | null;
  folder1Files?: File[];
  folder2Files?: File[];
  folder1Name?: string;
  folder2Name?: string;
}

const FSUComparison: React.FC<FSUComparisonProps> = ({
  controllerId,
  selectedSubType,
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

  useEffect(() => {
    setFile1(null);
    setFile2(null);
    setFilePreview1(null);
    setFilePreview2(null);
    setDifferences([]);
    setStatistics(null);
    setComparisonResult(null);
  }, [selectedSubType]);

  useEffect(() => {
    if (!selectedSubType) return;

    if (folder1Files.length > 0) {
      const filtered = folder1Files.filter((file) =>
        isFileMatchingFSUSubType(file.name, selectedSubType)
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
        isFileMatchingFSUSubType(file.name, selectedSubType)
      );
      setFilteredFiles2(filtered);

      if (filtered.length === 1) {
        handleFileChange(filtered[0], false);
      }
    } else {
      setFilteredFiles2([]);
    }
  }, [folder1Files, folder2Files, selectedSubType]);

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
    toast.info("Loading historical analysis...");
  };

  const handleGenerateReport = () => {
    if (!comparisonResult || !selectedSubType) {
      toast.error("You should anlys the files first");
      return;
    }

    try {
      const subTypeConfig = FSU_SUBTYPE_CONFIGS.find(
        (config) => config.type === selectedSubType
      );
      const typeName = `FSU - ${subTypeConfig?.label || ""}`;

      generateAndDownloadReport(
        comparisonResult,
        selectedSubType,
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

  const selectedSubTypeConfig = selectedSubType
    ? FSU_SUBTYPE_CONFIGS.find((config) => config.type === selectedSubType)
    : null;

  if (!selectedSubType) {
    return (
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold">FSU Analysis</h2>
          <p className="text-sm text-gray-500">
            Please select an FSU subcategory from the left menu.
          </p>
        </CardHeader>
      </Card>
    );
  }

  const renderFileSelectors = () => {
    if (!selectedSubTypeConfig) return null;

    return (
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-1">
            Folder 1 - {selectedSubTypeConfig.label}
          </label>
          {filteredFiles1.length > 0 ? (
            <Select
              value={file1?.name}
              onValueChange={(value) => handleFileSelect(value, true)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Folder" />
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
              In this folder {selectedSubTypeConfig.specificFiles?.join(", ")}{" "}
              file not found
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Folder 2 - {selectedSubTypeConfig.label}
          </label>
          {filteredFiles2.length > 0 ? (
            <Select
              value={file2?.name}
              onValueChange={(value) => handleFileSelect(value, false)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Folder" />
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
              In this folder {selectedSubTypeConfig.specificFiles?.join(", ")}{" "}
              file not found
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-bold">
          FSU - {selectedSubTypeConfig?.label || ""} Analysis
        </h2>
        {selectedSubTypeConfig?.description && (
          <p className="text-sm text-gray-500">
            {selectedSubTypeConfig.description}
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
                  <div className="p-2">
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
                  <div className="p-2">
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

export default FSUComparison;
