"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  getBackupFiles,
  getBackupPlans,
  getBackupHistory,
} from "@/utils/service/files";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Overview } from "./overview";
import Plans from "./plans";
import { Explorer } from "./explorer";

const tabItems = [
  {
    label: "Overview",
    value: "overview",
  },
  {
    label: "Plans",
    value: "plans",
  },
  {
    label: "Explorer",
    value: "explorer",
  },
];

interface FilesProps {
  controllerId: string;
}

export function Files({ controllerId }: FilesProps) {
  const [selectedDate, setSelectedDate] = useState<Date>();

  const filesQuery = useQuery({
    queryKey: ["backup-files", controllerId, selectedDate],
    queryFn: () => getBackupFiles(controllerId, selectedDate),
    staleTime: 1000 * 60,
  });

  const plansQuery = useQuery({
    queryKey: ["backup-plans", controllerId],
    queryFn: () => getBackupPlans(controllerId),
    staleTime: 1000 * 60,
  });

  const historyQuery = useQuery({
    queryKey: ["backup-history", controllerId],
    queryFn: () => getBackupHistory(controllerId),
    staleTime: 1000 * 60,
  });

  if (filesQuery.isLoading || plansQuery.isLoading || historyQuery.isLoading) {
    return <div className="text-sm font-medium">Loading...</div>;
  }

  return (
    <Tabs
      defaultValue="overview"
      className="grid grid-cols-5 gap-3"
      orientation="vertical"
    >
      <TabsList className="flex flex-col h-fit border-2 gap-1">
        {tabItems.map((item) => (
          <TabsTrigger
            key={item.value}
            value={item.value}
            className="w-full text-sm font-medium"
          >
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="overview" className="col-span-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              Files Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Overview
              files={filesQuery.data || []}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="plans" className="col-span-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Backup Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <Plans
              controllerId={controllerId}
              plans={plansQuery.data || []}
              isLoading={plansQuery.isLoading}
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="explorer" className="col-span-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">File Explorer</CardTitle>
          </CardHeader>
          <CardContent>
            <Explorer
              files={filesQuery.data || []}
              isLoading={filesQuery.isLoading}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

export default Files;
