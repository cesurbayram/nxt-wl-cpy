"use client";

import { UtilizationData } from "@/types/utilization.types";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/card";
import { DataTable } from "@/components/shared/data-table";
import { ColumnDef } from "@tanstack/react-table";

interface UtilizationChartProps {
  data: UtilizationData[];
  viewType: string;
}

const UtilizationChart = ({ data, viewType }: UtilizationChartProps) => {
  const sortedData = [...data].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const tableColumns: ColumnDef<UtilizationData>[] = [
    {
      accessorKey: "timestamp",
      header: "Timestamp",
      cell: ({ row }) => new Date(row.getValue("timestamp")).toLocaleString(),
    },
    {
      accessorKey: "control_power_time",
      header: "Control Power Time",
    },
    {
      accessorKey: "servo_power_time",
      header: "Servo Power Time",
    },
    {
      accessorKey: "playback_time",
      header: "Playback Time",
    },
    {
      accessorKey: "moving_time",
      header: "Moving Time",
    },
  ];

  const totalColumns: ColumnDef<{ metric: string; value: number }>[] = [
    {
      accessorKey: "metric",
      header: "Metric",
    },
    {
      accessorKey: "value",
      header: "Total Time",
    },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg">
          <p className="text-sm font-medium mb-2">
            {new Date(label).toLocaleString()}
          </p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const legendStyle = {
    fontSize: "14px",
    fontWeight: 600,
    color: "#1a1a1a",
  };

  const renderLineChart = () => (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={sortedData}
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
            label={{ value: "Time", position: "bottom", offset: 10 }}
          />
          <YAxis
            label={{
              value: "Time Values",
              angle: -90,
              position: "insideLeft",
              offset: 0,
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" height={50} wrapperStyle={legendStyle} />
          <Line
            type="monotone"
            dataKey="control_power_time"
            name="Control Power Time"
            stroke="#16C47F"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="servo_power_time"
            name="Servo Power Time"
            stroke="#074799"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="playback_time"
            name="Playback Time"
            stroke="#FF9D23"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="moving_time"
            name="Moving Time"
            stroke="#e61502"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  const renderBarChart = () => (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sortedData}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(value) => new Date(value).toLocaleDateString()}
          />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend verticalAlign="top" height={50} wrapperStyle={legendStyle} />
          <Bar
            dataKey="control_power_time"
            name="Control Power Time"
            fill="#16C47F"
          />
          <Bar
            dataKey="servo_power_time"
            name="Servo Power Time"
            fill="#074799"
          />
          <Bar dataKey="playback_time" name="Playback Time" fill="#FF9D23" />
          <Bar dataKey="moving_time" name="Moving Time" fill="#e61502" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const renderTable = () => <DataTable columns={tableColumns} data={data} />;

  const renderTotal = () => {
    const latestData = [...data].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0];

    const totalData = [
      {
        metric: "Control Power Time",
        value: latestData?.control_power_time || 0,
      },
      { metric: "Servo Power Time", value: latestData?.servo_power_time || 0 },
      { metric: "Playback Time", value: latestData?.playback_time || 0 },
      { metric: "Moving Time", value: latestData?.moving_time || 0 },
    ];

    return <DataTable columns={totalColumns} data={totalData} />;
  };

  return (
    <Card className="p-4 overflow-hidden">
      <div className="w-full">
        {viewType === "line" && renderLineChart()}
        {viewType === "bar" && renderBarChart()}
        {viewType === "table" && renderTable()}
        {viewType === "total" && renderTotal()}
      </div>
    </Card>
  );
};

export default UtilizationChart;
