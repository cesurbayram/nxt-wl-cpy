"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  RefreshCw,
  Calendar,
  Settings,
  FileText,
  Plus,
  Minus,
  Edit,
  BookOpen,
  TrendingUp,
  Clock,
} from "lucide-react";
import { getLogFileContent } from "@/utils/service/system-expectations/log-data";
import { LogEntry } from "@/types/log-content.types";
import {
  TeachingEvent,
  TeachingStatistics,
  TeachingAnalysisProps,
} from "@/types/teaching-analysis.types";
import { toast } from "sonner";

const TeachingAnalysis: React.FC<TeachingAnalysisProps> = ({
  controllerId,
  isVisible,
  refreshTrigger = 0,
}) => {
  const [teachingEvents, setTeachingEvents] = useState<TeachingEvent[]>([]);
  const [statistics, setStatistics] = useState<TeachingStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [filteredEvents, setFilteredEvents] = useState<TeachingEvent[]>([]);

  useEffect(() => {
    if (isVisible && controllerId) {
      analyzeTeachingActivities();
    }
  }, [controllerId, isVisible, refreshTrigger]);

  const analyzeTeachingActivities = async () => {
    if (!controllerId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await getLogFileContent(controllerId);

      if (response.success && response.data) {
        const events = extractTeachingEvents(response.data);
        const stats = calculateStatistics(events);

        setTeachingEvents(events);
        setStatistics(stats);
        setFilteredEvents(
          selectedFile
            ? events.filter((e) => e.fileName === selectedFile)
            : events
        );
      } else {
        setError(response.error || "Failed to analyze teaching activities");
        setTeachingEvents([]);
        setStatistics(null);
      }
    } catch (error) {
      console.error("Error analyzing teaching activities:", error);
      setError("Failed to analyze teaching activities");
      setTeachingEvents([]);
      setStatistics(null);
    } finally {
      setIsLoading(false);
    }
  };

  const extractTeachingEvents = (logEntries: LogEntry[]): TeachingEvent[] => {
    const events: TeachingEvent[] = [];

    logEntries.forEach((entry) => {
      const event = entry.event?.toLowerCase() || "";

      if (event.includes("job edit(p. mod)")) {
        events.push({
          index: entry.index,
          date: entry.date || "",
          type: "POINT_MODIFICATION",
          fileName: entry.fields["FILE NAME"],
          lineNumber: entry.fields["LINE"],
          details: `Point modified in ${entry.fields["FILE NAME"]} at line ${entry.fields["LINE"]}`,
          rawEntry: entry.rawData,
        });
      } else if (event.includes("job edit(ins)")) {
        events.push({
          index: entry.index,
          date: entry.date || "",
          type: "INSTRUCTION_INSERT",
          fileName: entry.fields["FILE NAME"],
          lineNumber: entry.fields["LINE"],
          details: `Instruction inserted: ${
            entry.fields["AFTER EDIT"] || "Unknown"
          }`,
          rawEntry: entry.rawData,
        });
      } else if (event.includes("job edit(del)")) {
        events.push({
          index: entry.index,
          date: entry.date || "",
          type: "INSTRUCTION_DELETE",
          fileName: entry.fields["FILE NAME"],
          lineNumber: entry.fields["LINE"],
          details: `Instruction deleted: ${
            entry.fields["DELETED LINE"] || "Unknown"
          }`,
          rawEntry: entry.rawData,
        });
      } else if (event.includes("teach mode")) {
        events.push({
          index: entry.index,
          date: entry.date || "",
          type: "TEACH_MODE",
          details: "Robot entered teach mode",
          rawEntry: entry.rawData,
        });
      }
    });

    return events.sort((a, b) => b.index - a.index);
  };

  const handleFileClick = (fileName: string) => {
    if (selectedFile === fileName) {
      setSelectedFile(null);
      setFilteredEvents(teachingEvents);
    } else {
      setSelectedFile(fileName);
      const filtered = teachingEvents.filter(
        (event) => event.fileName === fileName
      );
      setFilteredEvents(filtered);
    }
  };

  const calculateStatistics = (events: TeachingEvent[]): TeachingStatistics => {
    const fileModifications: {
      [key: string]: {
        count: number;
        lastDate: string;
        lastEvent: TeachingEvent;
      };
    } = {};

    events.forEach((event) => {
      if (event.fileName) {
        if (!fileModifications[event.fileName]) {
          fileModifications[event.fileName] = {
            count: 0,
            lastDate: event.date,
            lastEvent: event,
          };
        }
        fileModifications[event.fileName].count += 1;

        if (event.index > fileModifications[event.fileName].lastEvent.index) {
          fileModifications[event.fileName].lastDate = event.date;
          fileModifications[event.fileName].lastEvent = event;
        }
      }
    });

    const mostModifiedFiles = Object.entries(fileModifications)
      .map(([fileName, data]) => ({
        fileName,
        count: data.count,
        lastTeachingDate: data.lastDate,
        lastEvent: data.lastEvent,
      }))
      .sort((a, b) => {
        const dateComparison =
          new Date(b.lastTeachingDate).getTime() -
          new Date(a.lastTeachingDate).getTime();
        if (dateComparison !== 0) return dateComparison;

        return b.count - a.count;
      })
      .slice(0, 5);

    return {
      totalTeachingEvents: events.length,
      pointModifications: events.filter((e) => e.type === "POINT_MODIFICATION")
        .length,
      instructionInserts: events.filter((e) => e.type === "INSTRUCTION_INSERT")
        .length,
      instructionDeletes: events.filter((e) => e.type === "INSTRUCTION_DELETE")
        .length,
      teachModeActivations: events.filter((e) => e.type === "TEACH_MODE")
        .length,
      lastTeachingDate: events.length > 0 ? events[0].date : undefined,
      mostModifiedFiles,
    };
  };

  const getEventIcon = (type: TeachingEvent["type"]) => {
    switch (type) {
      case "POINT_MODIFICATION":
        return <Edit className="w-4 h-4 text-blue-600" />;
      case "INSTRUCTION_INSERT":
        return <Plus className="w-4 h-4 text-green-600" />;
      case "INSTRUCTION_DELETE":
        return <Minus className="w-4 h-4 text-red-600" />;
      case "TEACH_MODE":
        return <BookOpen className="w-4 h-4 text-orange-600" />;
      default:
        return <Settings className="w-4 h-4 text-gray-600" />;
    }
  };

  const getEventColor = (type: TeachingEvent["type"]) => {
    switch (type) {
      case "POINT_MODIFICATION":
        return "bg-blue-50 border-blue-200";
      case "INSTRUCTION_INSERT":
        return "bg-green-50 border-green-200";
      case "INSTRUCTION_DELETE":
        return "bg-red-50 border-red-200";
      case "TEACH_MODE":
        return "bg-orange-50 border-orange-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr.trim() === "") {
      return { date: "No Date", time: "" };
    }

    try {
      const [datePart, timePart] = dateStr.trim().split(" ");

      if (datePart && timePart) {
        const [year, month, day] = datePart.split("/");

        if (
          !year ||
          !month ||
          !day ||
          isNaN(parseInt(year)) ||
          isNaN(parseInt(month)) ||
          isNaN(parseInt(day)) ||
          year.length !== 4
        ) {
          return { date: dateStr, time: "" };
        }

        const paddedMonth = month.padStart(2, "0");
        const paddedDay = day.padStart(2, "0");

        const timeFormatted = timePart.includes(":")
          ? timePart
          : timePart + ":00";

        const parsedDate = new Date(
          `${year}-${paddedMonth}-${paddedDay}T${timeFormatted}`
        );

        if (isNaN(parsedDate.getTime())) {
          console.warn("Invalid date parsed:", dateStr);
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
      console.error("Error parsing date:", error, "Original:", dateStr);
    }

    return { date: dateStr || "Invalid Date", time: "" };
  };

  if (!isVisible) return null;

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Teaching Activity Analysis
            {statistics && (
              <span className="text-sm text-gray-500 font-normal">
                ({statistics.totalTeachingEvents} events)
              </span>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={analyzeTeachingActivities}
            disabled={isLoading}
            className="text-xs"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <TrendingUp className="w-4 h-4 mr-2" />
            )}
            {isLoading ? "Analyzing..." : "Refresh Analysis"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin mr-2 text-blue-600" />
            <span>Analyzing teaching activities...</span>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="font-medium">{error}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={analyzeTeachingActivities}
              className="mt-3"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        ) : statistics ? (
          <div className="space-y-5">
            {statistics.mostModifiedFiles.length > 0 && (
              <div
                className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 cursor-pointer hover:shadow-md transition-all"
                onClick={() => {
                  const latestEvent = statistics.mostModifiedFiles[0].lastEvent;
                  setSelectedFile(latestEvent.fileName || null);
                  const filtered = teachingEvents.filter(
                    (e) => e.fileName === latestEvent.fileName
                  );
                  setFilteredEvents(filtered);
                }}
              >
                <h4 className="text-sm font-medium mb-2 flex items-center gap-2 text-blue-800">
                  <Clock className="w-4 h-4" />
                  Latest Teaching Activity
                  <span className="text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded ml-auto">
                    Click to view details
                  </span>
                </h4>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-bold text-blue-900">
                      {statistics.mostModifiedFiles[0].fileName}
                    </div>
                    <div className="text-sm text-blue-700">
                      Most recently taught job file
                    </div>
                    {statistics.mostModifiedFiles[0].lastEvent.lineNumber && (
                      <div className="text-xs text-blue-600 mt-1">
                        Last modified line:{" "}
                        {statistics.mostModifiedFiles[0].lastEvent.lineNumber}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-blue-600">
                      {formatDate(
                        statistics.mostModifiedFiles[0].lastTeachingDate
                      ).date || "Invalid Date"}
                    </div>
                    <div className="text-xs text-blue-500">
                      {formatDate(
                        statistics.mostModifiedFiles[0].lastTeachingDate
                      ).time || ""}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-center">
                  <Edit className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                  <div className="text-lg font-bold text-blue-700">
                    {statistics.pointModifications}
                  </div>
                  <div className="text-xs text-blue-600">Point Mods</div>
                </div>
              </div>

              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="text-center">
                  <Plus className="w-5 h-5 mx-auto mb-1 text-green-600" />
                  <div className="text-lg font-bold text-green-700">
                    {statistics.instructionInserts}
                  </div>
                  <div className="text-xs text-green-600">Inserts</div>
                </div>
              </div>

              <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="text-center">
                  <Minus className="w-5 h-5 mx-auto mb-1 text-red-600" />
                  <div className="text-lg font-bold text-red-700">
                    {statistics.instructionDeletes}
                  </div>
                  <div className="text-xs text-red-600">Deletes</div>
                </div>
              </div>

              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-center">
                  <BookOpen className="w-5 h-5 mx-auto mb-1 text-orange-600" />
                  <div className="text-lg font-bold text-orange-700">
                    {statistics.teachModeActivations}
                  </div>
                  <div className="text-xs text-orange-600">Teach Mode</div>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-center">
                  <Calendar className="w-5 h-5 mx-auto mb-1 text-gray-600" />
                  <div className="text-lg font-bold text-gray-700">
                    {statistics.totalTeachingEvents}
                  </div>
                  <div className="text-xs text-gray-600">Total Events</div>
                </div>
              </div>
            </div>

            {statistics.mostModifiedFiles.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Most Modified Job Files
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {statistics.mostModifiedFiles.map((file, index) => (
                    <div
                      key={file.fileName}
                      className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                        selectedFile === file.fileName
                          ? "bg-blue-100 border-blue-300 shadow-md"
                          : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                      }`}
                      onClick={() => handleFileClick(file.fileName)}
                    >
                      <div
                        className={`text-sm font-medium mb-1 ${
                          selectedFile === file.fileName
                            ? "text-blue-900"
                            : "text-gray-900"
                        }`}
                      >
                        {file.fileName}
                        {selectedFile === file.fileName && (
                          <span className="ml-2 text-xs bg-blue-200 px-2 py-1 rounded">
                            Filtered
                          </span>
                        )}
                        {index === 0 && (
                          <span className="ml-2 text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                            Latest
                          </span>
                        )}
                      </div>
                      <div
                        className={`text-xs font-medium ${
                          selectedFile === file.fileName
                            ? "text-blue-700"
                            : "text-blue-600"
                        }`}
                      >
                        {file.count} modifications
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Last: {formatDate(file.lastTeachingDate).date}{" "}
                        {formatDate(file.lastTeachingDate).time}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {selectedFile
                  ? `Teaching Events for ${selectedFile}`
                  : "Recent Teaching Events"}
                {selectedFile && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleFileClick(selectedFile)}
                    className="text-xs ml-2"
                  >
                    Clear Filter
                  </Button>
                )}
              </h4>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {(selectedFile ? filteredEvents : teachingEvents)
                  .slice(0, 20)
                  .map((event) => {
                    const { date, time } = formatDate(event.date);

                    return (
                      <div
                        key={event.index}
                        className={`p-3 rounded-lg border ${getEventColor(
                          event.type
                        )}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono bg-white px-2 py-1 rounded">
                              #{event.index}
                            </span>
                            {getEventIcon(event.type)}
                            <div>
                              <div className="text-sm font-medium">
                                {event.details}
                              </div>
                              {event.fileName && (
                                <div className="text-xs text-gray-600 mt-1">
                                  File: {event.fileName}{" "}
                                  {event.lineNumber &&
                                    `(Line ${event.lineNumber})`}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="text-right text-xs text-gray-500">
                            <div>{date}</div>
                            {time && <div>{time}</div>}
                          </div>
                        </div>

                        {event.rawEntry && (
                          <details className="mt-3">
                            <summary className="cursor-pointer text-xs text-blue-600 hover:text-blue-800 font-medium">
                              Show Technical Details (CURR VALUE, etc.)
                            </summary>
                            <div className="mt-2 p-3 bg-gray-50 rounded border text-xs">
                              <pre className="whitespace-pre-wrap overflow-x-auto font-mono text-gray-700">
                                {event.rawEntry}
                              </pre>
                            </div>
                          </details>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No teaching activities found</p>
            <p className="text-sm mt-1">
              Teaching activities will appear here after analysis
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TeachingAnalysis;
