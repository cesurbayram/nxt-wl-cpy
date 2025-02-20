"use client";

import { useState, useEffect } from "react";
import UtilizationChart from "./utilization-chart";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getControllerById } from "@/utils/service/controller";
import { getUtilizationData } from "@/utils/service/utilization";

const tabItems = [
  {
    label: "Chart",
    value: "chart",
  },
  // {
  //   label: "Live",
  //   value: "live",
  // },
];

const timeRanges = [
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "Last 3 months", value: "3m" },
];

const intervals = [
  { label: "5min", value: "5min" },
  { label: "Hour", value: "hour" },
  { label: "Day", value: "day" },
  { label: "Week", value: "week" },
  { label: "Month", value: "month" },
];

const viewTypes = [
  { label: "Line", value: "line" },
  { label: "Bar", value: "bar" },
  { label: "Table", value: "table" },
  { label: "Total", value: "total" },
];

interface UtilizationProps {
  controllerId: string;
}

const Utilization = ({ controllerId }: UtilizationProps) => {
  const [activeTab, setActiveTab] = useState("chart");
  const [timeRange, setTimeRange] = useState("7d");
  const [interval, setInterval] = useState("5min");
  const [viewType, setViewType] = useState("line");

  // React Query yerine useState kullanımı
  const [controller, setController] = useState<any>(null);
  const [utilizationData, setUtilizationData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Controller verilerini getir
  useEffect(() => {
    const fetchController = async () => {
      try {
        const data = await getControllerById(controllerId);
        setController(data);
      } catch (error) {
        console.error("Error fetching controller:", error);
      }
    };

    fetchController();
  }, [controllerId]);

  // Utilization verilerini getir
  useEffect(() => {
    const fetchUtilizationData = async () => {
      setIsLoading(true);
      try {
        const data = await getUtilizationData(
          controllerId,
          timeRange,
          interval
        );
        setUtilizationData(data);
      } catch (error) {
        console.error("Error fetching utilization data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUtilizationData();
  }, [controllerId, timeRange, interval]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Tabs
      defaultValue="chart"
      className="grid grid-cols-5 gap-3"
      orientation="vertical"
      onValueChange={(value) => setActiveTab(value)}
    >
      <TabsList className="flex flex-col h-fit border-2 gap-1">
        {tabItems.map((item) => (
          <TabsTrigger key={item.value} value={item.value} className="w-full">
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="chart" className="col-span-4">
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="text-sm font-medium">
                Utilization: {controller?.name || "Loading..."}
              </div>
            </CardTitle>
            <div className="flex gap-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  {timeRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={interval} onValueChange={setInterval}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select interval" />
                </SelectTrigger>
                <SelectContent>
                  {intervals.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={viewType} onValueChange={setViewType}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select view type" />
                </SelectTrigger>
                <SelectContent>
                  {viewTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {utilizationData && (
              <UtilizationChart data={utilizationData} viewType={viewType} />
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="live" className="col-span-4">
        <Card>
          <CardHeader>
            <CardTitle>
              <div className="text-sm font-medium">
                Live Utilization: {controller?.name || "Loading..."}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Live view içeriği buraya eklenecek */}
            <div>Live view implementation...</div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default Utilization;
