"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { TorkData } from "@/types/tork.types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FaFilePdf } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";

interface TorkChartProps {
  data: TorkData[];
  isLive?: boolean;
  controllerId?: string;
  onRefresh?: () => void;
}

interface ThresholdValues {
  S: number;
  L: number;
  U: number;
  R: number;
  B: number;
  T: number;
}

interface AxisVisibility {
  S: boolean;
  L: boolean;
  U: boolean;
  R: boolean;
  B: boolean;
  T: boolean;
}

type TimeRange = "30" | "60" | "90" | "all";

const TorkChart = ({
  data,
  isLive = false,
  controllerId,
  onRefresh,
}: TorkChartProps) => {
  const [chartData, setChartData] = useState<TorkData[]>([]);
  const [recordCount, setRecordCount] = useState<number>(0);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>("all");

  const [thresholds, setThresholds] = useState<ThresholdValues>({
    S: 0,
    L: 0,
    U: 0,
    R: 0,
    B: 0,
    T: 0,
  });

  const [axisVisibility, setAxisVisibility] = useState<AxisVisibility>({
    S: true,
    L: true,
    U: true,
    R: true,
    B: true,
    T: true,
  });

  const [isEditingThresholds, setIsEditingThresholds] =
    useState<boolean>(false);

  const [tempThresholds, setTempThresholds] = useState<ThresholdValues>({
    ...thresholds,
  });

  const [inputValues, setInputValues] = useState<
    Record<keyof ThresholdValues, string>
  >({
    S: "0",
    L: "0",
    U: "0",
    R: "0",
    B: "0",
    T: "0",
  });

  useEffect(() => {
    if (typeof window !== "undefined" && controllerId) {
      const savedThresholds = localStorage.getItem(
        `torkThresholds_${controllerId}`
      );
      if (savedThresholds) {
        try {
          const parsedThresholds = JSON.parse(savedThresholds);
          setThresholds(parsedThresholds);
          setTempThresholds(parsedThresholds);
        } catch (error) {
          console.error("Eşik değerleri yüklenirken hata oluştu:", error);
        }
      }

      const savedVisibility = localStorage.getItem(
        `torkAxisVisibility_${controllerId}`
      );
      if (savedVisibility) {
        try {
          const parsedVisibility = JSON.parse(savedVisibility);
          setAxisVisibility(parsedVisibility);
        } catch (error) {
          console.error("Eksen görünürlüğü yüklenirken hata oluştu:", error);
        }
      }
    }
  }, [controllerId]);

  useEffect(() => {
    if (data) {
      const numericData = data.map((item) => ({
        ...item,
        S: typeof item.S === "string" ? parseFloat(item.S) : item.S,
        L: typeof item.L === "string" ? parseFloat(item.L) : item.L,
        U: typeof item.U === "string" ? parseFloat(item.U) : item.U,
        R: typeof item.R === "string" ? parseFloat(item.R) : item.R,
        B: typeof item.B === "string" ? parseFloat(item.B) : item.B,
        T: typeof item.T === "string" ? parseFloat(item.T) : item.T,
      }));

      const sortedData = [...numericData].sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );

      const filteredData = filterDataByTimeRange(sortedData, selectedTimeRange);

      setChartData(filteredData);
      setRecordCount(filteredData.length);
    }
  }, [data, selectedTimeRange]);

  const filterDataByTimeRange = (
    data: TorkData[],
    range: TimeRange
  ): TorkData[] => {
    if (range === "all" || data.length === 0) {
      return data;
    }

    const now = new Date();
    const daysAgo = parseInt(range);
    const cutoffDate = new Date(now.setDate(now.getDate() - daysAgo));

    return data.filter((item) => new Date(item.timestamp) >= cutoffDate);
  };

  const toggleAxisVisibility = (axis: keyof AxisVisibility) => {
    const newVisibility = {
      ...axisVisibility,
      [axis]: !axisVisibility[axis],
    };

    setAxisVisibility(newVisibility);

    if (typeof window !== "undefined" && controllerId) {
      localStorage.setItem(
        `torkAxisVisibility_${controllerId}`,
        JSON.stringify(newVisibility)
      );
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg">
          <p className="text-sm font-medium text-muted-foreground mb-2">
            {new Date(label).toLocaleString()}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.name}: ${
                typeof entry.value === "number"
                  ? Number.isInteger(entry.value)
                    ? entry.value
                    : entry.value.toFixed(2)
                  : entry.value
              }`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const handleEditThresholds = () => {
    setTempThresholds({ ...thresholds });

    const newInputValues: Record<keyof ThresholdValues, string> = {} as Record<
      keyof ThresholdValues,
      string
    >;
    Object.keys(thresholds).forEach((axis) => {
      newInputValues[axis as keyof ThresholdValues] =
        thresholds[axis as keyof ThresholdValues].toString();
    });
    setInputValues(newInputValues);
    setIsEditingThresholds(true);
  };

  const handleSaveThresholds = () => {
    const newThresholds = { ...tempThresholds };
    Object.keys(inputValues).forEach((axis) => {
      const value = inputValues[axis as keyof ThresholdValues];
      newThresholds[axis as keyof ThresholdValues] =
        value === "" ? 0 : parseFloat(value);
    });

    setThresholds(newThresholds);

    if (typeof window !== "undefined" && controllerId) {
      localStorage.setItem(
        `torkThresholds_${controllerId}`,
        JSON.stringify(newThresholds)
      );
    }
    setIsEditingThresholds(false);
  };

  const handleCancelEditThresholds = () => {
    setIsEditingThresholds(false);
  };

  const handleThresholdChange = (
    axis: keyof ThresholdValues,
    value: string
  ) => {
    setInputValues({
      ...inputValues,
      [axis]: value,
    });

    if (value !== "") {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        setTempThresholds({
          ...tempThresholds,
          [axis]: numValue,
        });
      }
    } else {
      setTempThresholds({
        ...tempThresholds,
        [axis]: 0,
      });
    }
  };

  const renderTorkTable = () => {
    const lastData =
      chartData.length > 0 ? chartData[chartData.length - 1] : null;

    if (!lastData) return <div className="text-foreground">Data Not Found</div>;

    const maxValues: Record<string, number> = {};
    Object.keys(thresholds).forEach((axis) => {
      const axisValues = chartData
        .map((item) => Math.abs(item[axis as keyof TorkData] as number))
        .filter((val) => typeof val === "number" && !isNaN(val));

      maxValues[axis] = axisValues.length > 0 ? Math.max(...axisValues) : 0;
    });

    return (
      <div className="mb-4 overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-blue-100 dark:bg-blue-950">
              <th className="border p-2 text-left text-foreground">Axis</th>
              <th className="border p-2 text-left text-foreground">
                Max Value [Nm]
              </th>
              <th className="border p-2 text-left text-foreground">
                Estimated External Torque [Nm]
              </th>
              <th className="border p-2 text-left text-foreground">
                Error Threshold of External Torque [Nm]
              </th>
              <th className="border p-2 text-left text-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(thresholds).map((axis) => {
              const axisValue = lastData[axis as keyof TorkData];

              const isExceeded =
                typeof axisValue === "number" &&
                Math.abs(axisValue) > thresholds[axis as keyof ThresholdValues];

              const status = isExceeded
                ? "Calibration operation is required"
                : "Normal";

              return (
                <tr
                  key={axis}
                  className={isExceeded ? "bg-red-100 dark:bg-red-950" : ""}
                >
                  <td className="border p-2 text-foreground">{axis}-Axis</td>
                  <td className="border p-2 text-foreground">
                    {Number.isInteger(maxValues[axis])
                      ? maxValues[axis].toString()
                      : maxValues[axis].toFixed(1)}
                  </td>
                  <td className="border p-2 text-foreground">
                    {typeof axisValue === "number"
                      ? Number.isInteger(axisValue)
                        ? axisValue.toString()
                        : axisValue.toFixed(1)
                      : "0"}
                  </td>

                  <td className="border p-2 text-foreground">
                    {Number.isInteger(thresholds[axis as keyof ThresholdValues])
                      ? thresholds[axis as keyof ThresholdValues].toString()
                      : thresholds[axis as keyof ThresholdValues].toFixed(1)}
                  </td>
                  <td className="border p-2 text-foreground">
                    {isExceeded ? (
                      <div className="flex items-center">
                        <span className="text-red-500 mr-2">⚠️</span>
                        {status}
                      </div>
                    ) : (
                      status
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderAxisVisibilityControls = () => (
    <div className="mb-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
      <h4 className="font-medium mb-2 text-foreground">Axis Visibility</h4>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {Object.keys(axisVisibility).map((axis) => (
          <div key={axis} className="flex items-center space-x-2">
            <Checkbox
              id={`visibility-${axis}`}
              checked={axisVisibility[axis as keyof AxisVisibility]}
              onCheckedChange={() =>
                toggleAxisVisibility(axis as keyof AxisVisibility)
              }
            />
            <Label
              htmlFor={`visibility-${axis}`}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              style={{
                color:
                  axis === "S"
                    ? "#8884d8"
                    : axis === "L"
                    ? "#82ca9d"
                    : axis === "U"
                    ? "#ffc658"
                    : axis === "R"
                    ? "#ff8042"
                    : axis === "B"
                    ? "#0088fe"
                    : "#00C49F",
              }}
            >
              {axis}-Axis
            </Label>
          </div>
        ))}
      </div>
    </div>
  );

  const renderTimeRangeSelector = () => (
    <div className="mb-4 flex items-center space-x-2 border rounded-md p-2 bg-gray-50 dark:bg-gray-800">
      <span className="text-sm font-medium text-foreground">
        Time Interval:
      </span>
      <div className="flex space-x-1">
        <Button
          variant={selectedTimeRange === "30" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedTimeRange("30")}
        >
          30 day
        </Button>
        <Button
          variant={selectedTimeRange === "60" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedTimeRange("60")}
        >
          60 day
        </Button>
        <Button
          variant={selectedTimeRange === "90" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedTimeRange("90")}
        >
          90 day
        </Button>
        <Button
          variant={selectedTimeRange === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setSelectedTimeRange("all")}
        >
          All
        </Button>
      </div>
    </div>
  );

  const renderTorkChart = () => (
    <div className="h-[400px] w-full">
      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-full border rounded-md p-4 bg-gray-50 dark:bg-gray-800">
          <p className="text-lg text-gray-500 dark:text-gray-400">
            No data found to display. Make sure there is torque data in the
            database.
          </p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getDate()}/${
                  date.getMonth() + 1
                } ${date.getHours()}:${date.getMinutes()}`;
              }}
              label={{ value: "Date&Time", position: "bottom", offset: 10 }}
              stroke="currentColor"
            />
            <YAxis
              label={{
                value: "External Torque [Nm]",
                angle: -90,
                position: "insideLeft",
                offset: 0,
              }}
              stroke="currentColor"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend verticalAlign="top" height={50} />

            {Object.entries(thresholds).map(
              ([axis, value]) =>
                value > 0 &&
                axisVisibility[axis as keyof AxisVisibility] && (
                  <ReferenceLine
                    key={`threshold-${axis}`}
                    y={value}
                    stroke={
                      axis === "S"
                        ? "#8884d8"
                        : axis === "L"
                        ? "#82ca9d"
                        : axis === "U"
                        ? "#ffc658"
                        : axis === "R"
                        ? "#ff8042"
                        : axis === "B"
                        ? "#0088fe"
                        : "#00C49F"
                    }
                    strokeDasharray="3 3"
                    label={`${axis} Threshold`}
                  />
                )
            )}

            {axisVisibility.S && (
              <Line
                type="monotone"
                dataKey="S"
                stroke="#8884d8"
                name="S-Axis"
                strokeWidth={2}
                dot={false}
              />
            )}
            {axisVisibility.L && (
              <Line
                type="monotone"
                dataKey="L"
                stroke="#82ca9d"
                name="L-Axis"
                strokeWidth={2}
                dot={false}
              />
            )}
            {axisVisibility.U && (
              <Line
                type="monotone"
                dataKey="U"
                stroke="#ffc658"
                name="U-Axis"
                strokeWidth={2}
                dot={false}
              />
            )}
            {axisVisibility.R && (
              <Line
                type="monotone"
                dataKey="R"
                stroke="#ff8042"
                name="R-Axis"
                strokeWidth={2}
                dot={false}
              />
            )}
            {axisVisibility.B && (
              <Line
                type="monotone"
                dataKey="B"
                stroke="#0088fe"
                name="B-Axis"
                strokeWidth={2}
                dot={false}
              />
            )}
            {axisVisibility.T && (
              <Line
                type="monotone"
                dataKey="T"
                stroke="#00C49F"
                name="T-Axis"
                strokeWidth={2}
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );

  const generatePDF = () => {
    if (chartData.length === 0) {
      alert("No data available to generate PDF");
      return;
    }

    const getControllerName = async () => {
      try {
        if (!controllerId) {
          createPDF("Unknown Controller");
          return;
        }

        const response = await fetch(`/api/controller/${controllerId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          createPDF("Unknown Controller");
          return;
        }

        const controller = await response.json();
        createPDF(controller.name || "Unknown Controller");
      } catch (error) {
        console.error("Error fetching controller name:", error);
        createPDF("Unknown Controller");
      }
    };

    const createPDF = (controllerName: string) => {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      doc.setFontSize(18);
      doc.text("Torque Sensor Status Report", pageWidth / 2, 15, {
        align: "center",
      });

      doc.setFontSize(12);
      doc.text(`Controller: ${controllerName}`, pageWidth / 2, 25, {
        align: "center",
      });

      const currentDate = new Date().toLocaleString();
      doc.setFontSize(10);
      doc.text(`Generated on: ${currentDate}`, pageWidth / 2, 35, {
        align: "center",
      });

      doc.setFontSize(12);
      doc.text("Axis Visibility:", 14, 45);

      const visibilityText = Object.entries(axisVisibility)
        .map(
          ([axis, isVisible]) =>
            `${axis}-Axis: ${isVisible ? "Visible" : "Hidden"}`
        )
        .join(", ");

      doc.setFontSize(10);
      doc.text(visibilityText, 14, 52);

      doc.setFontSize(12);
      doc.text(
        `Time Range: ${
          selectedTimeRange === "all"
            ? "All Data"
            : `Last ${selectedTimeRange} days`
        }`,
        14,
        60
      );

      doc.text(`Total Records: ${recordCount}`, 14, 68);

      const lastData =
        chartData.length > 0 ? chartData[chartData.length - 1] : null;

      if (lastData) {
        const maxValues: Record<string, number> = {};
        Object.keys(thresholds).forEach((axis) => {
          const axisValues = chartData
            .map((item) => Math.abs(item[axis as keyof TorkData] as number))
            .filter((val) => typeof val === "number" && !isNaN(val));

          maxValues[axis] = axisValues.length > 0 ? Math.max(...axisValues) : 0;
        });

        const exceededAxes: string[] = [];

        const tableData = Object.keys(thresholds).map((axis) => {
          const axisValue = lastData[axis as keyof TorkData];
          const isExceeded =
            typeof axisValue === "number" &&
            Math.abs(axisValue) > thresholds[axis as keyof ThresholdValues];

          if (isExceeded) {
            exceededAxes.push(`${axis}-Axis`);
          }

          const status = isExceeded
            ? "Calibration operation is required"
            : "Normal";

          return [
            `${axis}-Axis`,
            Number.isInteger(maxValues[axis])
              ? maxValues[axis].toString()
              : maxValues[axis].toFixed(1),
            typeof axisValue === "number"
              ? Number.isInteger(axisValue)
                ? axisValue.toString()
                : axisValue.toFixed(1)
              : "0",
            Number.isInteger(thresholds[axis as keyof ThresholdValues])
              ? thresholds[axis as keyof ThresholdValues].toString()
              : thresholds[axis as keyof ThresholdValues].toFixed(1),
            status,
            isExceeded ? "⚠️" : "",
          ];
        });

        doc.setFontSize(14);
        doc.text("General Torque Status Overview", pageWidth / 2, 75, {
          align: "center",
        });

        autoTable(doc, {
          head: [
            [
              "Axis",
              "Max Value [Nm]",
              "Estimated External Torque [Nm]",
              "Error Threshold [Nm]",
              "Status",
              "",
            ],
          ],
          body: tableData,
          startY: 80,
          theme: "grid",
          styles: { fontSize: 10, cellPadding: 3 },
          headStyles: { fillColor: [66, 139, 202], textColor: 255 },
          columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 30 },
            2: { cellWidth: 45 },
            3: { cellWidth: 40 },
            4: { cellWidth: 40 },
            5: { cellWidth: 10 },
          },
          didDrawCell: (data) => {
            if (
              data.column.index === 5 &&
              data.cell.section === "body" &&
              data.cell.raw === "⚠️"
            ) {
              const textPos = data.cell.getTextPos();
              doc.setTextColor(255, 0, 0);
              doc.text("⚠️", textPos.x, textPos.y + 3);
              doc.setTextColor(0, 0, 0);
            }
          },
        });

        let finalY = (doc as any).lastAutoTable.finalY || 150;

        const chartContainer = document.querySelector(".recharts-wrapper");
        if (chartContainer) {
          try {
            html2canvas(chartContainer as HTMLElement, {
              backgroundColor: "#ffffff",
              logging: false,
              scale: 2,
            })
              .then((canvas) => {
                const imgData = canvas.toDataURL("image/png");

                doc.setFontSize(14);
                doc.text("Torque Values Chart", pageWidth / 2, finalY + 20, {
                  align: "center",
                });

                const margin = 20;
                const availableWidth = pageWidth - 2 * margin;
                const availableHeight = 180;

                const scale = Math.min(
                  availableWidth / canvas.width,
                  availableHeight / canvas.height
                );

                const scaledWidth = canvas.width * scale;
                const scaledHeight = canvas.height * scale;

                const xPos = (pageWidth - scaledWidth) / 2;

                doc.addImage(
                  imgData,
                  "PNG",
                  xPos,
                  finalY + 30,
                  scaledWidth,
                  scaledHeight
                );

                finalY += 30 + scaledHeight + 20;

                addIndividualAxisTables(
                  doc,
                  finalY,
                  exceededAxes,
                  controllerName
                );
              })
              .catch((error) => {
                console.error("Error capturing chart with html2canvas:", error);
                finalY += 20;
                addIndividualAxisTables(
                  doc,
                  finalY,
                  exceededAxes,
                  controllerName
                );
              });
          } catch (error) {
            console.error("Error generating chart image:", error);
            finalY += 20;
            addIndividualAxisTables(doc, finalY, exceededAxes, controllerName);
          }
        } else {
          finalY += 20;
          addIndividualAxisTables(doc, finalY, exceededAxes, controllerName);
        }
      }
    };

    const addIndividualAxisTables = (
      doc: jsPDF,
      startY: number,
      exceededAxes: string[],
      controllerName: string
    ) => {
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      if (startY > pageHeight - 100) {
        doc.addPage();
        startY = 20;
      }

      doc.setFontSize(14);
      doc.text("Individual Axis Data", pageWidth / 2, startY, {
        align: "center",
      });

      let currentY = startY + 10;

      Object.keys(thresholds).forEach((axis, index) => {
        if (currentY > pageHeight - 100) {
          doc.addPage();
          currentY = 20;
        }

        const exceededRecords = chartData.filter((item) => {
          const value = item[axis as keyof TorkData] as number;
          return (
            typeof value === "number" &&
            Math.abs(value) > thresholds[axis as keyof ThresholdValues]
          );
        });

        const hasExceededValues = exceededRecords.length > 0;

        doc.setFontSize(12);
        if (hasExceededValues) {
          doc.setTextColor(255, 0, 0);
          doc.text(`${axis}-Axis Data (THRESHOLD EXCEEDED)`, 14, currentY);
          doc.setTextColor(0, 0, 0);
        } else {
          doc.text(`${axis}-Axis Data`, 14, currentY);
        }

        const lastValue =
          chartData.length > 0
            ? (chartData[chartData.length - 1][
                axis as keyof TorkData
              ] as number)
            : 0;

        const axisValues = chartData
          .map((item) => Math.abs(item[axis as keyof TorkData] as number))
          .filter((val) => typeof val === "number" && !isNaN(val));

        const maxValue = axisValues.length > 0 ? Math.max(...axisValues) : 0;

        doc.setFontSize(10);
        doc.text(
          `Threshold: ${
            thresholds[axis as keyof ThresholdValues]
          } Nm | Current Value: ${lastValue} Nm | Max Value: ${maxValue.toFixed(
            1
          )} Nm`,
          14,
          currentY + 8
        );

        currentY += 15;

        if (hasExceededValues) {
          doc.setFontSize(10);
          doc.text("Records exceeding threshold:", 14, currentY);
          currentY += 8;

          const tableData = exceededRecords
            .slice(-10)
            .map((record) => [
              new Date(record.timestamp).toLocaleString(),
              typeof record[axis as keyof TorkData] === "number"
                ? Number.isInteger(record[axis as keyof TorkData])
                  ? record[axis as keyof TorkData]
                  : (record[axis as keyof TorkData] as number).toFixed(1)
                : "0",
            ]);

          autoTable(doc, {
            head: [["Timestamp", "Value [Nm]"]],
            body: tableData,
            startY: currentY,
            theme: "grid",
            styles: { fontSize: 9, cellPadding: 2 },
            headStyles: { fillColor: [255, 0, 0], textColor: 255 },
            margin: { left: 14 },
            tableWidth: 180,
          });

          currentY = (doc as any).lastAutoTable.finalY + 15;
        } else {
          doc.setFontSize(10);
          doc.text("No records exceed threshold for this axis.", 14, currentY);
          currentY += 10;
        }

        try {
          const canvas = document.createElement("canvas");
          canvas.width = 600;
          canvas.height = 300;
          const ctx = canvas.getContext("2d");

          if (ctx) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 1;

            ctx.beginPath();
            ctx.moveTo(50, 250);
            ctx.lineTo(550, 250);
            ctx.moveTo(50, 250);
            ctx.lineTo(50, 50);
            ctx.stroke();

            ctx.fillStyle = "#000000";
            ctx.font = "12px Arial";
            ctx.fillText("Time", 300, 280);
            ctx.save();
            ctx.translate(20, 150);
            ctx.rotate(-Math.PI / 2);
            ctx.fillText("Torque [Nm]", 0, 0);
            ctx.restore();

            const dataPoints = chartData;
            const values = dataPoints.map(
              (item) => item[axis as keyof TorkData] as number
            );
            const maxVal = Math.max(
              ...values.map((v) => Math.abs(v)),
              thresholds[axis as keyof ThresholdValues] * 1.2
            );

            const thresholdY =
              250 - (thresholds[axis as keyof ThresholdValues] / maxVal) * 200;
            ctx.strokeStyle = "#ff0000";
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(50, thresholdY);
            ctx.lineTo(550, thresholdY);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillText(
              `Threshold: ${thresholds[axis as keyof ThresholdValues]} Nm`,
              60,
              thresholdY - 5
            );

            ctx.strokeStyle =
              axis === "S"
                ? "#8884d8"
                : axis === "L"
                ? "#82ca9d"
                : axis === "U"
                ? "#ffc658"
                : axis === "R"
                ? "#ff8042"
                : axis === "B"
                ? "#0088fe"
                : "#00C49F";
            ctx.lineWidth = 2;
            ctx.beginPath();

            dataPoints.forEach((point, i) => {
              const x = 50 + (i / (dataPoints.length - 1)) * 500;
              const value = point[axis as keyof TorkData] as number;
              const y = 250 - (Math.abs(value) / maxVal) * 200;

              if (i === 0) {
                ctx.moveTo(x, y);
              } else {
                ctx.lineTo(x, y);
              }

              if (
                typeof value === "number" &&
                Math.abs(value) > thresholds[axis as keyof ThresholdValues]
              ) {
                ctx.fillStyle = "#ff0000";
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.fill();
              }
            });

            ctx.stroke();

            const imgData = canvas.toDataURL("image/png");

            if (currentY + 150 > pageHeight) {
              doc.addPage();
              currentY = 20;
            }

            doc.setFontSize(10);
            doc.text(
              `${axis}-Axis Torque Chart (All Records - ${chartData.length})`,
              pageWidth / 2,
              currentY,
              {
                align: "center",
              }
            );

            doc.addImage(imgData, "PNG", 14, currentY + 5, 180, 90);

            currentY += 100;
          }
        } catch (error) {
          console.error(`Error creating chart for ${axis}-Axis:`, error);
          doc.setFontSize(10);
          doc.text(`Could not generate chart for ${axis}-Axis.`, 14, currentY);
          currentY += 10;
        }

        currentY += 20;
      });

      if (currentY > pageHeight - 60) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFontSize(12);
      doc.text("Summary of Threshold Violations", pageWidth / 2, currentY, {
        align: "center",
      });

      currentY += 10;

      const updatedExceededAxes: string[] = [];
      const exceededDetails: {
        axis: string;
        maxValue: number;
        threshold: number;
        dates: string[];
      }[] = [];

      Object.keys(thresholds).forEach((axis) => {
        const exceededRecords = chartData.filter((item) => {
          const value = item[axis as keyof TorkData] as number;
          return (
            typeof value === "number" &&
            Math.abs(value) > thresholds[axis as keyof ThresholdValues]
          );
        });

        if (exceededRecords.length > 0) {
          updatedExceededAxes.push(`${axis}-Axis`);

          const axisValues = chartData
            .map((item) => Math.abs(item[axis as keyof TorkData] as number))
            .filter((val) => typeof val === "number" && !isNaN(val));

          const maxValue = axisValues.length > 0 ? Math.max(...axisValues) : 0;

          const dates = exceededRecords
            .slice(-5)
            .map((record) => new Date(record.timestamp).toLocaleString());

          exceededDetails.push({
            axis: `${axis}-Axis`,
            maxValue,
            threshold: thresholds[axis as keyof ThresholdValues],
            dates,
          });
        }
      });

      if (updatedExceededAxes.length > 0) {
        doc.setTextColor(255, 0, 0);
        doc.setFontSize(11);
        doc.text("The following axes exceed threshold values:", 14, currentY);

        currentY += 8;

        exceededDetails.forEach((detail, index) => {
          doc.text(
            `${index + 1}. ${
              detail.axis
            }: Maximum value ${detail.maxValue.toFixed(
              1
            )} Nm exceeds threshold of ${detail.threshold} Nm`,
            24,
            currentY
          );

          currentY += 6;

          doc.setFontSize(9);
          doc.text("    Exceeded on dates:", 24, currentY);
          currentY += 5;

          detail.dates.forEach((date) => {
            doc.text(`      • ${date}`, 24, currentY);
            currentY += 5;
          });

          doc.setFontSize(11);
          currentY += 3;
        });

        currentY += 4;
        doc.text(
          "Recommendation: Calibration operation is required for the above axes.",
          14,
          currentY
        );

        doc.setTextColor(0, 0, 0);
      } else {
        doc.setFontSize(11);
        doc.text(
          "All axes are within normal operating parameters.",
          14,
          currentY
        );
      }

      doc.save(
        `Torque_Report_${controllerName}_${
          new Date().toISOString().split("T")[0]
        }.pdf`
      );
    };

    const finalizePDFWithoutChart = (
      doc: jsPDF,
      finalY: number,
      exceededAxes: string[],
      controllerName: string
    ) => {
      finalY += 20;

      addIndividualAxisTables(doc, finalY, exceededAxes, controllerName);
    };

    getControllerName();
  };

  return (
    <Card className="p-4 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Torque Sensor Status Monitor</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={generatePDF}
              className="flex items-center gap-1"
            >
              <FaFilePdf className="mr-1" /> Export PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditThresholds}
              disabled={isEditingThresholds}
            >
              Edit Threshold Values
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isEditingThresholds && (
          <div className="mb-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
            <h4 className="font-medium mb-2 text-foreground">
              Edit Axis Threshold Values
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              {Object.keys(tempThresholds).map((axis) => (
                <div key={axis} className="flex flex-col">
                  <Label
                    htmlFor={`threshold-${axis}`}
                    className="text-foreground"
                  >
                    {axis}- Axis Threshold Value
                  </Label>
                  <Input
                    id={`threshold-${axis}`}
                    type="number"
                    value={inputValues[axis as keyof ThresholdValues]}
                    onChange={(e) =>
                      handleThresholdChange(
                        axis as keyof ThresholdValues,
                        e.target.value
                      )
                    }
                    className="mt-1"
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancelEditThresholds}>
                Cancel
              </Button>
              <Button onClick={handleSaveThresholds}>Save</Button>
            </div>
          </div>
        )}

        {renderAxisVisibilityControls()}

        {renderTimeRangeSelector()}

        {renderTorkTable()}

        {renderTorkChart()}
      </CardContent>
    </Card>
  );
};

export default TorkChart;
