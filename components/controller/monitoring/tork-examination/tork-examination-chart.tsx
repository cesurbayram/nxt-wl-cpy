"use client";

import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { TorkExaminationData } from "@/types/tork-examination.types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toggle } from "@/components/ui/toggle";
import { Eye, EyeOff, RefreshCw } from "lucide-react";
import { QueryMode } from "./tork-examination";

interface TorkExaminationChartProps {
  data: TorkExaminationData[];
  showSignals: boolean;
  queryMode: QueryMode;
  isRefreshing?: boolean;
}

const TorkExaminationChart: React.FC<TorkExaminationChartProps> = ({
  data,
  showSignals,
  queryMode,
  isRefreshing = false,
}) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [selectedLines, setSelectedLines] = useState<Record<string, boolean>>({
    S: true,
    L: true,
    U: true,
    R: true,
    B: true,
    T: true,
    B1: true,
    S1: true,
    S2: true,
  });

  useEffect(() => {
    if (!data || data.length === 0) return;

    const uniqueSignalIds = Array.from(
      new Set(data.filter((item) => item.signalId).map((item) => item.signalId))
    );

    const sortedData = [...data].sort((a, b) => {
      return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
    });

    const formattedData = sortedData.map((item) => {
      const time = new Date(item.timestamp);
      const formattedTime = format(time, "HH:mm:ss");

      const torkValues: Record<string, number | null> = {};
      const signalData: Record<string, any> = {};

      if (showSignals) {
        uniqueSignalIds.forEach((signalId) => {
          if (signalId) {
            if (item.signalId === signalId) {
              signalData[`signal_${signalId}`] = item.signalState ? 1 : 0;

              if (item.signalState) {
                torkValues.S = item.S ? Math.abs(item.S) : 0;
                torkValues.L = item.L ? Math.abs(item.L) : 0;
                torkValues.U = item.U ? Math.abs(item.U) : 0;
                torkValues.R = item.R ? Math.abs(item.R) : 0;
                torkValues.B = item.B ? Math.abs(item.B) : 0;
                torkValues.T = item.T ? Math.abs(item.T) : 0;
                torkValues.B1 = item.B1 ? Math.abs(item.B1) : 0;
                torkValues.S1 = item.S1 ? Math.abs(item.S1) : 0;
                torkValues.S2 = item.S2 ? Math.abs(item.S2) : 0;
              } else {
                torkValues.S = null;
                torkValues.L = null;
                torkValues.U = null;
                torkValues.R = null;
                torkValues.B = null;
                torkValues.T = null;
                torkValues.B1 = null;
                torkValues.S1 = null;
                torkValues.S2 = null;
              }
            }
          }
        });
      } else {
        torkValues.S = item.S ? Math.abs(item.S) : 0;
        torkValues.L = item.L ? Math.abs(item.L) : 0;
        torkValues.U = item.U ? Math.abs(item.U) : 0;
        torkValues.R = item.R ? Math.abs(item.R) : 0;
        torkValues.B = item.B ? Math.abs(item.B) : 0;
        torkValues.T = item.T ? Math.abs(item.T) : 0;
        torkValues.B1 = item.B1 ? Math.abs(item.B1) : 0;
        torkValues.S1 = item.S1 ? Math.abs(item.S1) : 0;
        torkValues.S2 = item.S2 ? Math.abs(item.S2) : 0;
      }

      return {
        timestamp: formattedTime,
        ...torkValues,
        ...signalData,
      };
    });

    setChartData(formattedData);
  }, [data, showSignals]);

  const toggleLine = (line: string) => {
    setSelectedLines((prev) => ({
      ...prev,
      [line]: !prev[line],
    }));
  };

  const getChartTitle = () => {
    switch (queryMode) {
      case QueryMode.DATE_ONLY:
        return "Tork Values by Time Range";
      case QueryMode.DATE_JOB:
        return `Tork Values for Job ${data[0]?.jobId || ""}`;
      case QueryMode.DATE_JOB_SIGNALS:
        return `Tork Values for Selected Signals`;
      default:
        return "Tork Examination Results";
    }
  };

  const lineColors = {
    S: "#0000FF",
    L: "#FF0000",
    U: "#008000",
    R: "#FFA500",
    B: "#800080",
    T: "#FF69B4",
    B1: "#00BFFF",
    S1: "#696969",
    S2: "#20B2AA",
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border rounded shadow">
          <p className="text-xs font-medium">{label}</p>
          <div className="space-y-1 mt-1">
            {payload.map((entry: any) => {
              if (entry.name.startsWith("signal_")) {
                const signalId = entry.name.split("_")[1];
                return (
                  <p key={entry.name} className="text-xs font-bold">
                    Signal {signalId}: {entry.value === 1 ? "ON" : "OFF"}
                  </p>
                );
              }

              return entry.value !== null ? (
                <p
                  key={entry.name}
                  className="text-xs"
                  style={{ color: entry.color }}
                >
                  {entry.name}: {entry.value}
                </p>
              ) : null;
            })}
          </div>
        </div>
      );
    }
    return null;
  };

  const uniqueSignalIds = Array.from(
    new Set(data.filter((item) => item.signalId).map((item) => item.signalId))
  );

  return (
    <Card className="w-full mt-4">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base">{getChartTitle()}</CardTitle>
          {isRefreshing && (
            <div className="flex items-center text-xs text-gray-500">
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              Updating chart data...
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 mt-2">
          {Object.entries(lineColors).map(([key, color]) => (
            <Toggle
              key={key}
              pressed={selectedLines[key]}
              onPressedChange={() => toggleLine(key)}
              variant="outline"
              size="sm"
              className="h-8 gap-1 text-xs"
            >
              {selectedLines[key] ? (
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: color }}
                ></div>
              ) : (
                <div
                  className="w-3 h-3 rounded-full border-2"
                  style={{ borderColor: color }}
                ></div>
              )}
              {key}
            </Toggle>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-2">
        <div style={{ width: "100%", height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" reversed={false} />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Brush dataKey="timestamp" height={20} stroke="#8884d8" />

              {Object.entries(lineColors).map(
                ([key, color]) =>
                  selectedLines[key] && (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={key}
                      stroke={color}
                      name={key}
                      dot={false}
                      isAnimationActive={false}
                      connectNulls={true}
                    />
                  )
              )}

              {showSignals &&
                uniqueSignalIds.map((signalId) => (
                  <Line
                    key={signalId}
                    type="step"
                    dataKey={`signal_${signalId}`}
                    stroke="#000"
                    strokeWidth={3}
                    name={`Signal ${signalId}`}
                    dot
                    connectNulls
                    strokeDasharray="5 5"
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default TorkExaminationChart;
