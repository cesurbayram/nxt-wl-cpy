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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface UtilizationChartProps {
  data: UtilizationData[];
  viewType: string;
}

const UtilizationChart = ({ data, viewType }: UtilizationChartProps) => {
  const renderLineChart = () => (
    <div className="h-[500px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(value) => {
              const date = new Date(value);
              return `${date.getDate()}/${
                date.getMonth() + 1
              } ${date.getHours()}:${date.getMinutes()}`;
            }}
            label={{ value: "Time", position: "bottom" }}
          />
          <YAxis
            label={{ value: "Time Values", angle: -90, position: "insideLeft" }}
          />
          <Tooltip
            labelFormatter={(value) => new Date(value).toLocaleString()}
            formatter={(value) => [`${value}`, ""]}
          />
          <Legend verticalAlign="top" height={36} />
          <Line
            type="monotone"
            dataKey="control_power_time"
            name="Control Power Time"
            stroke="#FF6B6B"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="servo_power_time"
            name="Servo Power Time"
            stroke="#4ECDC4"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="playback_time"
            name="Playback Time"
            stroke="#45B7D1"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="moving_time"
            name="Moving Time"
            stroke="#96CEB4"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="operating_time"
            name="Operating Time"
            stroke="#D4A5A5"
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );

  const renderBarChart = () => (
    <div className="h-[500px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={(value) => new Date(value).toLocaleDateString()}
          />
          <YAxis />
          <Tooltip
            labelFormatter={(value) => new Date(value).toLocaleString()}
          />
          <Legend />
          <Bar
            dataKey="control_power_time"
            name="Control Power Time"
            fill="#FF6B6B"
          />
          <Bar
            dataKey="servo_power_time"
            name="Servo Power Time"
            fill="#4ECDC4"
          />
          <Bar dataKey="playback_time" name="Playback Time" fill="#45B7D1" />
          <Bar dataKey="moving_time" name="Moving Time" fill="#96CEB4" />
          <Bar dataKey="operating_time" name="Operating Time" fill="#D4A5A5" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  const renderTable = () => (
    <div className="max-h-[500px] overflow-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Control Power Time</TableHead>
            <TableHead>Servo Power Time</TableHead>
            <TableHead>Playback Time</TableHead>
            <TableHead>Moving Time</TableHead>
            <TableHead>Operating Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
            <TableRow key={index}>
              <TableCell>{new Date(item.timestamp).toLocaleString()}</TableCell>
              <TableCell>{item.control_power_time}</TableCell>
              <TableCell>{item.servo_power_time}</TableCell>
              <TableCell>{item.playback_time}</TableCell>
              <TableCell>{item.moving_time}</TableCell>
              <TableCell>{item.operating_time}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const renderTotal = () => {
    // Son veriyi al
    const lastData = data[data.length - 1];

    return (
      <div className="max-h-[500px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              <TableHead>Total Time</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Control Power Time</TableCell>
              <TableCell>{lastData?.control_power_time || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Servo Power Time</TableCell>
              <TableCell>{lastData?.servo_power_time || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Playback Time</TableCell>
              <TableCell>{lastData?.playback_time || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Moving Time</TableCell>
              <TableCell>{lastData?.moving_time || 0}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Operating Time</TableCell>
              <TableCell>{lastData?.operating_time || 0}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <Card className="p-4">
      {viewType === "line" && renderLineChart()}
      {viewType === "bar" && renderBarChart()}
      {viewType === "table" && renderTable()}
      {viewType === "total" && renderTotal()}
    </Card>
  );
};

export default UtilizationChart;
