import React, { useState } from "react";
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
} from "@/utils/common/teaching-utils";
import { saveComparisonResult } from "@/utils/service/teaching";
import {
  ComparisonResult,
  FilePreview as FilePreviewInterface,
  ComparisonStatistics,
} from "@/types/teaching.types";

interface TeachingProps {
  controllerId: string;
}

interface ProcessedDiffLine {
  content: string;
  type: "added" | "removed" | "normal";
  lineNumber: number;
}

export const Teaching: React.FC<TeachingProps> = ({ controllerId }) => {
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

  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-bold">File Comparison</h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {(filePreview1 || filePreview2) && (
            <div className="grid grid-cols-2 gap-6">
              {filePreview1 && <FilePreview preview={filePreview1} />}
              {filePreview2 && <FilePreview preview={filePreview2} />}
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            <div>
              <input
                type="file"
                onChange={(e) =>
                  handleFileChange(e.target.files?.[0] || null, true)
                }
                className="w-full"
              />
            </div>
            <div>
              <input
                type="file"
                onChange={(e) =>
                  handleFileChange(e.target.files?.[0] || null, false)
                }
                className="w-full"
              />
            </div>
          </div>

          <Button
            onClick={handleCompare}
            disabled={!file1 || !file2 || isComparing}
            className="w-full"
          >
            {isComparing ? "Comparing..." : "Compare Files"}
          </Button>

          {statistics && <Statistics statistics={statistics} />}

          <Button
            variant="outline"
            onClick={() => setShowHistory(!showHistory)}
            className="w-full"
          >
            {showHistory ? "Hide History" : "Show Comparison History"}
          </Button>

          {showHistory && (
            <ComparisonHistory
              controllerId={controllerId}
              onSelect={handleHistorySelect}
            />
          )}

          {/* Comparison Results */}
          {differences.length > 0 && (
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Comparison Results</h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Sol Dosya */}
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
                            className={`flex hover:bg-gray-100 ${
                              line.type === "removed"
                                ? "bg-red-100"
                                : "bg-gray-50"
                            }`}
                          >
                            <span className="w-[50px] text-gray-400 select-none text-right pr-3 font-mono text-xs border-r mr-3">
                              {line.lineNumber}
                            </span>
                            <pre className="whitespace-pre flex-1 text-xs">
                              {line.content || " "}
                            </pre>
                          </div>
                        )
                    )}
                  </div>
                </div>

                {/* Sağ Dosya */}
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
                            className={`flex hover:bg-gray-100 ${
                              line.type === "added"
                                ? "bg-red-100"
                                : "bg-gray-50"
                            }`}
                          >
                            <span className="w-[50px] text-gray-400 select-none text-right pr-3 font-mono text-xs border-r mr-3">
                              {line.lineNumber}
                            </span>
                            <pre className="whitespace-pre flex-1 text-xs">
                              {line.content || " "}
                            </pre>
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

export default Teaching;
