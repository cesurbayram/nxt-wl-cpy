"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabsContent } from "@radix-ui/react-tabs";
import { useState, useEffect } from "react";
import { getAlarmsByControllerId } from "@/utils/service/alarm";
import AlarmList from "./alarm-list";
import { Alarm } from "@/types/alarm.types";

const tabItems = [
  {
    label: "Detected",
    value: "detected",
  },
  {
    label: "ALMHIST.DAT",
    value: "almhist",
  },
];

const AlarmTabs = ({ controllerId }: { controllerId: string }) => {
  const [activeTab, setActiveTab] = useState("detected");
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (controllerId && activeTab) {
      setIsLoading(true);
      setError(null);

      getAlarmsByControllerId(controllerId, activeTab)
        .then((data) => {
          setAlarms(data);
          setIsLoading(false);
        })
        .catch((err) => {
          setError(err);
          setIsLoading(false);
        });
    }
  }, [controllerId, activeTab]);

  return (
    <Tabs
      defaultValue="detected"
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

      {tabItems.map((item) => (
        <TabsContent value={item.value} key={item.value} className="col-span-4">
          {activeTab === item.value && (
            <>
              {isLoading && <p>Loading...</p>}
              {error && <p>Error: {error.message}</p>}
              {!isLoading && !error && (
                <AlarmList alarms={alarms} activeTab={activeTab} />
              )}
            </>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default AlarmTabs;
