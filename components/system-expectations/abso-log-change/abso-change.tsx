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
} from "lucide-react";
import { getController } from "@/utils/service/controller";
import { Controller } from "@/types/controller.types";
import { getLogFileContent } from "@/utils/service/system-expectations/log-data";
import { LogEntry } from "@/types/log-content.types";
import {
  AbsoluteDataEntry,
  AxisComparison,
} from "@/types/abso-log-change.types";

const AbsoluteDataAnalysis: React.FC = () => {
  const [controllers, setControllers] = useState<Controller[]>([]);
  const [selectedController, setSelectedController] = useState<string>("");
  const [absoDataEntries, setAbsoDataEntries] = useState<AbsoluteDataEntry[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latestComparison, setLatestComparison] = useState<AxisComparison[]>(
    []
  );

  useEffect(() => {
    fetchControllers();
  }, []);

  useEffect(() => {
    if (selectedController) {
      analyzeAbsoluteData();
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

  const parseCurrentValue = (currValueText: string) => {
    const values: any = { R1: {} };

    console.log("Parsing CURR VALUE text:", currValueText);

    if (!currValueText || currValueText.trim() === "") {
      console.log("CURR VALUE field is empty");
      return values;
    }

    const lines = currValueText.split("\n");
    let inCurrValueSection = false;

    for (const line of lines) {
      const trimmed = line.trim();
      console.log("Processing line:", trimmed);

      if (trimmed === "CURR VALUE") {
        inCurrValueSection = true;
        console.log("Found CURR VALUE section");
        continue;
      }

      if (inCurrValueSection) {
        if (trimmed.includes("R1 :S")) {
          const match = trimmed.match(/R1\s*:S\s+(-?\d+)/);
          if (match) {
            values.R1.S = parseInt(match[1]);
            console.log("Found S:", values.R1.S);
          }
        } else if (trimmed.match(/^\s*L\s+(-?\d+)/)) {
          const match = trimmed.match(/L\s+(-?\d+)/);
          if (match) {
            values.R1.L = parseInt(match[1]);
            console.log("Found L:", values.R1.L);
          }
        } else if (trimmed.match(/^\s*U\s+(-?\d+)/)) {
          const match = trimmed.match(/U\s+(-?\d+)/);
          if (match) {
            values.R1.U = parseInt(match[1]);
            console.log("Found U:", values.R1.U);
          }
        } else if (
          trimmed.match(/^\s*R\s+(-?\d+)/) &&
          !trimmed.includes("R1")
        ) {
          const match = trimmed.match(/R\s+(-?\d+)/);
          if (match) {
            values.R1.R = parseInt(match[1]);
            console.log("Found R:", values.R1.R);
          }
        } else if (trimmed.match(/^\s*B\s+(-?\d+)/)) {
          const match = trimmed.match(/B\s+(-?\d+)/);
          if (match) {
            values.R1.B = parseInt(match[1]);
            console.log("Found B:", values.R1.B);
          }
        } else if (trimmed.match(/^\s*T\s+(-?\d+)/)) {
          const match = trimmed.match(/T\s+(-?\d+)/);
          if (match) {
            values.R1.T = parseInt(match[1]);
            console.log("Found T:", values.R1.T);
          }
        } else if (trimmed.startsWith("///INDEX")) {
          break;
        }
      }
    }

    console.log("Final parsed values:", values);
    return values;
  };

  const extractAbsoluteDataEvents = (
    logEntries: LogEntry[]
  ): AbsoluteDataEntry[] => {
    const events: AbsoluteDataEntry[] = [];

    logEntries.forEach((entry) => {
      const event = entry.event?.toLowerCase() || "";

      if (event.includes("org abso")) {
        const currValueText = entry.fields["CURR VALUE"] || entry.rawData || "";
        const parsedValues = parseCurrentValue(currValueText);

        events.push({
          index: entry.index,
          date: entry.date || "",
          groupNumber: entry.fields["GROUP NUMBER"] || "",
          axisNumber: entry.fields["AXIS NUMBER"] || "",
          setValue: entry.fields["SET VALUE"] || "",
          currValue: parsedValues,
          rawEntry: entry.rawData,
        });
      }
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

  const compareValues = (entries: AbsoluteDataEntry[]): AxisComparison[] => {
    if (entries.length < 2) return [];

    const latest = entries[0];
    const previous = entries[1];

    const comparisons: AxisComparison[] = [];
    const axes = ["S", "L", "U", "R", "B", "T"];

    axes.forEach((axis) => {
      const newVal =
        latest.currValue.R1[axis as keyof typeof latest.currValue.R1] || 0;
      const oldVal =
        previous.currValue.R1[axis as keyof typeof previous.currValue.R1] || 0;

      const change = newVal - oldVal;
      const changePercent =
        oldVal !== 0 ? (change / Math.abs(oldVal)) * 100 : 0;

      comparisons.push({
        axis,
        oldValue: oldVal,
        newValue: newVal,
        change,
        changePercent,
      });
    });

    return comparisons;
  };

  const analyzeAbsoluteData = async () => {
    if (!selectedController) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await getLogFileContent(selectedController);

      if (response.success && response.data) {
        const events = extractAbsoluteDataEvents(response.data);
        const comparison = compareValues(events);

        setAbsoDataEntries(events);
        setLatestComparison(comparison);
      } else {
        setError(response.error || "Failed to analyze absolute data");
        setAbsoDataEntries([]);
        setLatestComparison([]);
      }
    } catch (error) {
      console.error("Error analyzing absolute data:", error);
      setError("Failed to analyze absolute data");
      setAbsoDataEntries([]);
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
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Absolute Data Analysis
            </div>
            <Button
              onClick={analyzeAbsoluteData}
              disabled={isLoading || !selectedController}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
              size="sm"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Activity className="w-4 h-4 mr-2" />
              )}
              {isLoading ? "Analyzing..." : "Analyze Data"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Controller:
            </span>
            <Select
              value={selectedController}
              onValueChange={setSelectedController}
            >
              <SelectTrigger className="h-9">
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
        </CardContent>
      </Card>

      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              Analysis Results
              {absoDataEntries.length > 0 && (
                <span className="text-sm text-gray-500 font-normal">
                  ({absoDataEntries.length} records)
                </span>
              )}
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin mr-2 text-blue-600" />
              <span>Analyzing absolute data...</span>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="font-medium">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={analyzeAbsoluteData}
                className="mt-3"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : absoDataEntries.length > 0 ? (
            <div className="space-y-5">
              {latestComparison.length > 0 && absoDataEntries.length >= 2 && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2 text-green-800">
                      <TrendingUp className="w-4 h-4" />
                      Latest Changes
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {latestComparison.map((comp) => (
                        <div
                          key={comp.axis}
                          className="p-2 bg-white rounded border text-center"
                        >
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <span className="text-xs font-medium text-gray-700">
                              {comp.axis}
                            </span>
                            {getChangeIcon(comp.change)}
                          </div>
                          <div
                            className={`text-xs font-medium ${getChangeColor(
                              comp.change
                            )}`}
                          >
                            {comp.change > 0 ? "+" : ""}
                            {comp.change}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-3 p-3 bg-white rounded border">
                      <div className="text-xs font-medium text-gray-600 mb-2">
                        Changed Axes:
                      </div>
                      <div className="space-y-1">
                        {latestComparison
                          .filter((comp) => comp.change !== 0)
                          .map((comp) => (
                            <div
                              key={comp.axis}
                              className="flex justify-between text-xs"
                            >
                              <span className="font-medium">{comp.axis}:</span>
                              <span className={getChangeColor(comp.change)}>
                                {comp.oldValue} → {comp.newValue}
                              </span>
                            </div>
                          ))}
                        {latestComparison.filter((comp) => comp.change !== 0)
                          .length === 0 && (
                          <div className="text-xs text-gray-500">
                            No changes detected
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2 text-blue-800">
                      <Calendar className="w-4 h-4" />
                      Current vs Previous Values
                    </h4>
                    <div className="space-y-2">
                      <div className="p-3 bg-white rounded border">
                        <div className="text-xs font-medium text-green-700 mb-2">
                          Latest (#{absoDataEntries[0].index})
                        </div>
                        <div className="font-mono text-sm text-gray-700">
                          <div>
                            R1 :S {absoDataEntries[0].currValue.R1.S || 0}
                          </div>
                          <div className="ml-4">
                            L {absoDataEntries[0].currValue.R1.L || 0}
                          </div>
                          <div className="ml-4">
                            U {absoDataEntries[0].currValue.R1.U || 0}
                          </div>
                          <div className="ml-4">
                            R {absoDataEntries[0].currValue.R1.R || 0}
                          </div>
                          <div className="ml-4">
                            B {absoDataEntries[0].currValue.R1.B || 0}
                          </div>
                          <div className="ml-4">
                            T {absoDataEntries[0].currValue.R1.T || 0}
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-white rounded border">
                        <div className="text-xs font-medium text-gray-600 mb-2">
                          Previous (#{absoDataEntries[1].index})
                        </div>
                        <div className="font-mono text-sm text-gray-600">
                          <div>
                            R1 :S {absoDataEntries[1].currValue.R1.S || 0}
                          </div>
                          <div className="ml-4">
                            L {absoDataEntries[1].currValue.R1.L || 0}
                          </div>
                          <div className="ml-4">
                            U {absoDataEntries[1].currValue.R1.U || 0}
                          </div>
                          <div className="ml-4">
                            R {absoDataEntries[1].currValue.R1.R || 0}
                          </div>
                          <div className="ml-4">
                            B {absoDataEntries[1].currValue.R1.B || 0}
                          </div>
                          <div className="ml-4">
                            T {absoDataEntries[1].currValue.R1.T || 0}
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
                  Recent Absolute Data Records
                </h4>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {absoDataEntries.slice(0, 10).map((entry) => {
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
                                ORG ABSO
                              </div>
                              <div className="text-xs text-gray-600">
                                Group: {entry.groupNumber}, Axis:{" "}
                                {entry.axisNumber}
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

                        <div className="mb-3">
                          <div className="text-xs font-medium text-gray-600 mb-2">
                            Current Values:
                          </div>
                          <div className="font-mono text-sm bg-gray-50 p-2 rounded">
                            {Object.keys(entry.currValue.R1).length > 0 ? (
                              <div>
                                {Object.entries(entry.currValue.R1).map(
                                  ([axis, value]) => (
                                    <div key={axis}>
                                      {axis === "S"
                                        ? `R1 :${axis}      ${value}`
                                        : `        ${axis}      ${value}`}
                                    </div>
                                  )
                                )}
                              </div>
                            ) : (
                              <div className="text-gray-500">
                                No parsed values - check raw data below
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
              <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No absolute data found</p>
              <p className="text-sm mt-1">
                ORG ABSO events will appear here after analysis
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AbsoluteDataAnalysis;
