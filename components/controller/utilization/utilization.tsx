"use client";

import { useState, useEffect } from "react";
import UtilizationChart from "./utilization-chart";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { getControllerById } from "@/utils/service/controller";
import { getUtilizationData } from "@/utils/service/utilization";

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
  const [timeRange, setTimeRange] = useState("7d");
  const [interval, setInterval] = useState("5min");
  const [viewType, setViewType] = useState("line");

  const [controller, setController] = useState<any>(null);
  const [utilizationData, setUtilizationData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchController = async () => {
    try {
      const data = await getControllerById(controllerId);
      setController(data);
    } catch (error) {
      console.error("Error fetching controller:", error);
    }
  };

  const fetchUtilizationData = async (isInitialLoad: boolean = false, isRefresh: boolean = false) => {
    if (isInitialLoad) {
      setIsLoading(true);
    }
    if (isRefresh) {
      setIsRefreshing(true);
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
      if (isRefresh) {
        setIsRefreshing(false);
      }
    }
  };

  const handleRefresh = () => {
    fetchUtilizationData(false, true);
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
    <div className="w-full">
          <Card>
            <CardHeader>
              <CardTitle>
                <div className="text-sm font-medium">
                  Utilization: {controller?.name || "Loading..."}
                </div>
              </CardTitle>
              <div className="flex gap-4 items-center">
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

                <Button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {utilizationData && (
                <UtilizationChart data={utilizationData} viewType={viewType} />
              )}
            </CardContent>
          </Card>
    </div>
  );
};

export default Utilization;
