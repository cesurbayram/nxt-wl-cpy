"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  Calendar,
  User,
  Settings,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { getLogFileContent } from "@/utils/service/system-expectations/log-data";
import {
  LogEntry,
  LogFileContentResponse,
  LogContentDisplayProps,
} from "@/types/log-content.types";
import { toast } from "sonner";

const LogContentDisplay: React.FC<LogContentDisplayProps> = ({
  controllerId,
  isVisible,
  refreshTrigger = 0,
}) => {
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastModified, setLastModified] = useState<string | null>(null);
  const [filePath, setFilePath] = useState<string | null>(null);

  useEffect(() => {
    if (isVisible && controllerId) {
      fetchLogContent();
    }
  }, [controllerId, isVisible, refreshTrigger]);

  const fetchLogContent = async () => {
    if (!controllerId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await getLogFileContent(controllerId);

      if (response.success && response.data) {
        setLogEntries(response.data);
        setLastModified(response.lastModified || null);
        setFilePath(response.filePath || null);
      } else {
        setError(response.error || "Failed to fetch log content");
        setLogEntries([]);
      }
    } catch (error) {
      console.error("Error fetching log content:", error);
      setError("Failed to fetch log content");
      setLogEntries([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getEventIcon = (event: string) => {
    const eventLower = event.toLowerCase();
    if (eventLower.includes("select") || eventLower.includes("job")) {
      return <Settings className="w-4 h-4 text-blue-600" />;
    }
    if (eventLower.includes("teach")) {
      return <User className="w-4 h-4 text-yellow-600" />;
    }
    if (eventLower.includes("play")) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
    return <FileText className="w-4 h-4 text-gray-600" />;
  };

  const getEventBadgeColor = (event: string) => {
    const eventLower = event.toLowerCase();
    if (eventLower.includes("select") || eventLower.includes("job")) {
      return "bg-blue-100 text-blue-800 border-blue-200";
    }
    if (eventLower.includes("teach")) {
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
    if (eventLower.includes("play")) {
      return "bg-green-100 text-green-800 border-green-200";
    }
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr.trim() === "") {
      return { date: "Invalid Date", time: "" };
    }

    try {
      const [datePart, timePart] = dateStr.split(" ");
      if (datePart && timePart) {
        const [year, month, day] = datePart.split("/");

        if (!year || !month || !day || year.length !== 4) {
          return { date: dateStr, time: "" };
        }

        const parsedDate = new Date(
          `${year}-${month.padStart(2, "0")}-${day.padStart(
            2,
            "0"
          )}T${timePart}:00`
        );

        if (isNaN(parsedDate.getTime())) {
          return { date: dateStr, time: "" };
        }

        return {
          date: parsedDate.toLocaleDateString("tr-TR"),
          time: parsedDate.toLocaleTimeString("tr-TR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
      }
    } catch (error) {
      console.error("Error parsing date:", error);
    }

    return { date: dateStr || "Invalid Date", time: "" };
  };

  if (!isVisible) return null;

  return (
    <Card className="h-fit flex flex-col">
      <CardHeader>
        <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <span className="text-base sm:text-lg break-words">Log Data Content</span>
            {logEntries.length > 0 && (
              <span className="text-sm text-gray-500 font-normal whitespace-nowrap">
                ({logEntries.length} entries)
              </span>
            )}
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            {lastModified && (
              <span className="text-xs text-gray-500 break-words">
                Last modified: {new Date(lastModified).toLocaleString("tr-TR")}
              </span>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchLogContent}
              disabled={isLoading}
              className="text-xs flex-shrink-0 w-full sm:w-auto"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Refresh
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin mr-2 text-blue-600" />
            <span>Loading log content...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
            <p className="text-red-600 font-medium">{error}</p>
            {filePath && (
              <p className="text-sm text-gray-500 mt-1">
                Expected file path: {filePath}
              </p>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchLogContent}
              className="mt-3"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        ) : logEntries.length > 0 ? (
          <div className="space-y-4 max-h-[550px] overflow-y-auto">
            {logEntries.map((entry) => {
              const { date, time } = formatDate(entry.date || "");

              return (
                <div
                  key={entry.index}
                  className="p-3 rounded-lg border border-gray-200 hover:shadow-md transition-shadow bg-white"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-3 mb-3">
                    <div className="flex items-start gap-2 sm:gap-3 flex-wrap">
                      <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded whitespace-nowrap flex-shrink-0">
                        #{entry.index}
                      </span>
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex-shrink-0">
                          {getEventIcon(entry.event || "")}
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border break-words ${getEventBadgeColor(
                            entry.event || ""
                          )}`}
                        >
                          {entry.event || "N/A"}
                        </span>
                      </div>
                    </div>
                    <div className="text-left sm:text-right text-sm text-gray-600 flex-shrink-0">
                      <div className="flex items-center gap-1 whitespace-nowrap">
                        <Calendar className="w-3 h-3" />
                        {date}
                      </div>
                      {time && (
                        <div className="flex items-center gap-1 whitespace-nowrap">
                          <Clock className="w-3 h-3" />
                          {time}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    {entry.loginName && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <span className="text-gray-600 whitespace-nowrap">Login Name:</span>
                        <span className="font-medium break-words">
                          {entry.loginName || "N/A"}
                        </span>
                      </div>
                    )}

                    {/* Dinamik fieldları göster */}
                    {Object.entries(entry.fields).map(([key, value]) => {
                      // Önemli fieldları öne çıkar
                      const isImportant = [
                        "TASK",
                        "JOB NAME",
                        "LINE",
                        "STOP FACTOR",
                      ].includes(key);
                      const isJobName = key === "JOB NAME";

                      return (
                        <div
                          key={key}
                          className={
                            isJobName
                              ? "col-span-full flex items-center gap-2 flex-wrap"
                              : "flex items-center gap-2 flex-wrap"
                          }
                        >
                          <Settings className="w-4 h-4 text-gray-500 flex-shrink-0" />
                          <span className="text-gray-600 whitespace-nowrap">{key}:</span>
                          <span
                            className={`font-medium break-all ${
                              isJobName
                                ? "text-blue-700"
                                : isImportant
                                ? "text-green-700"
                                : ""
                            }`}
                          >
                            {value || "N/A"}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <details className="mt-3">
                    <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700">
                      Show raw data
                    </summary>
                    <pre className="mt-2 text-xs bg-gray-50 p-2 rounded border overflow-x-auto break-all whitespace-pre-wrap">
                      {entry.rawData}
                    </pre>
                  </details>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No log data found</p>
            <p className="text-sm mt-1">
              Fetch log data first to see the content
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchLogContent}
              className="mt-3"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Check for Log Data
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LogContentDisplay;
