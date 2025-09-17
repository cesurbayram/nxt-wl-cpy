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
import Timer from "@/components/shared/timer";

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

  const [controller, setController] = useState<any>(null);
  const [utilizationData, setUtilizationData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchController = async () => {
    try {
      const data = await getControllerById(controllerId);
      setController(data);
    } catch (error) {
      console.error("Error fetching controller:", error);
    }
  };

  const fetchUtilizationData = async (isInitialLoad: boolean = false) => {
    if (isInitialLoad) {
      setIsLoading(true);
    }
    try {
      const data = await getUtilizationData(controllerId, timeRange, interval);
      setUtilizationData(data);
    } catch (error) {
      console.error("Error fetching utilization data:", error);
    } finally {
      if (isInitialLoad) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchController();
  }, [controllerId]);

  useEffect(() => {
    fetchUtilizationData(true);
  }, [controllerId, timeRange, interval]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Tabs
      defaultValue="chart"
      className="flex flex-col lg:grid lg:grid-cols-5 gap-3"
      orientation="vertical"
      onValueChange={(value) => setActiveTab(value)}
    >
      <div className="flex flex-col gap-4 lg:col-span-1">
        <div className="overflow-x-auto lg:overflow-x-visible">
          <TabsList className="flex lg:flex-col h-fit border-2 gap-1 w-full lg:w-auto">
            {tabItems.map((item) => (
              <TabsTrigger
                key={item.value}
                value={item.value}
                className="w-full whitespace-nowrap px-2 lg:px-4 flex-shrink-0"
              >
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <div className="w-full px-2 lg:px-6 mb-2">
          <Timer callback={() => fetchUtilizationData(false)} />
        </div>
      </div>

      <div className="lg:col-span-4">
        <TabsContent value="chart" className="mt-4 lg:mt-0">
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

        <TabsContent value="live" className="mt-4 lg:mt-0">
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="text-sm font-medium">
                  Live Utilization: {controller?.name || "Loading..."}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>Live view implementation...</div>
            </CardContent>
          </Card>
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default Utilization;
