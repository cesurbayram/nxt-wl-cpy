"use client";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RefreshCw,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Clock,
  AlertTriangle,
  Settings,
} from "lucide-react";
import { getController } from "@/utils/service/controller";
import { Controller } from "@/types/controller.types";
import { getLogFileContent } from "@/utils/service/system-expectations/log-data";
import { LogEntry } from "@/types/log-content.types";
import {
  TCPDataEntry,
  TCPComparison,
  TCPToolData,
} from "@/types/tcp-log-change.types";

const TCPChangeLogs: React.FC = () => {
  const [controllers, setControllers] = useState<Controller[]>([]);
  const [selectedController, setSelectedController] = useState<string>("");
  const [tcpDataEntries, setTcpDataEntries] = useState<TCPDataEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latestComparison, setLatestComparison] = useState<TCPComparison[]>([]);

  useEffect(() => {
    fetchControllers();
  }, []);

  useEffect(() => {
    if (selectedController) {
      analyzeTCPData();
    }
  }, [selectedController]);

  const fetchControllers = async () => {
    try {
      const controllers = await getController();
      setControllers(controllers);
      if (controllers.length > 0 && controllers[0].id) {
        setSelectedController(controllers[0].id);
      }
    } catch (error) {
      console.error("Error fetching controllers:", error);
    }
  };

  const parseElementNumber = (elementNumber: string) => {
    
    const parts = elementNumber.split("-");
    if (parts.length !== 3) {
      return null;
    }

    const N = parseInt(parts[0]); 
    const M = parseInt(parts[1]); 
    const K = parseInt(parts[2]); 

    
    let parameterName = "Unknown";
    let parameterGroupName = "Unknown";

    if (M === 1) {
      
      const toolDataNames = ["X", "Y", "Z", "Rx", "Ry", "Rz"];
      parameterName = toolDataNames[K] || "Unknown";
      parameterGroupName = "TOOL Data";
    } else if (M === 2) {
      
      const toolDataNames = ["X", "Y", "Z", "Rx", "Ry", "Rz"];
      parameterName = toolDataNames[K] || "Unknown";
      parameterGroupName = "TOOL Data (M=2)";
    } else if (M === 9) {
      
      const toolGeometryNames = ["Xg", "Yg", "Zg", "Ix", "Iy", "Iz"];
      parameterName = toolGeometryNames[K] || "Unknown";
      parameterGroupName = "TOOL Geometry";
    }

    return {
      toolNumber: N,
      parameterGroup: M,
      parameterGroupName,
      parameterIndex: K,
      parameterName,
      actualToolNumber: N - 1, // Gerçek tool numarası
    };
  };

  const extractTCPDataEvents = (logEntries: LogEntry[]): TCPDataEntry[] => {
    console.log("TCP: Total log entries received:", logEntries.length);

    // İlk 10 entry'yi görelim
    console.log(
      "TCP: First 10 entries sample:",
      logEntries.slice(0, 10).map((entry) => ({
        index: entry.index,
        event: entry.event,
        fields: Object.keys(entry.fields || {}),
      }))
    );

    
    const uniqueEvents = new Set<string>();
    logEntries.forEach((entry) => {
      if (entry.event) uniqueEvents.add(entry.event);
    });
    console.log(
      "TCP: All unique events found:",
      Array.from(uniqueEvents).sort()
    );

    const events: TCPDataEntry[] = [];
    let otherFileEditCount = 0;
    let toolFileCount = 0;
    let validElementCount = 0;
    let allEvents: string[] = [];

    logEntries.forEach((entry, index) => {
      const event = entry.event?.toLowerCase() || "";

      
      const fields = entry.fields || {};
      const fileNameFieldKey = Object.keys(fields).find(
        (k) => k.trim().toLowerCase() === "file name"
      );
      const elementNumberKey = Object.keys(fields).find(
        (k) => k.trim().toLowerCase() === "element number"
      );
      const elementValueKey = Object.keys(fields).find(
        (k) => k.trim().toLowerCase() === "element value"
      );
      const afterEditKey = Object.keys(fields).find(
        (k) => k.trim().toLowerCase() === "after edit"
      );
      const beforeEditKey = Object.keys(fields).find(
        (k) => k.trim().toLowerCase() === "before edit"
      );

      let fileName = (fileNameFieldKey ? fields[fileNameFieldKey] : "") || "";
      let elementNumber =
        (elementNumberKey ? fields[elementNumberKey] : "") || "";
      let elementValue = (elementValueKey ? fields[elementValueKey] : "") || "";
      let afterEdit = (afterEditKey ? fields[afterEditKey] : "") || "";
      let beforeEdit = (beforeEditKey ? fields[beforeEditKey] : "") || "";

      
      if (!elementValue && afterEdit) {
        elementValue = afterEdit;
      }

      
      if (!fileName && entry.rawData) {
        const m = entry.rawData.match(/FILE NAME\s*:\s*(\S+)/i);
        if (m) fileName = m[1];
      }
      if (!elementNumber && entry.rawData) {
        const m = entry.rawData.match(/ELEMENT NUMBER\s*:\s*([\d-]+)/i);
        if (m) elementNumber = m[1];
      }
      if (!elementValue && entry.rawData) {
        const m = entry.rawData.match(
          /ELEMENT VALUE\s*:\s*([-+]?\d+(?:\.\d+)?)/i
        );
        if (m) elementValue = m[1];
      }

      
      if (event.includes("other file edit")) {
        otherFileEditCount++;
        console.log(
          `TCP: OTHER FILE EDIT found #${otherFileEditCount} - fileName: "${fileName}"`
        );

        if (fileName.toLowerCase() === "tool") {
          toolFileCount++;
          console.log(
            `TCP: TOOL file found #${toolFileCount} - elementNumber: "${elementNumber}"`
          );
        }
      }

      
      if (
        (event.includes("other file edit") ||
          event.includes("other file edt")) &&
        fileName.toLowerCase() === "tool"
      ) {
        const parsedElement = parseElementNumber(elementNumber);

        if (parsedElement) {
          validElementCount++;
          console.log(`TCP: Valid element #${validElementCount}:`, {
            elementNumber,
            elementValue,
            parsedElement,
          });

          events.push({
            index: entry.index,
            date: entry.date || "",
            event: entry.event || "",
            fileName,
            elementNumber,
            elementValue,
            parsedElement,
            rawEntry: entry.rawData,
          });
        } else {
          console.log("TCP: Invalid element number format:", elementNumber);
        }
      }
    });

    console.log("TCP: Filtering summary:", {
      totalEntries: logEntries.length,
      otherFileEditCount,
      toolFileCount,
      validElementCount,
      finalEventsCount: events.length,
    });

    
    return events.sort((a, b) => {
      if (a.date && b.date) {
        const dateA = new Date(
          a.date.replace(
            /(\d{4})\/(\d{2})\/(\d{2}) (\d{2}):(\d{2}):(\d{2})/,
            "$1-$2-$3T$4:$5:$6"
          )
        );
        const dateB = new Date(
          b.date.replace(
            /(\d{4})\/(\d{2})\/(\d{2}) (\d{2}):(\d{2}):(\d{2})/,
            "$1-$2-$3T$4:$5:$6"
          )
        );
        return dateB.getTime() - dateA.getTime(); 
      }
      return b.index - a.index; 
    });
  };

  const compareValues = (entries: TCPDataEntry[]): TCPComparison[] => {
    if (entries.length < 2) return [];

    const comparisons: TCPComparison[] = [];

   
    for (let i = 0; i < Math.min(entries.length - 1, 5); i++) {
      const current = entries[i];
      const previous = entries[i + 1];

      
      if (current.elementNumber === previous.elementNumber) {
        const newVal = parseFloat(current.elementValue) || 0;
        const oldVal = parseFloat(previous.elementValue) || 0;
        const change = newVal - oldVal;
        const changePercent =
          oldVal !== 0 ? (change / Math.abs(oldVal)) * 100 : 0;

        comparisons.push({
          toolNumber: current.parsedElement.actualToolNumber,
          parameterName: current.parsedElement.parameterName,
          parameterGroupName: current.parsedElement.parameterGroupName,
          elementNumber: current.elementNumber,
          oldValue: oldVal,
          newValue: newVal,
          change,
          changePercent,
        });
      }
    }

    return comparisons;
  };

  const analyzeTCPData = async () => {
    if (!selectedController) {
      console.log("TCP: No controller selected");
      return;
    }

    console.log("TCP: Starting analysis for controller:", selectedController);
    setIsLoading(true);
    setError(null);

    try {
      const response = await getLogFileContent(selectedController);
      console.log("TCP: API response:", {
        success: response.success,
        dataLength: response.data?.length || 0,
        error: response.error,
      });

      if (response.success && response.data) {
        console.log("TCP: Processing log data...");
        const events = extractTCPDataEvents(response.data);
        const comparison = compareValues(events);

        console.log("TCP: Analysis complete:", {
          eventsFound: events.length,
          comparisonsFound: comparison.length,
        });

        setTcpDataEntries(events);
        setLatestComparison(comparison);
      } else {
        console.log("TCP: API error:", response.error);
        setError(response.error || "Failed to analyze TCP data");
        setTcpDataEntries([]);
        setLatestComparison([]);
      }
    } catch (error) {
      console.error("TCP: Exception during analysis:", error);
      setError("Failed to analyze TCP data");
      setTcpDataEntries([]);
      setLatestComparison([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr.trim() === "") return { date: "No Date", time: "" };

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

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (change < 0) return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-600";
  };

  return (
    <div className="space-y-6">
      
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
           
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Controller:
              </span>
              <Select
                value={selectedController}
                onValueChange={setSelectedController}
              >
                <SelectTrigger className="h-9 w-full sm:w-auto sm:min-w-[200px]">
                  <SelectValue placeholder="Select controller" />
                </SelectTrigger>
                <SelectContent>
                  {controllers.map((controller) => (
                    <SelectItem key={controller.id} value={controller.id || ""}>
                      {controller.name} ({controller.ipAddress})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            
            <Button
              onClick={analyzeTCPData}
              disabled={isLoading || !selectedController}
              className="bg-blue-600 hover:bg-blue-700 text-white w-full lg:w-auto px-4 lg:px-6 py-2"
              size="sm"
            >
              {isLoading ? (
                <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 animate-spin mr-1 sm:mr-2" />
              ) : (
                <Activity className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
              )}
              {isLoading ? "Analyzing..." : "Analyze Data"}
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card className="h-fit">
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin mr-2 text-blue-600" />
              <span>Analyzing TCP data...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="font-medium">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={analyzeTCPData}
                className="mt-3"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : tcpDataEntries.length > 0 ? (
            <div className="space-y-5">
              
              {latestComparison.length > 0 && tcpDataEntries.length >= 2 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-80">
                  
                  <div className="p-5 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200 h-full flex flex-col">
                    <h4 className="text-base font-medium mb-4 flex items-center gap-2 text-green-800">
                      <TrendingUp className="w-5 h-5" />
                      Latest TCP Changes Analysis
                      <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded ml-auto">
                        #{tcpDataEntries[0].index} vs #{tcpDataEntries[1].index}
                      </span>
                    </h4>
                    <div className="space-y-3 flex-1">
                      {latestComparison.map((comp, index) => (
                        <div
                          key={`${comp.elementNumber}-${index}`}
                          className="p-3 bg-white rounded-lg border shadow-sm"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-800">
                                TOOL {comp.toolNumber} - {comp.parameterName}
                              </span>
                              {getChangeIcon(comp.change)}
                            </div>
                            <div className="text-right">
                              <div
                                className={`text-sm font-bold ${getChangeColor(
                                  comp.change
                                )}`}
                              >
                                {comp.change > 0 ? "+" : ""}
                                {comp.change}
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-gray-600 flex items-center justify-between">
                            <span>Previous: {comp.oldValue}</span>
                            <span>→</span>
                            <span>Current: {comp.newValue}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Element: {comp.elementNumber}
                          </div>
                        </div>
                      ))}
                    </div>

                   
                    <div className="mt-4 space-y-2">
                      <div className="p-3 bg-white rounded-lg border">
                        <div className="text-xs font-medium text-gray-600 mb-1">
                          Analysis Summary
                        </div>
                        <div className="text-xs text-gray-700">
                          <div>
                            Total Changes:{" "}
                            {
                              latestComparison.filter((c) => c.change !== 0)
                                .length
                            }{" "}
                            of {latestComparison.length} parameters
                          </div>
                          <div>
                            Largest Change:{" "}
                            {Math.max(
                              ...latestComparison.map((c) => Math.abs(c.change))
                            )}{" "}
                            units
                          </div>
                          <div>
                            Time Difference:{" "}
                            {Math.abs(
                              new Date(tcpDataEntries[0].date).getTime() -
                                new Date(tcpDataEntries[1].date).getTime()
                            ) / 1000}{" "}
                            seconds
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-white rounded-lg border">
                        <div className="text-xs font-medium text-gray-600 mb-1">
                          Parameter Overview
                        </div>
                        <div className="flex gap-2">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-xs text-gray-700">
                              Data:{" "}
                              {
                                latestComparison.filter((c) =>
                                  c.parameterGroupName.includes("Data")
                                ).length
                              }
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <span className="text-xs text-gray-700">
                              Geometry:{" "}
                              {
                                latestComparison.filter((c) =>
                                  c.parameterGroupName.includes("Geometry")
                                ).length
                              }
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            <span className="text-xs text-gray-700">
                              Unchanged:{" "}
                              {
                                latestComparison.filter((c) => c.change === 0)
                                  .length
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 h-full flex flex-col">
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2 text-blue-800">
                      <Calendar className="w-4 h-4" />
                      Latest vs Previous Tool Values
                    </h4>
                    <div className="space-y-2 flex-1 overflow-y-auto">
                     
                      <div className="p-3 bg-white rounded border">
                        <div className="text-xs font-medium text-green-700 mb-2">
                          Latest (#{tcpDataEntries[0].index}) -{" "}
                          {formatDate(tcpDataEntries[0].date).time}
                        </div>
                        <div className="text-xs text-gray-700">
                          <div>
                            <span>
                              TOOL{" "}
                              {tcpDataEntries[0].parsedElement.actualToolNumber}{" "}
                              - {tcpDataEntries[0].parsedElement.parameterName}
                            </span>
                          </div>
                          <div className="mt-1 font-mono">
                            Value: {tcpDataEntries[0].elementValue}
                          </div>
                          <div className="text-xs text-gray-500">
                            Element: {tcpDataEntries[0].elementNumber}
                          </div>
                        </div>
                      </div>

                      
                      {tcpDataEntries.length > 1 && (
                        <div className="p-3 bg-white rounded border">
                          <div className="text-xs font-medium text-gray-600 mb-2">
                            Previous (#{tcpDataEntries[1].index}) -{" "}
                            {formatDate(tcpDataEntries[1].date).time}
                          </div>
                          <div className="text-xs text-gray-600">
                            <div>
                              <span>
                                TOOL{" "}
                                {
                                  tcpDataEntries[1].parsedElement
                                    .actualToolNumber
                                }{" "}
                                -{" "}
                                {tcpDataEntries[1].parsedElement.parameterName}
                              </span>
                            </div>
                            <div className="mt-1 font-mono">
                              Value: {tcpDataEntries[1].elementValue}
                            </div>
                            <div className="text-xs text-gray-500">
                              Element: {tcpDataEntries[1].elementNumber}
                            </div>
                          </div>
                        </div>
                      )}

                     
                      <div className="p-3 bg-white rounded border">
                        <div className="text-xs font-medium text-gray-600 mb-2">
                          Element Format (N-M-K):
                        </div>
                        <div className="text-xs text-gray-700 space-y-1">
                          <div>
                            <strong>N:</strong> Tool Number + 1
                          </div>
                          <div>
                            <strong>M:</strong> 1=Data, 2=Data(M=2), 9=Geometry
                          </div>
                          <div>
                            <strong>K:</strong> 0=X/Xg, 1=Y/Yg, 2=Z/Zg, 3=Rx/Ix,
                            4=Ry/Iy, 5=Rz/Iz
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              
              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Recent TCP Data Changes
                </h4>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {tcpDataEntries.slice(0, 10).map((entry) => {
                    const { date, time } = formatDate(entry.date);

                    return (
                      <div
                        key={entry.index}
                        className="p-3 rounded-lg border border-gray-200 hover:shadow-md transition-shadow bg-white"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                              #{entry.index}
                            </span>
                            <div>
                              <div className="text-sm font-medium">
                                TOOL {entry.parsedElement.actualToolNumber} -{" "}
                                {entry.parsedElement.parameterName}
                              </div>
                              <div className="text-xs text-gray-600">
                                Element: {entry.elementNumber} → Value:{" "}
                                {entry.elementValue}
                              </div>
                            </div>
                          </div>
                          <div className="text-right text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {date}
                            </div>
                            {time && (
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {time}
                              </div>
                            )}
                          </div>
                        </div>

                        <details className="mt-3">
                          <summary className="cursor-pointer text-xs text-blue-600 hover:text-blue-800 font-medium">
                            Show Raw Data
                          </summary>
                          <div className="mt-2 p-3 bg-gray-50 rounded border text-xs">
                            <pre className="whitespace-pre-wrap overflow-x-auto font-mono text-gray-700">
                              {entry.rawEntry}
                            </pre>
                          </div>
                        </details>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No TCP data found</p>
              <p className="text-sm mt-1">
                OTHER FILE EDIT events with File Name: TOOL will appear here
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TCPChangeLogs;
