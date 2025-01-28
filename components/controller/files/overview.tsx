"use client";

import React from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRangePicker } from "@/components/controller/files/ui/date-range-picker";
import { BackupFile } from "@/types/files.types";
import { Card } from "@/components/ui/card";
import { DateRange } from "react-day-picker";

interface OverviewProps {
  files: BackupFile[];
  selectedDate: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
}

export function Overview({ files, selectedDate, onDateChange }: OverviewProps) {
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });

  const successCount = files.filter((f) => f.status === "SUCCESS").length;
  const errorCount = files.filter((f) => f.status === "ERROR").length;
  const inProgressCount = files.filter(
    (f) => f.status === "IN_PROGRESS"
  ).length;
  const partialCount = files.filter((f) => f.status === "PARTIAL").length;

  const handleSelect = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from) {
      onDateChange(range.from);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <DateRangePicker value={dateRange} onChange={handleSelect} />
        <Button
          variant="outline"
          onClick={() => {
            setDateRange(undefined);
            onDateChange(undefined);
          }}
        >
          <span className="text-sm font-medium">Clear filters</span>
        </Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview" className="text-sm font-medium">
            Overview
          </TabsTrigger>
          <TabsTrigger value="plans" className="text-sm font-medium">
            Plans
          </TabsTrigger>
          <TabsTrigger value="tools" className="text-sm font-medium">
            Tools
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card className="p-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm font-medium">
                  Başarılı: {successCount}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm font-medium">
                  Hatalı: {errorCount}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm font-medium">
                  İşlemde: {inProgressCount}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="text-sm font-medium">
                  Kısmi: {partialCount}
                </span>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6">
        <Calendar
          mode="range"
          selected={dateRange}
          onSelect={handleSelect}
          numberOfMonths={1}
          className="rounded-md border"
        />
      </div>
    </div>
  );
}
